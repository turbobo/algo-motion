/**
 * EdgeOne Cloud Functions 入口：/api/instrument
 * 请求：POST JSON { problem, code, language? }
 * 响应：200 { fnName, summary, cleanCode, instrumentedCode } | 400/500/502/504 { error }
 */
import { InstrumentError, instrumentSolution } from '../lib/instrument'

/** EdgeOne 函数上下文最小类型（实际运行时含 params/env 等更多字段） */
interface InstrumentContext {
  request: Request
}

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  })
}

interface RequestBody {
  problem?: string
  code?: string
  language?: string
}

/** 请求入口（EdgeOne 云函数：命名导出 onRequest，同时默认导出兼容两种约定） */
export async function onRequest(context: InstrumentContext): Promise<Response> {
  const { request } = context
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (request.method !== 'POST') {
    return json({ error: '仅支持 POST' }, 405)
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400)
  }

  // 支持 SENSENOVA_API_KEY（商汤日日新，优先）与 DASHSCOPE_API_KEY（回退），见 lib/instrument.ts
  const env = typeof process !== 'undefined' ? process.env : {}
  try {
    const result = await instrumentSolution(env, {
      problem: body.problem ?? '',
      code: body.code ?? '',
      language: body.language,
    })
    return json(result)
  } catch (e) {
    if (e instanceof InstrumentError) return json({ error: e.message }, e.status)
    return json({ error: e instanceof Error ? e.message : '插桩失败' }, 502)
  }
}

export default onRequest
