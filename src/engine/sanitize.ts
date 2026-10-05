/**
 * 不可信帧数据的清洗层（沙箱侧，纯逻辑）
 *
 * __rec.step() 的入参完全来自 LLM 生成的代码，任何字段都可能是：
 * 缺失 / 类型错误 / 未知 kind / 越界索引 / 超长集合 / 带副作用的 getter / Proxy。
 * 本层把一帧清洗成「渲染层可以无条件信任」的结构，规则：
 * - 能修的修（类型归一、截断超长、越界与重复项剔除），修不了的整视图丢掉，
 *   整帧不是对象才丢帧；views 全被剔除的帧仍然保留（讲解与代码行仍有意义）
 * - 全程不递归进入未知对象、不做 JSON.stringify，只按已知字段做 typeof 判断，
 *   因此不会因循环引用爆栈，也不会被超长或代理数据结构拖垮
 * - 所有修复与丢弃计入 FrameDiagnostics，播放页以徽章透明提示
 *
 * 覆盖的视图 kind 必须与 types.ts 的 View 联合、ViewRenderer 分支、
 * System Prompt 视图清单保持一致；新增视图类型时三处同步。
 */
import type {
  ArrayView,
  FrameDiagnostics,
  GridView,
  HashmapView,
  LinkedListView,
  ListNode,
  MatrixView,
  RawFrame,
  StackView,
  Tone,
  TreeView,
  View,
} from '../types'

/** 单帧最多保留的视图数 */
export const MAX_VIEWS_PER_FRAME = 6
/** 一维集合上限（数组长度 / 哈希条目 / 节点数 / 边数 / 栈深） */
export const MAX_VIEW_ITEMS = 200
/** 二维视图行列上限（matrix / grid），避免 40×40 以外的 DOM 爆炸 */
export const MAX_2D_ROWS = 40
export const MAX_2D_COLS = 40
/** 单帧变量面板条目上限 */
export const MAX_VARS_PER_FRAME = 24
/** 讲解与锚点文本上限 */
export const MAX_FRAME_TEXT_LEN = 400
/** 单次执行注册用例上限（prompt 要求恰好 3 个，超量说明模型失控） */
export const MAX_TESTS = 8
/** 单次执行累计帧上限（跨用例，防多用例叠加撑爆内存与 postMessage） */
export const MAX_TOTAL_FRAMES = 2000

const MAX_POINTERS = 8
const MAX_RANGES = 8
const MAX_HIGHLIGHTS = 16
const CELL_TEXT_LEN = 32
const TITLE_TEXT_LEN = 80
const LABEL_TEXT_LEN = 24
const ID_TEXT_LEN = 16

const TONES: readonly string[] = ['active', 'ok', 'warn', 'danger', 'muted']
const TREE_SIDES: readonly string[] = ['left', 'right']

export function emptyDiagnostics(): FrameDiagnostics {
  return { droppedFrames: 0, invalidFrames: 0, droppedViews: 0, repairedViews: 0, droppedTests: 0 }
}

/** 是否存在需要向用户提示的异常 */
export function hasDiagnostics(diag: FrameDiagnostics | undefined): boolean {
  if (!diag) return false
  return (
    diag.droppedFrames > 0 ||
    diag.invalidFrames > 0 ||
    diag.droppedViews > 0 ||
    diag.repairedViews > 0 ||
    diag.droppedTests > 0
  )
}

/** 诊断项的可读摘要（供 UI title 展示） */
export function describeDiagnostics(diag: FrameDiagnostics): string[] {
  const lines: string[] = []
  if (diag.invalidFrames) lines.push(`丢弃结构非法的帧 ${diag.invalidFrames} 个`)
  if (diag.droppedFrames) lines.push(`帧数超出上限，丢弃 ${diag.droppedFrames} 帧`)
  if (diag.droppedViews) lines.push(`剔除无法渲染的视图 ${diag.droppedViews} 个`)
  if (diag.repairedViews) lines.push(`修正异常视图字段 ${diag.repairedViews} 处`)
  if (diag.droppedTests) lines.push(`丢弃多余/非法的测试用例 ${diag.droppedTests} 个`)
  return lines
}

