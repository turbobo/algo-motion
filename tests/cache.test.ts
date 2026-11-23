/**
 * 生成缓存：键稳定、命中/未命中、TTL 过期、容量淘汰。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { cacheKey, clearCache, getCached, putCached } from '../src/llm/cache'
import type { InstrumentResult } from '../src/types'

const r = (fn: string): InstrumentResult => ({
  fnName: fn,
  summary: 's',
  instrumentedCode: 'x',
  displayCode: 'x',
})

beforeEach(() => clearCache())

describe('生成缓存', () => {
  it('键对相同输入稳定，对不同输入不同', () => {
    const a = cacheKey('p', 'code', 'javascript')
    const b = cacheKey(' p ', ' code ', 'javascript')
    expect(a).toBe(b)
    expect(cacheKey('p', 'code', 'python')).not.toBe(a)
    expect(cacheKey('p2', 'code', 'javascript')).not.toBe(a)
  })

  it('put 后可 get，未命中返回 null', () => {
    const k = cacheKey('p', 'c', 'js')
    expect(getCached(k)).toBeNull()
    putCached(k, r('twoSum'))
    expect(getCached(k)?.fnName).toBe('twoSum')
  })

  it('TTL 过期后返回 null', () => {
    const k = cacheKey('p', 'c', 'js')
    const t = 1_000_000
    putCached(k, r('f'), t)
    expect(getCached(k, t + 1000)?.fnName).toBe('f')
    expect(getCached(k, t + 8 * 24 * 3600 * 1000)).toBeNull()
  })

  it('超出容量淘汰最旧', () => {
    for (let i = 0; i < 25; i++) putCached(cacheKey('p', `c${i}`, 'js'), r(`f${i}`), 1000 + i)
    // 最旧的前 5 个被淘汰
    expect(getCached(cacheKey('p', 'c0', 'js'), 2000)).toBeNull()
    expect(getCached(cacheKey('p', 'c24', 'js'), 2000)?.fnName).toBe('f24')
  })
})