/**
 * EdgeOne Cloud Functions 入口：/api/instrument
 * 请求：POST JSON { problem, code, language? }
 * 响应：200 { fnName, summary, cleanCode, instrumentedCode } | 400/403/405/413/415/429/500/502/504 { error }
 *
 * 入口只做防护与协议转换，业务在 lib/instrument.ts；防护细节在 lib/guard.ts。
 * 这个端点消耗的是服务主的模型配额，因此不再对任意来源返回通配 CORS，
 * 并按客户端标识做进程内限流。
 */
import { InstrumentError, instrumentSolution } from '../lib/instrument'
import {
  MAX_BODY_BYTES,
  bodyTooLarge,
  checkRateLimit,
  clientKey,
  isOriginAllowed,
  normalizeOrigin,
  resolveGuard,
  selfOrigin,
  type RateBucket,
} from '../lib/guard'

/** EdgeOne 函数上下文最小类型（实际运行时含 params/env 等更多字段） */
interface InstrumentContext {
  request: Request
}

const HOUR_MS = 3_600_000

/** 进程内限流计数（实例复用期内有效；跨实例不共享，用于挡脚本刷配额已足够） */
const buckets = new Map<string, RateBucket>()

function readEnv(): Record<string, string | undefined> {
  return typeof process !== 'undefined' ? process.env : {}
}

interface CorsState {
  /** 需要回显的跨源 origin；同源或无 Origin 时为 null（不下发通配） */
  echo: string | null
}

function baseHeaders(cors: CorsState): Record<string, string> {
  const headers: Record<string, string> = {
    'x-content-type-options': 'nosniff',
    // 响应内容随来源变化，必须声明 Vary 以免 CDN 把 A 站的 CORS 头喂给 B 站
    vary: 'Origin',
  }
  if (cors.echo) {
    headers['access-control-allow-origin'] = cors.echo
    headers['access-control-allow-methods'] = 'POST, OPTIONS'
    headers['access-control-allow-headers'] = 'content-type'
    headers['access-control-max-age'] = '600'
  }
  return headers
}

function json(body: unknown, cors: CorsState, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...baseHeaders(cors) },
  })
}

interface RequestBody {
  problem?: string
  code?: string
  language?: string
}

/** 跨源时回显来源；白名单外的跨源请求由调用方拒绝（同源请求无需 CORS 头） */
function resolveCors(request: Request, allowed: string[]): { cors: CorsState; crossOrigin: boolean } {
  const origin = request.headers.get('origin')
  if (!origin) return { cors: { echo: null }, crossOrigin: false }
  const normalized = normalizeOrigin(origin)
  const self = selfOrigin(request.url)
  if (normalized && normalized === self) return { cors: { echo: null }, crossOrigin: false }
  if (isOriginAllowed(origin, self, allowed)) return { cors: { echo: normalized }, crossOrigin: true }
  return { cors: { echo: null }, crossOrigin: true }
}

export async function onRequest(context: InstrumentContext): Promise<Response> {
  const { request } = context
  const env = readEnv()
  const guard = resolveGuard(env)
  const { cors, crossOrigin } = resolveCors(request, guard.allowedOrigins)
  const origin = request.headers.get('origin')

  // 跨源且不在白名单：预检直接放行到 204（不带 ACAO，浏览器自然拦截），实请求明确 403
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: baseHeaders(cors) })
  }
  if (crossOrigin && !cors.echo) {
    return json({ error: '请求来源不被允许' }, cors, 403)
  }
  if (request.method !== 'POST') {
    return json({ error: '仅支持 POST' }, cors, 405)
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ error: 'content-type 必须是 application/json' }, cors, 415)
  }

  const rate = checkRateLimit(buckets, clientKey(request.headers), {
    limit: guard.rateLimitPerHour,
    windowMs: HOUR_MS,
    now: Date.now(),
  })
  if (!rate.allowed) {
    const response = json({ error: `请求过于频繁，请 ${rate.retryAfterSec}s 后再试` }, cors, 429)
    response.headers.set('retry-after', String(rate.retryAfterSec))
    return response
  }

  if (bodyTooLarge(request.headers)) {
    return json({ error: `请求体过大（上限 ${Math.round(MAX_BODY_BYTES / 1024)}KB）` }, cors, 413)
  }
  let body: RequestBody
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: `请求体过大（上限 ${Math.round(MAX_BODY_BYTES / 1024)}KB）` }, cors, 413)
    }
    body = JSON.parse(raw || '{}') as RequestBody
  } catch {
    return json({ error: '请求体不是合法 JSON' }, cors, 400)
  }

  // 支持 SENSENOVA_API_KEY（商汤日日新，优先）与 DASHSCOPE_API_KEY（回退），见 lib/instrument.ts
  try {
    const result = await instrumentSolution(env, {
      problem: body.problem ?? '',
      code: body.code ?? '',
      language: body.language,
    })
    return json(result, cors)
  } catch (e) {
    if (e instanceof InstrumentError) {
      const response = json({ error: e.message }, cors, e.status)
      if (e.status === 429) response.headers.set('retry-after', '60')
      return response
    }
    // 未知异常只回泛化文案，细节留服务端日志
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error('[instrument] 未处理异常', origin ?? '', e)
    }
    return json({ error: '插桩失败，请稍后重试' }, cors, 502)
  }
}

export default onRequest