/*
 * 「静默省略」约定：空集合（values: [] / entries: [] / nodes: []）上的一切索引与引用
 * 都不可能画出任何东西，属于合法输入（如「空字符串」「空链表」边界用例），
 * 不计入 repairedViews；只有非空集合里出现越界/悬空引用才是真的数据缺陷。
 */

// ===== 基础归一工具 =====

/** 任意值 → 有界文本（非原始类型返回空串，由调用方决定兜底） */
function text(value: unknown, max: number): string {
  if (typeof value === 'string') return value.length > max ? value.slice(0, max) : value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    const out = String(value)
    return out.length > max ? out.slice(0, max) : out
  }
  return ''
}

/** 数组元素 / 变量值 → 可显示单元（number 保数值，其余降为文本，空位为 null） */
function cell(value: unknown): number | string | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : text(value, CELL_TEXT_LEN) || '—'
  if (typeof value === 'string') return value.length > CELL_TEXT_LEN ? value.slice(0, CELL_TEXT_LEN) : value
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return '[对象]'
  return text(value, CELL_TEXT_LEN) || '—'
}

/** 锚点专用：只认字符串。数字 / 布尔转成文本后可能误命中代码行，宁可为空 */
function anchor(value: unknown): string {
  return typeof value === 'string' ? (value.length > MAX_FRAME_TEXT_LEN ? value.slice(0, MAX_FRAME_TEXT_LEN) : value) : ''
}

function displayCell(value: unknown): string {
  const shown = cell(value)
  return shown === null ? '∅' : String(shown)
}

/** 渲染器声明为 string | number 的位置（grid/stack），null 归一为空串 */
function strictCell(value: unknown): string | number {
  const shown = cell(value)
  return shown === null ? '' : shown
}

function toneOf(value: unknown): Tone | null {
  const name = text(value, 16)
  return TONES.includes(name) ? (name as Tone) : null
}

/** 整数索引必须落在范围内（越界标注直接判非法，宁缺勿错） */
function indexInto(value: unknown, size: number): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= size) return null
  return value
}

/** 有界遍历：不信任 length（可能是 1e18 的 Proxy） */
function bounded(list: unknown[]): number {
  return Math.min(list.length, MAX_VIEW_ITEMS)
}

/** -1 / null / undefined 都按「无当前格」理解 */
function isNoActive(value: unknown): boolean {
  return value === -1 || value === null || value === undefined
}

function readActiveIndex(value: unknown, size: number): number | null {
  if (isNoActive(value)) return null
  return indexInto(value, size)
}

/** 可选 title 字段 */
function readTitle(source: Record<string, unknown>): string | undefined {
  const title = text(source.title, TITLE_TEXT_LEN)
  return title || undefined
}

/** {index, tone} 型标注（array / stack 共用），越界与重复索引剔除 */
function indexMarks(
  raw: unknown,
  size: number,
): { marks: Array<{ index: number; tone: Tone }>; repaired: boolean } {
  const marks: Array<{ index: number; tone: Tone }> = []
  if (raw == null) return { marks, repaired: false }
  if (!Array.isArray(raw)) return { marks, repaired: size > 0 }
  let repaired = false
  if (raw.length > MAX_VIEW_ITEMS) repaired = true
  const used = new Set<number>()
  for (let i = 0; i < bounded(raw); i++) {
    const mark = raw[i] as { index?: unknown; tone?: unknown } | null
    const at = mark && typeof mark === 'object' ? indexInto(mark.index, size) : null
    const tone = mark && typeof mark === 'object' ? toneOf(mark.tone) : null
    if (at === null || tone === null || used.has(at)) {
      repaired = true
      continue
    }
    used.add(at)
    marks.push({ index: at, tone })
  }
  return { marks, repaired: repaired && size > 0 }
}

