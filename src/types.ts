/**
 * AlgoMotion 核心类型：帧协议与视图模型
 *
 * 设计要点：
 * - 插桩代码在沙箱里执行，每个关键步骤调用 __rec.step() 记录一帧
 * - 一帧 = 展示代码行锚点(at) + 讲解(msg) + 若干视图快照(views) + 变量面板(vars)
 * - 视图是「完整快照」而非增量指令，渲染层用 React keyed diff 自动做过渡动画
 */

// ===== 视图（最小原型支持 3 种）=====

/** 元素色调：active=当前动作 ok=命中完成 warn=注意 danger=冲突 muted=已排除 */
export type Tone = 'active' | 'ok' | 'warn' | 'danger' | 'muted'

/** 数组/序列视图 */
export interface ArrayView {
  kind: 'array'
  /** 元素值，null 表示空位 */
  values: (number | string | null)[]
  /** 元素标注：索引 → 色调 */
  marks?: Array<{ index: number; tone: Tone }>
  /** 指针标注：标签 → 索引（如 { i: 2, j: 5 }） */
  pointers?: Record<string, number>
  title?: string
}

/** 哈希表/字典视图 */
export interface HashmapView {
  kind: 'hashmap'
  /** [key, value] 均为显示字符串，如 ["7", "0"] */
  entries: Array<[string, string]>
  /** 高亮的 key */
  highlightKeys?: string[]
  title?: string
}

/** 链表节点（id 表示节点身份，跨帧保持稳定才能做过渡动画） */
export interface ListNode {
  id: string
  value: string
}

/** 链表视图 */
export interface LinkedListView {
  kind: 'linkedlist'
  /** 节点按视觉从左到右排列 */
  nodes: ListNode[]
  /** 当前逻辑链：[fromId, toId | null]，null 表示指向空 */
  next: Array<[string, string | null]>
  /** 指针标注：标签(prev/curr/next...) → 节点 id 或 null（表示空指针） */
  pointers?: Record<string, string | null>
  /** 节点标注：id → 色调 */
  marks?: Array<{ id: string; tone: Tone }>
  title?: string
}

export type View = ArrayView | HashmapView | LinkedListView

// ===== 帧 =====

/** 一帧快照（沙箱内产生，line 未解析） */
export interface RawFrame {
  /** 锚点：该帧对应展示代码的哪一行（与代码行 trim 后去空白匹配的片段） */
  at: string
  /** 讲解文字（中文，带具体数值） */
  msg: string
  /** 视图快照：视图 id → 视图（如 { nums: ArrayView, seen: HashmapView }） */
  views: Record<string, View>
  /** 变量面板：变量名 → 显示值 */
  vars?: Record<string, string>
}

/** 完成行号解析的帧（展示用） */
export interface Frame extends RawFrame {
  /** 展示代码行号（1-based），null 表示无法定位 */
  line: number | null
}

// ===== 测试用例与执行 =====

/** 测试规格：LLM 在插桩代码里用 __rec.tests([...]) 注册 */
export interface TestSpec {
  /** 用例说明（如 "示例1: nums=[2,7,11,15] target=9"） */
  label: string
  /** 断言函数：构造输入 → 调用解法 → 断言；
   *  通过则正常返回，失败则 throw new Error(描述期望与实际) */
  run: () => void
}

export interface TestOutcome {
  index: number
  label: string
  passed: boolean
  /** 失败原因（断言信息或运行时错误） */
  error?: string
  /** 该用例产生的帧数量 */
  frameCount: number
}

/** 沙箱执行结果 */
export interface RunResult {
  ok: boolean
  /** 分层帧组：下标与测试用例对应 */
  frameGroups: RawFrame[][]
  tests: TestOutcome[]
  /** 整体执行错误（代码编译失败、未注册测试等） */
  error?: string
}

// ===== LLM 插桩产物 =====

/** 一次插桩的完整产物（LLM 输出经校验后的结构） */
export interface InstrumentResult {
  /** 展示代码（已剥离 __rec 行的干净解法） */
  displayCode: string
  /** 插桩版代码（沙箱执行用） */
  instrumentedCode: string
  /** 入口函数名 */
  fnName: string
  /** 一行题目摘要（LLM 生成） */
  summary: string
}

/** 一道可播放的算法演示 = 插桩产物 + 执行后的帧序列 */
export interface AlgorithmCase {
  id: string
  title: string
  /** 原始题目描述（用户输入或内置） */
  problem: string
  /** 原始解法代码（用户输入，展示于输入区） */
  sourceCode: string
  result: InstrumentResult
  /** 分层帧序列（按测试用例分组，已解析行号） */
  framesByTest: Frame[][]
  tests: TestOutcome[]
}
