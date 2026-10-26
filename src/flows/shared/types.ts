/**
 * 解题工作台共享类型
 *
 * 与 algo-motion 现有的帧协议（Frame / AlgorithmCase）解耦：
 * 这里只描述「读题 → 编码 → 运行 → 判题 → 复盘」链路的数据形状。
 */

/** 解题支持的语言 */
export type SolveLanguage = 'javascript' | 'python' | 'java'

/** 难度沿用题库分类 */
export type SolveDifficulty = '简单' | '中等' | '困难'

/** 判题结论 */
export type Verdict =
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit'
  | 'compile_error'
  | 'runtime_error'

/** 题面示例 */
export interface ProblemExample {
  id: string
  /** 示例 1 / 示例 2 */
  label: string
  input: string
  output: string
  explanation?: string
}

/** 可运行的用例（示例 / 自定义） */
export interface SolveTestCase {
  id: string
  label: string
  input: string
  expected: string
  /** 用户新增的自定义用例 */
  custom?: boolean
}

/** 单条用例的执行结果 */
export interface TestCaseOutcome {
  testId: string
  label: string
  passed: boolean
  expected: string
  actual: string
}

/** Run 结果（只跑示例/自定义用例） */
export interface RunResult {
  passed: number
  total: number
  cases: TestCaseOutcome[]
  durationMs: number
  ranAt: string
}

/** 提交失败时保留的失败现场 */
export interface FailedCaseSnapshot {
  label: string
  input: string
  expected: string
  actual: string
}

/** Submit 结果（全量判题） */
export interface SubmissionResult {
  verdict: Verdict
  passedCases: number
  totalCases: number
  runtimeMs: number
  memoryMb: number
  runtimePercentile: number
  memoryPercentile: number
  failedCase?: FailedCaseSnapshot
  errorMessage?: string
  submittedAt: string
}

/** 提交历史条目 */
export interface SubmissionRecord {
  id: string
  problemId: string
  language: SolveLanguage
  verdict: Verdict
  submittedAt: string
  runtimeMs: number
  code: string
}

/** 一道可做题的完整定义 */
export interface SolveProblem {
  id: string
  number: number
  title: string
  difficulty: SolveDifficulty
  category: string
  description: string
  examples: ProblemExample[]
  constraints: string[]
  /** 渐进披露的提示，按 1→N 逐条解锁 */
  hints: string[]
  starterCode: Record<SolveLanguage, string>
  /** 示例用例：Run 只跑这些 + 自定义用例 */
  sampleTests: SolveTestCase[]
  /** 隐藏用例数量（Submit 全量判题） */
  hiddenCaseCount: number
  /** 对应 algo-motion 现有动画样题 id（用于「看动画」） */
  animationId?: string
  /** 通过率（原型数据） */
  acceptanceRate: number
}

/** 草稿：按「题目 + 语言」保存 */
export interface DraftRecord {
  problemId: string
  language: SolveLanguage
  code: string
  updatedAt: string
}

/** 判题结论展示元数据 */
export interface VerdictMeta {
  label: string
  /** 结果卡上的短码：AC / WA / TLE / CE / RE */
  code: string
  tone: 'ok' | 'warn' | 'danger'
}