/** {row, col, tone} 型标注（matrix / grid 共用），按每行实际列数校验 */
function cellMarks(
  raw: unknown,
  rowCount: number,
  colCountOf: (row: number) => number,
): { marks: Array<{ row: number; col: number; tone: Tone }>; repaired: boolean } {
  const marks: Array<{ row: number; col: number; tone: Tone }> = []
  if (raw == null) return { marks, repaired: false }
  if (!Array.isArray(raw)) return { marks, repaired: rowCount > 0 }
  let repaired = false
  if (raw.length > MAX_VIEW_ITEMS) repaired = true
  const used = new Set<string>()
  for (let i = 0; i < bounded(raw); i++) {
    const mark = raw[i] as { row?: unknown; col?: unknown; tone?: unknown } | null
    const row = mark && typeof mark === 'object' ? indexInto(mark.row, rowCount) : null
    const col =
      mark && typeof mark === 'object' && row !== null ? indexInto(mark.col, colCountOf(row)) : null
    const tone = mark && typeof mark === 'object' ? toneOf(mark.tone) : null
    if (row === null || col === null || tone === null) {
      repaired = true
      continue
    }
    const id = `${row}:${col}`
    if (used.has(id)) {
      repaired = true
      continue
    }
    used.add(id)
    marks.push({ row, col, tone })
  }
  return { marks, repaired: repaired && rowCount > 0 }
}

/** {id, tone} 型标注（linkedlist / tree 共用），id 必须是已知节点 */
function nodeMarks(
  raw: unknown,
  ids: Set<string>,
): { marks: Array<{ id: string; tone: Tone }>; repaired: boolean } {
  const marks: Array<{ id: string; tone: Tone }> = []
  if (raw == null) return { marks, repaired: false }
  if (!Array.isArray(raw)) return { marks, repaired: ids.size > 0 }
  let repaired = false
  const used = new Set<string>()
  for (let i = 0; i < bounded(raw); i++) {
    const mark = raw[i] as { id?: unknown; tone?: unknown } | null
    const id = mark && typeof mark === 'object' ? text(mark.id, ID_TEXT_LEN) : ''
    const tone = mark && typeof mark === 'object' ? toneOf(mark.tone) : null
    if (!id || tone === null || !ids.has(id) || used.has(id)) {
      repaired = true
      continue
    }
    used.add(id)
    marks.push({ id, tone })
  }
  return { marks, repaired: repaired && ids.size > 0 }
}

/** 标签 → 有界整数索引 的指针字典 */
function indexPointers(
  raw: unknown,
  size: number,
): { pointers: Record<string, number>; repaired: boolean } {
  const pointers: Record<string, number> = {}
  if (raw == null) return { pointers, repaired: false }
  if (typeof raw !== 'object' || Array.isArray(raw)) return { pointers, repaired: size > 0 }
  let repaired = false
  let count = 0
  for (const [label, target] of Object.entries(raw)) {
    if (count >= MAX_POINTERS) {
      repaired = true
      break
    }
    const at = indexInto(target, size)
    if (at === null) {
      repaired = true
      continue
    }
    pointers[text(label, LABEL_TEXT_LEN) || `p${count + 1}`] = at
    count++
  }
  return { pointers, repaired: repaired && size > 0 }
}

/** 标签 → 节点 id | null 的指针字典（链表与树共用） */
function nodePointers(
  raw: unknown,
  ids: Set<string>,
): { pointers: Record<string, string | null>; repaired: boolean } {
  const pointers: Record<string, string | null> = {}
  if (raw == null) return { pointers, repaired: false }
  if (typeof raw !== 'object' || Array.isArray(raw)) return { pointers, repaired: ids.size > 0 }
  let repaired = false
  let count = 0
  for (const [label, target] of Object.entries(raw)) {
    if (count >= MAX_POINTERS) {
      repaired = true
      break
    }
    const name = text(label, LABEL_TEXT_LEN) || `p${count + 1}`
    if (target === null || target === undefined) {
      pointers[name] = null
      count++
      continue
    }
    const id = text(target, ID_TEXT_LEN)
    if (!id || !ids.has(id)) {
      repaired = true
      continue
    }
    pointers[name] = id
    count++
  }
  return { pointers, repaired: repaired && ids.size > 0 }
}

