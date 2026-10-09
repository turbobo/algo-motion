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
  /** 区间标记（滑动窗口/二分区间）：格子下方的色带 */
  ranges?: Array<{ from: number; to: number; label?: string; tone?: Tone }>
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

/** 二维表格视图（DP 填表等）：行头/列头 + 当前行列十字参考线 */
export interface MatrixView {
  kind: 'matrix'
  /** 表格值（null 表示未填）；行 × 列 */
  values: (string | number | null)[][]
  /** 行头标签（可选，如 LCS 的行字符；第一项可为空串表示首行是初始行） */
  rowLabels?: string[]
  /** 列头标签（可选） */
  colLabels?: string[]
  /** 单元格标注 */
  marks?: Array<{ row: number; col: number; tone: Tone }>
  /** 当前激活行/列（渲染十字弱高亮，用于展示扫描位置）；-1 或省略表示无当前格 */
  activeRow?: number
  activeCol?: number
  title?: string
}

/** 二叉树视图：节点身份用稳定 id；布局由渲染器自动计算（中序序号定 x，深度定 y） */
export interface TreeView {
  kind: 'tree'
  nodes: Array<{ id: string; value: string }>
  /** 边：[父id, 子id, 左/右] */
  edges: Array<[string, string, 'left' | 'right']>
  marks?: Array<{ id: string; tone: Tone }>
  /** 指针标注：标签 → 节点 id 或 null；null 渲染为节点下方的小 null 标记 */
  pointers?: Record<string, string | null>
  title?: string
}

/** 网格视图（岛屿/迷宫等）：'1'/'#' 等实体格与 '0'/'.' 空格自动着色 */
export interface GridView {
  kind: 'grid'
  cells: (string | number)[][]
  marks?: Array<{ row: number; col: number; tone: Tone }>
  title?: string
}

/** 栈视图（垂直堆叠，栈顶在上） */
export interface StackView {
  kind: 'stack'
  /** 从栈底到栈顶 */
  items: (string | number)[]
  marks?: Array<{ index: number; tone: Tone }>
  title?: string
}

export type View = ArrayView | HashmapView | LinkedListView | MatrixView | TreeView | GridView | StackView

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
  /** 递归调用栈快照（栈底 → 栈顶；仅递归题提供，如 ["maxDepth(3)", "maxDepth(9)"]） */
  stack?: string[]
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

/**
 * 帧清洗诊断：沙箱对不可信插桩数据的修复统计。
 * 不为零时播放页透明提示（与「用例校验 N/M」徽章同一设计取向）。
 */
export interface FrameDiagnostics {
  /** 超出帧数上限被丢弃的帧数 */
  droppedFrames: number
  /** 结构非法（不是对象 / 读取时抛错）被整帧丢弃的数量 */
  invalidFrames: number
  /** 视图被整体剔除的数量（未知 kind / 必填字段非法 / 超出单帧视图上限） */
  droppedViews: number
  /** 视图字段被修正或截断的数量（越界索引、重复键、超长集合、类型归一） */
  repairedViews: number
  /** 超出上限或非法的测试用例被丢弃数量 */
  droppedTests: number
}

/** 沙箱执行结果 */
export interface RunResult {
  ok: boolean
  /** 分层帧组：下标与测试用例对应 */
  frameGroups: RawFrame[][]
  tests: TestOutcome[]
  /** 整体执行错误（代码编译失败、未注册测试等） */
  error?: string
  /** 帧清洗诊断（执行失败时可能缺失） */
  diagnostics?: FrameDiagnostics
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
  /** 沙箱帧清洗诊断（有异常时才提示用户） */
  diagnostics?: FrameDiagnostics
}
