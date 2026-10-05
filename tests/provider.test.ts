/**
 * 模型服务 Provider 测试：环境变量解析、请求体构造（商汤网关约束）、错误映射。
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildRequestBody,
  instrumentSolution,
  resolveProvider,
  type AIProviderConfig,
} from '../cloud-functions/lib/instrument'

describe('resolveProvider：环境变量驱动', () => {
  it('SENSENOVA_API_KEY 优先于 DASHSCOPE_API_KEY', () => {
    const p = resolveProvider({ SENSENOVA_API_KEY: 'sk-s', DASHSCOPE_API_KEY: 'sk-d' })
    expect(p?.name).toBe('sensenova')
    expect(p?.baseUrl).toBe('https://token.sensenova.cn/v1')
    expect(p?.model).toBe('deepseek-v4-flash')
    expect(p?.supportsJsonMode).toBe(false)
  })

  it('商汤 base/model 可经环境变量覆盖且去掉尾部斜杠', () => {
    const p = resolveProvider({
      SENSENOVA_API_KEY: 'k',
      SENSENOVA_BASE_URL: 'https://api.sensenova.cn/compatible-mode/v1///',
      SENSENOVA_MODEL: 'sensenova-6.7-flash-lite',
    })
    expect(p?.baseUrl).toBe('https://api.sensenova.cn/compatible-mode/v1')
    expect(p?.model).toBe('sensenova-6.7-flash-lite')
  })

  it('无商汤 Key 时回退 DashScope（支持 json mode）', () => {
    const p = resolveProvider({ DASHSCOPE_API_KEY: 'sk-d' })
    expect(p?.name).toBe('dashscope')
    expect(p?.supportsJsonMode).toBe(true)
  })

  it('都未配置或空白 → null', () => {
    expect(resolveProvider({})).toBeNull()
    expect(resolveProvider({ SENSENOVA_API_KEY: '  ', DASHSCOPE_API_KEY: '' })).toBeNull()
  })
})

describe('buildRequestBody：商汤网关最小集约束', () => {
  const base: AIProviderConfig = {
    name: 'sensenova',
    apiKey: 'k',
    baseUrl: 'https://token.sensenova.cn/v1',
    model: 'deepseek-v4-flash',
    supportsJsonMode: false,
  }

  it('商汤请求体不含 response_format（会被网关拒收），含 max_tokens', () => {
    const body = buildRequestBody(base, [{ role: 'user', content: 'hi' }])
    expect(body.response_format).toBeUndefined()
    expect(body.max_tokens).toBe(8192)
    expect(body.model).toBe('deepseek-v4-flash')
    expect(body.temperature).toBe(0.2)
  })

  it('DashScope 请求体带 response_format json_object', () => {
    const body = buildRequestBody({ ...base, name: 'dashscope', supportsJsonMode: true }, [])
    expect(body.response_format).toEqual({ type: 'json_object' })
  })
})

describe('instrumentSolution：调用与错误映射（mock fetch）', () => {
  const req = { problem: '题目', code: 'function solve() { return 1; }' }
  const validContent = JSON.stringify({
    fnName: 'solve',
    summary: '测试',
    cleanCode: 'function solve() { return 1; }',
    instrumentedCode:
      'function solve() { __rec.step({ at: "return 1" }); return 1; }\n__rec.tests([{ label: "t", run: function () {} }]);',
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('商汤路径：请求打到 token.sensenova.cn，成功返回组装结果', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: validContent } }] }), {
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const out = await instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req)
    expect(out.fnName).toBe('solve')
    const call = fetchMock.mock.calls[0] as [string, { body: string }]
    expect(call[0]).toBe('https://token.sensenova.cn/v1/chat/completions')
    const body = JSON.parse(call[1].body) as Record<string, unknown>
    expect(body.response_format).toBeUndefined()
  })

  it('429 → 限流提示（透传 429）', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"error":{"message":"rate limited"}}', { status: 429 })),
    )
    await expect(instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req)).rejects.toMatchObject({
      status: 429,
    })
  })

  it('401 → 鉴权失败（映射为 502）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('unauthorized', { status: 401 })))
    await expect(instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req)).rejects.toMatchObject({
      status: 502,
    })
  })

  it('未配置任何 Key → 500', async () => {
    await expect(instrumentSolution({}, req)).rejects.toMatchObject({ status: 500 })
  })
})