/** 稳定 id 的节点列表（链表 / 树共用）：id 非空且不重复 */
function idNodes(raw: unknown): { nodes: ListNode[]; repaired: boolean } {
  const nodes: ListNode[] = []
  if (!Array.isArray(raw)) return { nodes, repaired: true }
  let repaired = false
  const ids = new Set<string>()
  const size = bounded(raw)
  if (raw.length > size) repaired = true
  for (let i = 0; i < size; i++) {
    const node = raw[i] as { id?: unknown; value?: unknown } | null
    const id = node && typeof node === 'object' ? text(node.id, ID_TEXT_LEN) : ''
    if (!id || ids.has(id)) {
      repaired = true
      continue
    }
    ids.add(id)
    nodes.push({ id, value: displayCell(node?.value) })
  }
  return { nodes, repaired }
}

/** 二维集合：不信任行数/列数，逐层有界取值 */
function matrix2D(
  raw: unknown,
  toCell: (value: unknown) => string | number | null,
): { rows: Array<Array<string | number | null>>; repaired: boolean } {
  const rows: Array<Array<string | number | null>> = []
  if (!Array.isArray(raw)) return { rows, repaired: true }
  let repaired = false
  const rowCount = Math.min(raw.length, MAX_2D_ROWS)
  if (raw.length > rowCount) repaired = true
  for (let r = 0; r < rowCount; r++) {
    const row = raw[r]
    if (!Array.isArray(row)) {
      repaired = true
      continue
    }
    const colCount = Math.min(row.length, MAX_2D_COLS)
    if (row.length > colCount) repaired = true
    const out: Array<string | number | null> = []
    for (let c = 0; c < colCount; c++) out.push(toCell(row[c]))
    rows.push(out)
  }
  return { rows, repaired }
}

// ===== 七种视图清洗 =====

function arrayView(raw: Record<string, unknown>, diag: FrameDiagnostics): ArrayView | null {
  const valuesRaw = raw.values
  if (!Array.isArray(valuesRaw)) return null
  let repaired = false
  const size = bounded(valuesRaw)
  if (valuesRaw.length > size) repaired = true
  const values: (number | string | null)[] = []
  for (let i = 0; i < size; i++) values.push(cell(valuesRaw[i]))

  const view: ArrayView = { kind: 'array', values }
  const title = readTitle(raw)
  if (title) view.title = title

  const marks = indexMarks(raw.marks, values.length)
  if (marks.marks.length > 0) view.marks = marks.marks
  if (marks.repaired) repaired = true

  const pointers = indexPointers(raw.pointers, values.length)
  if (Object.keys(pointers.pointers).length > 0) view.pointers = pointers.pointers
  if (pointers.repaired) repaired = true

  // 区间色带：from/to 为闭区间，必须落在 values 范围内且 from <= to
  const rangesRaw = raw.ranges
  if (Array.isArray(rangesRaw)) {
    const out: NonNullable<ArrayView['ranges']> = []
    for (let i = 0; i < bounded(rangesRaw); i++) {
      if (out.length >= MAX_RANGES) {
        repaired = true
        break
      }
      const range = rangesRaw[i] as { from?: unknown; to?: unknown; label?: unknown; tone?: unknown } | null
      const from = range && typeof range === 'object' ? indexInto(range.from, values.length) : null
      const to = range && typeof range === 'object' ? indexInto(range.to, values.length) : null
      if (from === null || to === null || from > to) {
        if (values.length > 0) repaired = true
        continue
      }
      const tone = range ? toneOf(range.tone) : null
      const label = range ? text(range.label, LABEL_TEXT_LEN) : ''
      const item: NonNullable<ArrayView['ranges']>[number] = { from, to }
      if (tone) item.tone = tone
      if (label) item.label = label
      out.push(item)
    }
    if (out.length > 0) view.ranges = out
  } else if (rangesRaw != null) {
    repaired = true
  }

  if (repaired) diag.repairedViews++
  return view
}

