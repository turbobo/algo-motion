/**
 * 沙箱协议核心（纯逻辑，主线程与 Web Worker 两侧共用）
 *
 * 三个职责：
 * 1. runInstrumented —— 在隔离环境执行插桩代码：注入 __rec、运行测试、收集帧
 * 2. stripInstrumentLines —— 剥离 __rec 调用行，还原「展示代码」
 * 3. resolveLineNumbers —— 用 at 锚点在展示代码上顺序解析帧行号
 */
import type { Frame, RawFrame, RunResult, TestOutcome, TestSpec } from '../types'

// ===== Worker 消息协议 =====

export interface WorkerRequest {
  /** 插桩版代码（含 __rec.step / __rec.tests 调用） */
  instrumentedCode: string
  /** 入口函数名 */
  fnName: string
}

export interface WorkerResponse {
  result: RunResult
}

/** 单组帧数量上限（防插桩过密导致内存膨胀） */
export const MAX_FRAMES_PER_GROUP = 500

// ===== 工具 =====

export function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message
  return String(e)
}

/**
 * 从插桩代码剥离 __rec.* 调用行，得到展示代码。
 * - 判定：行 trim 后以 `__rec.` 开头（prompt 要求插桩以独立整行插入）
 * - 支持跨行调用：`__rec.step({` 起，按括号配对吃到闭合行
 */
export function stripInstrumentLines(code: string): string {
  const lines = code.split('\n')
  const kept: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    if (/^\s*__rec\.[A-Za-z_$][\w$]*\s*\(/.test(line)) {
      let depth = 0
      let j = i
      for (; j < lines.length; j++) {
        depth += bracketDelta(lines[j] ?? '')
        if (depth <= 0) break
      }
      i = j + 1
      continue
    }
    kept.push(line)
    i++
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** 行内括号净值（跳过字符串字面量） */
function bracketDelta(line: string): number {
  let delta = 0
  let quote: string | null = null
  for (let k = 0; k < line.length; k++) {
    const ch = line[k]
    if (quote) {
      if (ch === '\\') {
        k++
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '(' || ch === '{' || ch === '[') delta++
    else if (ch === ')' || ch === '}' || ch === ']') delta--
  }
  return delta
}

/** 归一化：去掉全部空白，用于宽松匹配 */
function normalize(s: string): string {
  return s.replace(/\s+/g, '')
}

/**
 * 用 at 锚点在展示代码上顺序解析行号。
 * 顺序前进（重复代码行取最近的后续命中），失败时全文回扫；仍失败则 line=null。
 */
export function resolveLineNumbers(frames: RawFrame[], displayCode: string): Frame[] {
  const lines = displayCode.split('\n').map(normalize)
  const result: Frame[] = []
  let cursor = 0
  for (const f of frames) {
    const at = normalize(f.at ?? '')
    let hit = -1
    if (at.length >= 2) {
      for (let i = cursor; i < lines.length; i++) {
        if ((lines[i] ?? '').includes(at)) {
          hit = i
          break
        }
      }
      if (hit === -1) {
        for (let i = 0; i < lines.length; i++) {
          if ((lines[i] ?? '').includes(at)) {
            hit = i
            break
          }
        }
      }
    }
    if (hit >= 0) cursor = hit
    result.push({ ...f, line: hit >= 0 ? hit + 1 : null })
  }
  return result
}

// ===== 沙箱执行核心 =====

interface RecorderState {
  frameGroups: RawFrame[][]
  tests: TestSpec[]
  active: number
}

/**
 * 在隔离环境执行插桩代码：注入 __rec、运行内联测试、收集分层帧。
 * 约定（prompt 强制）：代码为纯脚本（非模块），末尾调用 __rec.tests([...]) 注册用例，
 * 每个用例在 run() 内构造输入 → 调用解法 → 断言（失败 throw）。
 */
export function runInstrumented(req: WorkerRequest): RunResult {
  const state: RecorderState = { frameGroups: [], tests: [], active: -1 }

  const rec = {
    step: (frame: RawFrame): void => {
      const group = state.frameGroups[state.active]
      if (group && group.length < MAX_FRAMES_PER_GROUP) group.push(frame)
    },
    tests: (list: TestSpec[]): void => {
      state.tests = Array.isArray(list) ? list : []
    },
  }

  let fn: unknown
  try {
    const factory = new Function(
      '__rec',
      `${req.instrumentedCode}\n;return typeof ${req.fnName} === "function" ? ${req.fnName} : undefined;`,
    )
    fn = factory(rec)
  } catch (e) {
    return { ok: false, frameGroups: [], tests: [], error: `代码无法编译：${errMsg(e)}` }
  }
  if (typeof fn !== 'function') {
    return { ok: false, frameGroups: [], tests: [], error: `未找到入口函数 ${req.fnName}` }
  }
  if (state.tests.length === 0) {
    return { ok: false, frameGroups: [], tests: [], error: '插桩代码未通过 __rec.tests([...]) 注册测试用例' }
  }

  state.frameGroups = state.tests.map(() => [])
  const outcomes: TestOutcome[] = []
  for (let i = 0; i < state.tests.length; i++) {
    const spec = state.tests[i]
    const label = typeof spec?.label === 'string' ? spec.label : `用例 ${i + 1}`
    state.active = i
    try {
      if (!spec || typeof spec.run !== 'function') throw new Error('用例缺少 run 函数')
      const ret = spec.run() as unknown
      if (ret && typeof (ret as { then?: unknown }).then === 'function') {
        throw new Error('测试用例必须同步执行（run 不能是 async）')
      }
      outcomes.push({ index: i, label, passed: true, frameCount: state.frameGroups[i]?.length ?? 0 })
    } catch (e) {
      outcomes.push({
        index: i,
        label,
        passed: false,
        error: errMsg(e),
        frameCount: state.frameGroups[i]?.length ?? 0,
      })
    }
  }
  return { ok: true, frameGroups: state.frameGroups, tests: outcomes }
}
