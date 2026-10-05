/**
 * 云函数入口防护测试：来源、限流、体积、脱敏。
 * /api/instrument 是公开端点且消耗模型配额，这些判定必须有确定性回归。
 */
import { describe, expect, it } from 'vitest'
import {
  bodyTooLarge,
  checkRateLimit,
  clientKey,
  isOriginAllowed,
  MAX_BODY_BYTES,
  normalizeOrigin,
  parseOrigins,
  redactSecrets,
  resolveGuard,
  selfOrigin,
  type RateBucket,
} from '../cloud-functions/lib/guard'

const headersOf = (init: Record<string, string>): { get(name: string): string | null } => ({
  get: (name: string) => init[name.toLowerCase()] ?? null,
})

describe('normalizeOrigin / parseOrigins', () => {
  it('大小写、尾部斜杠、多余路径统一成 https://host', () => {
    expect(normalizeOrigin('HTTPS://Example.COM:8443/some/path/')).toBe('https://example.com:8443')
    expect(normalizeOrigin('example.com')).toBe('https://example.com')
    expect(normalizeOrigin('   ')).toBe('')
  })

  it('白名单支持逗号 / 分号 / 空格混排并去重', () => {
    expect(parseOrigins('https://a.com, https://a.com/ ;https://b.com')).toEqual([
      'https://a.com',
      'https://b.com',
    ])
    expect(parseOrigins(undefined)).toEqual([])
  })
})

describe('resolveGuard：环境变量', () => {
  it('默认每小时 30 次，可被覆盖且拒绝非法值', () => {
    expect(resolveGuard({}).rateLimitPerHour).toBe(30)
    expect(resolveGuard({ INSTRUMENT_RATE_LIMIT_PER_HOUR: '5' }).rateLimitPerHour).toBe(5)
    expect(resolveGuard({ INSTRUMENT_RATE_LIMIT_PER_HOUR: '0' }).rateLimitPerHour).toBe(30)
    expect(resolveGuard({ INSTRUMENT_RATE_LIMIT_PER_HOUR: 'abc' }).rateLimitPerHour).toBe(30)
    expect(resolveGuard({ INSTRUMENT_RATE_LIMIT_PER_HOUR: '-3' }).rateLimitPerHour).toBe(30)
  })

  it('小数上限向下取整（避免 1.9 被当成 1 次以外的语义）', () => {
    expect(resolveGuard({ INSTRUMENT_RATE_LIMIT_PER_HOUR: '12.7' }).rateLimitPerHour).toBe(12)
  })
})

describe('isOriginAllowed', () => {
  const self = 'https://algo.example.com'

  it('同源放行', () => {
    expect(isOriginAllowed(self, self, [])).toBe(true)
    expect(isOriginAllowed(`${self}/`, self, [])).toBe(true)
  })

  it('白名单内的跨源放行，白名单外拒绝', () => {
    expect(isOriginAllowed('https://partner.com', self, ['https://partner.com'])).toBe(true)
    expect(isOriginAllowed('https://evil.com', self, ['https://partner.com'])).toBe(false)
  })

  it('无 Origin（curl / 服务端直调）放行，由限流兜底', () => {
    expect(isOriginAllowed(null, self, [])).toBe(true)
  })

  it('本函数 origin 未知时不放行任意跨源', () => {
    expect(isOriginAllowed('https://anything.com', '', [])).toBe(false)
  })
})