function hashmapView(raw: Record<string, unknown>, diag: FrameDiagnostics): HashmapView | null {
  const entriesRaw = raw.entries
  if (!Array.isArray(entriesRaw)) return null
  let repaired = false
  const size = bounded(entriesRaw)
  if (entriesRaw.length > size) repaired = true
  const seen = new Set<string>()
  const entries: Array<[string, string]> = []
  for (let i = 0; i < size; i++) {
    const pair = entriesRaw[i]
    if (!Array.isArray(pair) || pair.length < 2) {
      repaired = true
      continue
    }
    // 键重复会让 React key 冲突，保留首次出现
    const key = text(pair[0], CELL_TEXT_LEN) || '—'
    if (seen.has(key)) {
      repaired = true
      continue
    }
    seen.add(key)
    entries.push([key, text(pair[1], CELL_TEXT_LEN)])
  }

  const view: HashmapView = { kind: 'hashmap', entries }
  const title = readTitle(raw)
  if (title) view.title = title

  const highlights = raw.highlightKeys
  if (Array.isArray(highlights)) {
    const out: string[] = []
    for (let i = 0; i < bounded(highlights); i++) {
      if (out.length >= MAX_HIGHLIGHTS) {
        repaired = true
        break
      }
      const key = text(highlights[i], CELL_TEXT_LEN)
      if (!key || !seen.has(key)) {
        if (entries.length > 0) repaired = true // 空表的高亮同样是残留引用
        continue
      }
      out.push(key)
    }
    if (out.length > 0) view.highlightKeys = out
  } else if (highlights != null) {
    repaired = true
  }

  if (repaired) diag.repairedViews++
  return view
}

function listView(raw: Record<string, unknown>, diag: FrameDiagnostics): LinkedListView | null {
  const nodesRaw = raw.nodes
  if (!Array.isArray(nodesRaw)) return null
  const collected = idNodes(nodesRaw)
  const nodes = collected.nodes
  // 声明了节点却一个都不可用 → 视图无意义（空数组是合法的「空链表」，保留）
  if (nodes.length === 0 && nodesRaw.length > 0) return null
  const ids = new Set(nodes.map((n) => n.id))
  let repaired = collected.repaired

  const next: LinkedListView['next'] = []
  const linked = new Set<string>()
  const nextRaw = raw.next
  if (Array.isArray(nextRaw)) {
    if (nextRaw.length > MAX_VIEW_ITEMS) repaired = true
    for (let i = 0; i < bounded(nextRaw); i++) {
      const edge = nextRaw[i]
      if (!Array.isArray(edge) || edge.length < 2) {
        repaired = true
        continue
      }
      const quiet = ids.size === 0 // 空链表的边只可能是残留引用，无处可画
      const from = text(edge[0], ID_TEXT_LEN)
      if (!ids.has(from) || linked.has(from)) {
        if (!quiet) repaired = true
        continue
      }
      let to: string | null = null
      if (edge[1] !== null && edge[1] !== undefined) {
        to = text(edge[1], ID_TEXT_LEN)
        if (!to || !ids.has(to)) {
          if (!quiet) repaired = true
          continue
        }
      }
      linked.add(from)
      next.push([from, to])
    }
  } else if (nextRaw != null) {
    repaired = true
  }

  const view: LinkedListView = { kind: 'linkedlist', nodes, next }
  const title = readTitle(raw)
  if (title) view.title = title

  const pointers = nodePointers(raw.pointers, ids)
  if (Object.keys(pointers.pointers).length > 0) view.pointers = pointers.pointers
  if (pointers.repaired) repaired = true

  const marks = nodeMarks(raw.marks, ids)
  if (marks.marks.length > 0) view.marks = marks.marks
  if (marks.repaired) repaired = true

  if (repaired) diag.repairedViews++
  return view
}

