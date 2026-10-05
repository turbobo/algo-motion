/**
 * 沙箱协议核心（纯逻辑，主线程与 Web Worker 两侧共用）
 *
 * 四个职责：
 * 1. runInstrumented —— 在隔离环境执行插桩代码：注入 __rec、运行测试、收集帧
 * 2. sanitize.ts（独立模块）—— 把不可信帧数据清洗成渲染层可无条件信任的结构
 * 3. stripInstrumentLines —— 剥离 __rec 调用行，还原「展示代码」
 * 4. resolveLineNumbers —— 用 at 锚点在展示代码上顺序解析帧行号
 */
import type {
  Frame,
  FrameDiagnostics,
  RawFrame,
  RunResult,
  TestOutcome,
  TestSpec,
} from '../types'
import { emptyDiagnostics, MAX_TESTS, MAX_TOTAL_FRAMES, sanitizeFrame } from './sanitize'

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
  /** 累计入组帧数（跨用例，用于全局上限） */
  total: number
}

/** 用例必须是带同步 run 函数的对象（非法定性的直接过滤掉，不留到运行时抛错） */
function isTestSpec(value: unknown): value is TestSpec {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { run?: unknown }).run === 'function'
  )
}

/**
 * 在隔离环境执行插桩代码：注入 __rec、运行内联测试、收集分层帧。
 * 约定（prompt 强制）：代码为纯脚本（非模块），末尾调用 __rec.tests([...]) 注册用例，
 * 每个用例在 run() 内构造输入 → 调用解法 → 断言（失败 throw）。
 */
export function runInstrumented(req: WorkerRequest): RunResult {
  const diagnostics: FrameDiagnostics = emptyDiagnostics()
  const state: RecorderState = { frameGroups: [], tests: [], active: -1, total: 0 }

  const rec = {
    /** 入参完全由 LLM 生成的代码提供：先清洗再入组，异常数据永不进渲染层 */
    step: (frame: unknown): void => {
      const group = state.frameGroups[state.active]
      if (!group) return
      if (group.length >= MAX_FRAMES_PER_GROUP || state.total >= MAX_TOTAL_FRAMES) {
        diagnostics.droppedFrames++
        return
      }
      const clean = sanitizeFrame(frame, diagnostics)
      if (!clean) return // sanitizeFrame 已计入 invalidFrames
      group.push(clean)
      state.total++
    },
    tests: (list: unknown): void => {
      if (!Array.isArray(list)) return
      const shaped = list.filter(isTestSpec)
      diagnostics.droppedTests += Math.max(list.length - shaped.length, 0)
      const kept = shaped.slice(0, MAX_TESTS)
      diagnostics.droppedTests += Math.max(shaped.length - kept.length, 0)
      state.tests = kept
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
    return { ok: false, frameGroups: [], tests: [], diagnostics, error: `代码无法编译：${errMsg(e)}` }
  }
  if (typeof fn !== 'function') {
    return {
      ok: false,
      frameGroups: [],
      tests: [],
      diagnostics,
      error: `未找到入口函数 ${req.fnName}`,
    }
  }
  if (state.tests.length === 0) {
    return {
      ok: false,
      frameGroups: [],
      tests: [],
      diagnostics,
      error: '插桩代码未通过 __rec.tests([...]) 注册可用的测试用例',
    }
  }

  state.frameGroups = state.tests.map(() => [])
  const outcomes: TestOutcome[] = []
  // 用 entries() 而非下标取值：isTestSpec 已过滤非法项，这里 spec 必然可用
  for (const [i, spec] of state.tests.entries()) {
    const label = typeof spec.label === 'string' ? spec.label : `用例 ${i + 1}`
    state.active = i
    try {
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
  return { ok: true, frameGroups: state.frameGroups, tests: outcomes, diagnostics }
}