describe('selfOrigin / clientKey', () => {
  it('从请求 URL 推出同源 origin', () => {
    expect(selfOrigin('https://algo.example.com/api/instrument?a=1')).toBe('https://algo.example.com')
    expect(selfOrigin(undefined)).toBe('')
    expect(selfOrigin('not a url')).toBe('')
  })

  it('x-forwarded-for 取第一跳，缺失时退到 unknown', () => {
    expect(clientKey(headersOf({ 'x-forwarded-for': ' 1.2.3.4 , 5.6.7.8 ' }))).toBe('1.2.3.4')
    expect(clientKey(headersOf({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9')
    expect(clientKey(headersOf({}))).toBe('unknown')
  })

  it('伪造超长头部不会撑爆桶键', () => {
    expect(clientKey(headersOf({ 'x-forwarded-for': 'a'.repeat(300) })).length).toBeLessThanOrEqual(64)
  })
})

describe('checkRateLimit：固定窗口', () => {
  const HOUR = 3_600_000
  const base = { limit: 3, windowMs: HOUR, now: 0 }

  it('配额内逐个放行，超限拒绝并给出 Retry-After', () => {
    const store = new Map<string, RateBucket>()
    expect(checkRateLimit(store, 'ip', base).remaining).toBe(2)
    expect(checkRateLimit(store, 'ip', { ...base, now: 1000 }).remaining).toBe(1)
    expect(checkRateLimit(store, 'ip', { ...base, now: 2000 }).remaining).toBe(0)
    const blocked = checkRateLimit(store, 'ip', { ...base, now: 3000 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSec).toBeCloseTo(HOUR / 1000 - 3, 0)
  })

  it('窗口滚过后重新计满', () => {
    const store = new Map<string, RateBucket>()
    for (let i = 0; i < 3; i++) checkRateLimit(store, 'ip', base)
    expect(checkRateLimit(store, 'ip', { ...base, now: 3000 }).allowed).toBe(false)
    expect(checkRateLimit(store, 'ip', { ...base, now: HOUR }).allowed).toBe(true)
  })

  it('不同客户端互不影响', () => {
    const store = new Map<string, RateBucket>()
    for (let i = 0; i < 3; i++) checkRateLimit(store, 'a', base)
    expect(checkRateLimit(store, 'a', base).allowed).toBe(false)
    expect(checkRateLimit(store, 'b', base).allowed).toBe(true)
  })

  it('桶数超预算时淘汰，不无限增长', () => {
    const store = new Map<string, RateBucket>()
    for (let i = 0; i < 50; i++) {
      checkRateLimit(store, `ip-${i}`, { limit: 5, windowMs: HOUR, now: i, maxBuckets: 10 })
    }
    expect(store.size).toBeLessThanOrEqual(10)
  })

  it('过期桶按惰性策略回收：量小不动，够大才扫（避免每请求全表遍历）', () => {
    const store = new Map<string, RateBucket>()
    checkRateLimit(store, 'old', { limit: 5, windowMs: 1000, now: 0 })
    // 只有 1 个桶时不扫描，过期项留着等下次覆写或达到阈值再清
    checkRateLimit(store, 'new', { limit: 5, windowMs: 1000, now: 5000, maxBuckets: 1000 })
    expect(store.has('old')).toBe(true)

    // 攒到阈值以上，下一次调用把全部过期桶扫掉
    for (let i = 0; i < 140; i++) checkRateLimit(store, `ip-${i}`, { limit: 5, windowMs: 1000, now: 0 })
    checkRateLimit(store, 'trigger', { limit: 5, windowMs: 1000, now: 5000, maxBuckets: 1000 })
    // 只剩本窗口内的两个：new 与 trigger；140 个过期桶与 old 全部回收
    expect([...store.keys()].sort()).toEqual(['new', 'trigger'])
  })

  it('同一个键在窗口滚过后原地覆盖旧桶，不会累积', () => {
    const store = new Map<string, RateBucket>()
    checkRateLimit(store, 'ip', { limit: 5, windowMs: 1000, now: 0 })
    checkRateLimit(store, 'ip', { limit: 5, windowMs: 1000, now: 2000 })
    expect(store.size).toBe(1)
    expect(store.get('ip')?.start).toBe(2000)
  })
})

describe('bodyTooLarge / redactSecrets', () => {
  it('content-length 超上限即拒，缺失或非数字放行交给复检', () => {
    expect(bodyTooLarge(headersOf({ 'content-length': String(MAX_BODY_BYTES + 1) }))).toBe(true)
    expect(bodyTooLarge(headersOf({ 'content-length': '1024' }))).toBe(false)
    expect(bodyTooLarge(headersOf({}))).toBe(false)
    expect(bodyTooLarge(headersOf({ 'content-length': 'abc' }))).toBe(false)
  })

  it('抹掉 sk- 与 Bearer 形态的密钥，并截断长文', () => {
    expect(redactSecrets('bad key sk-abcdef123456 rejected')).toBe('bad key sk-[已隐藏] rejected')
    expect(redactSecrets('header: Bearer xyz.abc.123456 failed')).toBe('header: Bearer [已隐藏] failed')
    const long = redactSecrets('x'.repeat(500), 100)
    expect(long.length).toBeLessThanOrEqual(101)
    expect(long.endsWith('…')).toBe(true)
  })

  it('折叠换行与多余空白（上游错误体常是多行 JSON）', () => {
    expect(redactSecrets('{\n  "error":   "oops"\n}')).toBe('{ "error": "oops" }')
  })
})