function matrixView(raw: Record<string, unknown>, diag: FrameDiagnostics): MatrixView | null {
  const valuesRaw = raw.values
  if (!Array.isArray(valuesRaw)) return null
  const grid = matrix2D(valuesRaw, cell)
  if (!Array.isArray(valuesRaw) || (grid.rows.length === 0 && valuesRaw.length > 0)) return null
  let repaired = grid.repaired

  const view: MatrixView = { kind: 'matrix', values: grid.rows }
  const title = readTitle(raw)
  if (title) view.title = title

  const colCountOf = (row: number): number => grid.rows[row]?.length ?? 0
  const marks = cellMarks(raw.marks, grid.rows.length, colCountOf)
  if (marks.marks.length > 0) view.marks = marks.marks
  if (marks.repaired) repaired = true

  // 表头标签：文本归一并限制数量（多余表头无对应行/列，直接截断）
  for (const field of ['rowLabels', 'colLabels'] as const) {
    const source = raw[field]
    if (source == null) continue
    if (!Array.isArray(source)) {
      repaired = true
      continue
    }
    const limit = field === 'rowLabels' ? MAX_2D_ROWS : MAX_2D_COLS
    const out: string[] = []
    for (let i = 0; i < Math.min(source.length, limit); i++) out.push(text(source[i], CELL_TEXT_LEN))
    if (source.length > out.length) repaired = true
    if (out.length > 0) view[field] = out
  }

  // -1 是「当前无激活格」的哨兵（表尚未开始填），静默省略，不算数据缺陷
  const maxCols = grid.rows.reduce((widest, row) => Math.max(widest, row.length), 0)
  const activeRow = readActiveIndex(raw.activeRow, grid.rows.length)
  if (activeRow !== null) view.activeRow = activeRow
  else if (raw.activeRow != null && !isNoActive(raw.activeRow)) repaired = true
  const activeCol = readActiveIndex(raw.activeCol, maxCols)
  if (activeCol !== null) view.activeCol = activeCol
  else if (raw.activeCol != null && !isNoActive(raw.activeCol)) repaired = true

  if (repaired) diag.repairedViews++
  return view
}

function gridView(raw: Record<string, unknown>, diag: FrameDiagnostics): GridView | null {
  const cellsRaw = raw.cells
  if (!Array.isArray(cellsRaw)) return null
  const grid = matrix2D(cellsRaw, strictCell)
  if (grid.rows.length === 0 && cellsRaw.length > 0) return null

  const view: GridView = { kind: 'grid', cells: grid.rows as (string | number)[][] }
  const title = readTitle(raw)
  if (title) view.title = title

  const colCountOf = (row: number): number => grid.rows[row]?.length ?? 0
  const marks = cellMarks(raw.marks, grid.rows.length, colCountOf)
  if (marks.marks.length > 0) view.marks = marks.marks

  if (grid.repaired || marks.repaired) diag.repairedViews++
  return view
}

function stackView(raw: Record<string, unknown>, diag: FrameDiagnostics): StackView | null {
  const itemsRaw = raw.items
  if (!Array.isArray(itemsRaw)) return null
  let repaired = false
  const size = bounded(itemsRaw)
  if (itemsRaw.length > size) repaired = true
  const items: (string | number)[] = []
  for (let i = 0; i < size; i++) items.push(strictCell(itemsRaw[i]))

  const view: StackView = { kind: 'stack', items }
  const title = readTitle(raw)
  if (title) view.title = title

  const marks = indexMarks(raw.marks, items.length)
  if (marks.marks.length > 0) view.marks = marks.marks
  if (marks.repaired) repaired = true

  if (repaired) diag.repairedViews++
  return view
}

