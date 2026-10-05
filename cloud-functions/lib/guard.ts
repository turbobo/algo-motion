/**
 * 云函数入口防护层（无状态部署下的最小可行防护，纯逻辑可测）
 *
 * 背景：/api/instrument 是公开 POST 端点，烧的是服务主账号的模型配额。
 * EdgeOne 函数没有会话与用户体系，所以这里只做三件确定有效的事：
 * 1. 来源校验 —— 同源放行；跨源只认 INSTRUMENT_ALLOWED_ORIGINS 白名单，
 *    不再对任意站点返回 `access-control-allow-origin: *`
 * 2. 频率限制 —— 按客户端标识的固定窗口计数（进程内，实例销毁即重置，
 *    目的是挡住脚本刷配额，不追求跨实例精确）
 * 3. 请求体上限 —— content-length 预检 + 实际字符数复检（防伪造头部）
 *
 * 需要更强保护请叠加平台侧能力（EdgeOne 频次控制 / WAF / 自定义签名），
 * 前端可知的密钥写进 bundle 等于公开，不作为防线。
 */

/** 请求体字节上限（题目+代码各 8000 字符，留足 JSON 与中文 UTF-8 余量） */
export const MAX_BODY_BYTES = 64 * 1024
/** 默认频率上限：每客户端标识每小时 */
export const DEFAULT_RATE_LIMIT_PER_HOUR = 30
/** 限流桶数量上限（防被伪造 IP 撑爆内存） */
export const DEFAULT_MAX_BUCKETS = 4000

const IP_HEADERS = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'x-client-ip']

export interface GuardConfig {
  /** 跨源白名单（已归一化，小写、无尾部斜杠）；空数组表示只允许同源 */
  allowedOrigins: string[]
  /** 每客户端标识每小时允许的请求数 */
  rateLimitPerHour: number
}

export function resolveGuard(env: Record<string, string | undefined>): GuardConfig {
  const parsed = Number(env.INSTRUMENT_RATE_LIMIT_PER_HOUR)
  const limit = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_RATE_LIMIT_PER_HOUR
  return {
    allowedOrigins: parseOrigins(env.INSTRUMENT_ALLOWED_ORIGINS),
    rateLimitPerHour: limit,
  }
}

/** 归一化单个 origin：小写、去空格、去尾部斜杠与路径 */
export function normalizeOrigin(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    const host = url.host.toLowerCase()
    return host ? `https://${host}` : ''
  } catch {
    return trimmed.replace(/\/+$/, '')
  }
}

/** 解析白名单（逗号/空格/分号分隔） */
export function parseOrigins(value: string | undefined): string[] {
  if (!value) return []
  const out = new Set<string>()
  for (const part of value.split(/[,;\s]+/)) {
    const normalized = normalizeOrigin(part)
    if (normalized) out.add(normalized)
  }
  return [...out]
}

/** 从函数自身 URL 推出同源 origin（EdgeOne 传入 event.url / request.url） */
export function selfOrigin(url: string | undefined): string {
  if (!url) return ''
  try {
    return normalizeOrigin(new URL(url).origin)
  } catch {
    return ''
  }
}

/**
 * 来源判定：
 * - 无 Origin（curl / 服务端调用 / 部分浏览器同源的 GET）→ 放行，交给限流兜底
 * - Origin 等于本函数 origin → 同源放行
 * - 命中白名单 → 放行
 */
export function isOriginAllowed(
  origin: string | null,
  self: string,
  allowed: readonly string[],
): boolean {
  if (!origin) return true
  const normalized = normalizeOrigin(origin)
  if (!normalized) return false
  if (self && normalized === self) return true
  return allowed.includes(normalized)
}

/** 客户端标识：优先代理链第一跳 */
export function clientKey(headers: { get(name: string): string | null }): string {
  for (const name of IP_HEADERS) {
    const value = headers.get(name)
    if (!value) continue
    const first = value.split(',')[0]?.trim()
    if (first) return first.slice(0, 64)
  }
  return 'unknown'
}

// ===== 固定窗口限流（纯函数，桶由调用方持有） =====

export interface RateBucket {
  /** 窗口起点（毫秒） */
  start: number
  count: number
}

export interface RateResult {
  allowed: boolean
  /** 建议的 Retry-After 秒数 */
  retryAfterSec: number
  /** 本窗口剩余配额 */
  remaining: number
}

export interface RateOptions {
  limit: number
  windowMs: number
  now: number
  maxBuckets?: number
}

/**
 * 消费一次配额。传入同一个 store 即为同一个计数域。
 * 顺带做惰性清理：过期窗口释放，桶数超预算时按插入顺序淘汰最旧的。
 */
export function checkRateLimit(
  store: Map<string, RateBucket>,
  key: string,
  options: RateOptions,
): RateResult {
  const { limit, windowMs, now } = options
  const bucket = store.get(key)
  if (!bucket || now - bucket.start >= windowMs) {
    store.set(key, { start: now, count: 1 })
    prune(store, now, windowMs, options.maxBuckets ?? DEFAULT_MAX_BUCKETS)
    return { allowed: true, retryAfterSec: 0, remaining: Math.max(limit - 1, 0) }
  }
  if (bucket.count >= limit) {
    const elapsed = now - bucket.start
    const retryAfterSec = Math.max(Math.ceil((windowMs - elapsed) / 1000), 1)
    return { allowed: false, retryAfterSec, remaining: 0 }
  }
  bucket.count++
  prune(store, now, windowMs, options.maxBuckets ?? DEFAULT_MAX_BUCKETS)
  return { allowed: true, retryAfterSec: 0, remaining: Math.max(limit - bucket.count, 0) }
}

function prune(store: Map<string, RateBucket>, now: number, windowMs: number, maxBuckets: number): void {
  if (store.size <= maxBuckets) {
    // 只有确实超量时才扫描，避免每次请求都全表遍历
    if (store.size < 128) return
    for (const [key, bucket] of store) {
      if (now - bucket.start >= windowMs) store.delete(key)
    }
    return
  }
  for (const [key, bucket] of store) {
    if (now - bucket.start >= windowMs) store.delete(key)
  }
  while (store.size > maxBuckets) {
    const oldest = store.keys().next()
    if (oldest.done) break
    store.delete(oldest.value)
  }
}

/** 请求体大小预检（content-length 可伪造，仅作快速拒绝；复检在调用方做） */
export function bodyTooLarge(headers: { get(name: string): string | null }): boolean {
  const declared = Number(headers.get('content-length'))
  return Number.isFinite(declared) && declared > MAX_BODY_BYTES
}

/** 上游错误透传给客户端前的脱敏：抹掉 API Key 形态的串并截断 */
export function redactSecrets(text: string, max = 200): string {
  const masked = text
    .replace(/sk-[A-Za-z0-9_-]{6,}/g, 'sk-[已隐藏]')
    .replace(/Bearer\s+[A-Za-z0-9._-]{6,}/gi, 'Bearer [已隐藏]')
    .replace(/\s+/g, ' ')
    .trim()
  return masked.length > max ? `${masked.slice(0, max)}…` : masked
}
