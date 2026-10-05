/**
 * 模型服务 Provider 测试：环境变量解析、请求体构造（商汤网关约束）、错误映射。
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildRequestBody,
  instrumentSolution,
  resolveProvider,
  silentLog,
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

  it('429 → 退避重试到预算用尽，状态码原样透传', async () => {
    const fetchMock = vi.fn().mockImplementation(async () =>
      new Response('{"error":{"message":"rate limited"}}', { status: 429 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const waits: number[] = []
    await expect(
      instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req, {
        log: silentLog,
        sleep: async (ms) => {
          waits.push(ms)
        },
      }),
    ).rejects.toMatchObject({ status: 429 })
    // 首次 + 两次退避重试；等待时长取自退避表而不是随机数
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(waits).toEqual([800, 2500])
  })

  it('401 → 鉴权失败（映射为 502）且不重试', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('unauthorized', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req, { log: silentLog }),
    ).rejects.toMatchObject({ status: 502, retryable: false })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('未配置任何 Key → 500', async () => {
    await expect(instrumentSolution({}, req, { log: silentLog })).rejects.toMatchObject({ status: 500 })
  })

  it('429 之后恢复：第二次调用即成功返回', async () => {
    const okResponse = (): Response =>
      new Response(JSON.stringify({ choices: [{ message: { content: validContent } }] }), { status: 200 })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"error":{"message":"slow down"}}', { status: 429 }))
      .mockResolvedValueOnce(okResponse())
    vi.stubGlobal('fetch', fetchMock)
    const out = await instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req, {
      log: silentLog,
      sleep: async () => undefined,
    })
    expect(out.fnName).toBe('solve')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('输出不合格 → 把原因回灌给模型再问一次', async () => {
    // 注意：这里 mock 的是「响应体合法、content 是散文」——真正的输出不合格分支；
    // 若响应体本身不是 JSON，走的是「模型调用失败」分支（可重试但不回灌原因）
    const asContent = (text: string): Response =>
      new Response(JSON.stringify({ choices: [{ message: { content: text } }] }), { status: 200 })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(asContent('抱歉，我直接给你一段散文，不是 JSON'))
      .mockResolvedValueOnce(asContent(validContent))
    vi.stubGlobal('fetch', fetchMock)
    await instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req, { log: silentLog, sleep: async () => {} })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const call = fetchMock.mock.calls[1] as [string, { body: string }]
    const second = JSON.parse(call[1].body) as {
      messages: Array<{ role: string; content: string }>
    }
    expect(second.messages).toHaveLength(3)
    expect(second.messages[2]?.content).toContain('你上一次的输出不合格')
    expect(second.messages[2]?.content).toContain('不是合法 JSON')
  })

  it('总预算不足时不再发起新调用（不会把云函数跑到超时）', async () => {
    let clock = 0
    const fetchMock = vi.fn().mockImplementation(async () => {
      clock += 45_000 // 单次调用就吃掉 45s
      return new Response('{"error":{"message":"boom"}}', { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req, {
        log: silentLog,
        now: () => clock,
        sleep: async () => undefined,
      }),
    ).rejects.toMatchObject({ status: 502 })
    // 第一次用掉 45s 后剩余预算 < 12s 的最小可开阈值，必须停手而不是硬开到被平台掐断
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('上游 5xx 的错误体不外泄密钥形态字符串', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () =>
        new Response(
          '{"error":{"message":"quota exceeded for sk-abcdefghijklmnop1234"}}',
          { status: 503 },
        ),
      ),
    )
    await expect(
      instrumentSolution({ SENSENOVA_API_KEY: 'k' }, req, { log: silentLog, sleep: async () => {} }),
    ).rejects.toThrowError(/\[已隐藏\]/)
  })
})