function treeView(raw: Record<string, unknown>, diag: FrameDiagnostics): TreeView | null {
  const nodesRaw = raw.nodes
  if (!Array.isArray(nodesRaw)) return null
  const collected = idNodes(nodesRaw)
  const nodes = collected.nodes
  if (nodes.length === 0 && nodesRaw.length > 0) return null
  const ids = new Set(nodes.map((n) => n.id))
  let repaired = collected.repaired

  // 边：父子都必须存在，side ∈ {left,right}，一父一侧一子、一子一父（布局歧义直接剔除）
  const edges: TreeView['edges'] = []
  const childOf = new Set<string>()
  const sideUsed = new Set<string>()
  const edgesRaw = raw.edges
  if (Array.isArray(edgesRaw)) {
    if (edgesRaw.length > MAX_VIEW_ITEMS) repaired = true
    for (let i = 0; i < bounded(edgesRaw); i++) {
      const edge = edgesRaw[i]
      if (!Array.isArray(edge) || edge.length < 3) {
        repaired = true
        continue
      }
      const parent = text(edge[0], ID_TEXT_LEN)
      const child = text(edge[1], ID_TEXT_LEN)
      const side = text(edge[2], 8)
      if (!ids.has(parent) || !ids.has(child) || !TREE_SIDES.includes(side)) {
        repaired = true
        continue
      }
      if (parent === child || childOf.has(child) || sideUsed.has(`${parent}:${side}`)) {
        repaired = true
        continue
      }
      childOf.add(child)
      sideUsed.add(`${parent}:${side}`)
      edges.push([parent, child, side as 'left' | 'right'])
    }
  } else if (edgesRaw != null) {
    repaired = true
  }

  const view: TreeView = { kind: 'tree', nodes, edges }
  const title = readTitle(raw)
  if (title) view.title = title

  const marks = nodeMarks(raw.marks, ids)
  if (marks.marks.length > 0) view.marks = marks.marks
  if (marks.repaired) repaired = true

  const pointers = nodePointers(raw.pointers, ids)
  if (Object.keys(pointers.pointers).length > 0) view.pointers = pointers.pointers
  if (pointers.repaired) repaired = true

  if (repaired) diag.repairedViews++
  return view
}

export function sanitizeView(raw: Record<string, unknown>, diag: FrameDiagnostics): View | null {
  try {
    const kind = text(raw.kind, 24)
    switch (kind) {
      case 'array':
        return arrayView(raw, diag)
      case 'hashmap':
        return hashmapView(raw, diag)
      case 'linkedlist':
        return listView(raw, diag)
      case 'matrix':
        return matrixView(raw, diag)
      case 'grid':
        return gridView(raw, diag)
      case 'stack':
        return stackView(raw, diag)
      case 'tree':
        return treeView(raw, diag)
      default:
        return null
    }
  } catch {
    // getter / Proxy 抛错：该视图作废，不影响同帧其余视图
    return null
  }
}

// ===== 帧清洗 =====

export function sanitizeFrame(raw: unknown, diag: FrameDiagnostics): RawFrame | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    diag.invalidFrames++
    return null
  }
  try {
    const source = raw as Record<string, unknown>
    const frame: RawFrame = {
      at: anchor(source.at),
      msg: text(source.msg, MAX_FRAME_TEXT_LEN),
      views: {},
    }

    const viewsRaw = source.views
    if (viewsRaw && typeof viewsRaw === 'object' && !Array.isArray(viewsRaw)) {
      let count = 0
      for (const [key, value] of Object.entries(viewsRaw)) {
        if (count >= MAX_VIEWS_PER_FRAME || !value || typeof value !== 'object') {
          diag.droppedViews++
          continue
        }
        const view = sanitizeView(value as Record<string, unknown>, diag)
        if (!view) {
          diag.droppedViews++
          continue
        }
        frame.views[text(key, 40) || `view${count + 1}`] = view
        count++
      }
    } else if (viewsRaw != null) {
      diag.droppedViews++
    }

    const varsRaw = source.vars
    if (varsRaw && typeof varsRaw === 'object' && !Array.isArray(varsRaw)) {
      const vars: Record<string, string> = {}
      let count = 0
      for (const [key, value] of Object.entries(varsRaw)) {
        if (count >= MAX_VARS_PER_FRAME) break
        vars[text(key, LABEL_TEXT_LEN) || `v${count + 1}`] = displayCell(value)
        count++
      }
      if (count > 0) frame.vars = vars
    }

    return frame
  } catch {
    diag.invalidFrames++
    return null
  }
}
