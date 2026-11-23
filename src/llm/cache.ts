/**
 * 生成内容缓存：相同（题目 + 代码 + 语言）直接复用上次插桩结果，
 * 省一次模型调用与等待。内存 + localStorage 双层，带 TTL 与容量上限。
 * 存储不可用（隐私模式 / 非浏览器）时静默降级为纯内存。
 */
import type { InstrumentResult } from '../types'

const KEY = 'algomotion:gen-cache:v1'
const MAX_ENTRIES = 20
const TTL_MS = 7 * 24 * 3600 * 1000

interface Entry {
  result: InstrumentResult
  at: number
}

type Store = Record<string, Entry>

let memory: Store | null = null

function load(): Store {
  if (memory) return memory
  memory = {}
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        memory = parsed as Store
      }
    }
  } catch {
    /* 存储不可用或脏数据：从空开始 */
  }
  return memory
}

function persist(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* 存储不可用：仅内存生效 */
  }
}

/** 稳定哈希（djb2），用于缓存键 */
function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

export function cacheKey(problem: string, code: string, language: string): string {
  return hash(`${problem.trim()}\u0001${code.trim()}\u0001${language}`)
}

export function getCached(key: string, now = Date.now()): InstrumentResult | null {
  const store = load()
  const entry = store[key]
  if (!entry) return null
  if (now - entry.at > TTL_MS) {
    delete store[key]
    persist(store)
    return null
  }
  return entry.result
}

export function putCached(key: string, result: InstrumentResult, now = Date.now()): void {
  const store = load()
  store[key] = { result, at: now }
  const keys = Object.keys(store)
  if (keys.length > MAX_ENTRIES) {
    keys
      .sort((a, b) => (store[a]?.at ?? 0) - (store[b]?.at ?? 0))
      .slice(0, keys.length - MAX_ENTRIES)
      .forEach((k) => delete store[k])
  }
  persist(store)
}

/** 测试用：清空缓存 */
export function clearCache(): void {
  memory = {}
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}