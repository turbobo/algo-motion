/**
 * 链路测试：插桩产物 → 沙箱执行 → 帧序列 → 行号解析。
 *
 * 内置样题的插桩代码与 LLM 产物格式完全一致，因此这批测试同时覆盖：
 * 1. 样题链路（无 API Key 时的兜底体验）
 * 2. LLM 输出格式的执行端行为（一旦模型输出符合协议，引擎必须能跑通）
 * 3. 服务端解析/校验函数的容错
 */
import { describe, expect, it } from 'vitest'
import { runInstrumented, stripInstrumentLines, resolveLineNumbers } from '../src/engine/protocol'
import { emptyDiagnostics, hasDiagnostics, sanitizeView } from '../src/engine/sanitize'

/** 便于在 Object.entries 循环里复用清洗层入口 */
function requireZero(): { sanitizeView: typeof sanitizeView; emptyDiagnostics: typeof emptyDiagnostics } {
  return { sanitizeView, emptyDiagnostics }
}
import { SAMPLES } from '../src/samples'
import { parseModelOutput, pickOutput } from '../cloud-functions/lib/instrument'

describe('内置样题：插桩产物可执行且帧可解析', () => {
  for (const sample of SAMPLES) {
    it(`${sample.title}`, () => {
      const run = runInstrumented({
        instrumentedCode: sample.result.instrumentedCode,
        fnName: sample.result.fnName,
      })
      expect(run.error).toBeUndefined()
      expect(run.ok).toBe(true)
      expect(run.tests.length).toBe(3)
      expect(run.tests.every((t) => t.passed)).toBe(true)

      // 第一个用例的帧：全部能锚定到展示代码行
      const frames = resolveLineNumbers(run.frameGroups[0] ?? [], sample.result.displayCode)
      expect(frames.length).toBeGreaterThan(3)
      expect(frames.filter((f) => f.line === null)).toEqual([])
      // 每帧都要有讲解与至少一个视图
      expect(frames.every((f) => f.msg.length > 0)).toBe(true)
      expect(frames.every((f) => Object.keys(f.views).length > 0)).toBe(true)
    })
  }
})

/**
 * 内置样题是「协议合规」的基准线：手写插桩代码必须一个异常都触不发，
 * 否则说明清洗层的判定尺度与 System Prompt / 渲染器约定不一致（先于 LLM 暴露问题）。
 */
describe('内置样题不应触发任何帧清洗', () => {
  for (const sample of SAMPLES) {
    it(`${sample.title}：诊断记录为空`, () => {
      const run = runInstrumented({
        instrumentedCode: sample.result.instrumentedCode,
        fnName: sample.result.fnName,
      })
      expect(run.ok).toBe(true)
      expect(hasDiagnostics(run.diagnostics)).toBe(false)
    })
  }

  it('七种视图 kind 全部被清洗层识别', () => {
    const minimal: Record<string, Record<string, unknown>> = {
      array: { kind: 'array', values: [1] },
      hashmap: { kind: 'hashmap', entries: [['a', '1']] },
      linkedlist: { kind: 'linkedlist', nodes: [{ id: 'n0', value: '1' }], next: [['n0', null]] },
      matrix: { kind: 'matrix', values: [[1]] },
      grid: { kind: 'grid', cells: [['1']] },
      stack: { kind: 'stack', items: [1] },
      tree: { kind: 'tree', nodes: [{ id: 'n0', value: '1' }], edges: [] },
    }
    const { sanitizeView, emptyDiagnostics } = requireZero()
    for (const [kind, raw] of Object.entries(minimal)) {
      const diag = emptyDiagnostics()
      const view = sanitizeView(raw, diag)
      expect(view?.kind, `${kind} 应被识别`).toBe(kind)
      expect(diag.repairedViews, `${kind} 干净数据不应被判修复`).toBe(0)
    }
  })
})

describe('stripInstrumentLines：剥离插桩行得到展示代码', () => {
  it('删除单行与跨行 __rec 调用，保留原代码', () => {
    const code = [
      'function f(a) {',
      '  __rec.step({',
      "    at: 'return a',",
      '    msg: `值 ${a}`',
      '  });',
      '  __rec.step({ at: "let x = 1", msg: "x" });',
      '  return a;',
      '}',
      '__rec.tests([]);',
    ].join('\n')
    const out = stripInstrumentLines(code)
    expect(out).not.toContain('__rec')
    expect(out).toContain('function f(a) {')
    expect(out).toContain('return a;')
  })

  it('不会误伤普通代码行', () => {
    const code = 'const s = "__rec.step(" ;\nfunction g() { return 1 }'
    const out = stripInstrumentLines(code)
    expect(out).toContain('function g()')
  })
})

describe('resolveLineNumbers：锚点顺序解析', () => {
  it('循环回绕时能回到前面的行', () => {
    const displayCode = ['function f() {', '  let i = 0;', '  while (i < 2) {', '    i++;', '  }', '}'].join(
      '\n',
    )
    const frames = resolveLineNumbers(
      [
        { at: 'let i = 0', msg: '', views: {} },
        { at: 'while (i < 2)', msg: '', views: {} },
        { at: 'i++', msg: '', views: {} },
        { at: 'while (i < 2)', msg: '', views: {} },
        { at: 'i++', msg: '', views: {} },
      ],
      displayCode,
    )
    expect(frames.map((f) => f.line)).toEqual([2, 3, 4, 3, 4])
  })

  it('锚点太短或找不到时 line 为 null', () => {
    const frames = resolveLineNumbers(
      [
        { at: '', msg: '', views: {} },
        { at: '不存在的代码片段', msg: '', views: {} },
      ],
      'const a = 1;',
    )
    expect(frames.map((f) => f.line)).toEqual([null, null])
  })
})

describe('服务端输出解析与校验', () => {
  const valid = {
    fnName: 'solve',
    summary: '测试',
    cleanCode: 'function solve() { return 1 }',
    instrumentedCode: 'function solve() { __rec.step({ at: "x" }); return 1 }\n__rec.tests([]);',
  }

  it('容忍 markdown 围栏与前后杂文本', () => {
    const wrapped = '好的，以下是结果：\n```json\n' + JSON.stringify(valid) + '\n```\n希望对你有帮助'
    expect(parseModelOutput(wrapped)).toMatchObject({ fnName: 'solve' })
  })

  it('非法 JSON 抛出 InstrumentError', () => {
    expect(() => parseModelOutput('not json at all')).toThrowError(/不是合法 JSON/)
  })

  it('缺少 __rec.step / __rec.tests 时拒绝', () => {
    expect(() => pickOutput({ ...valid, instrumentedCode: 'function solve() { return 1 }' })).toThrowError(
      /__rec.step/,
    )
    expect(() =>
      pickOutput({ ...valid, instrumentedCode: 'function solve() { __rec.step({}) }' }),
    ).toThrowError(/__rec.tests/)
  })

  it('cleanCode 混入 __rec 时置空（前端将走剥离兜底）', () => {
    const out = pickOutput({ ...valid, cleanCode: 'function solve() { __rec.step({}) }' })
    expect(out.cleanCode).toBe('')
  })
})
