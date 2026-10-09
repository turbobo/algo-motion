/**
 * 帧清洗层测试：LLM 生成的插桩代码可能交回的一切畸形数据，
 * 必须在沙箱侧被收敛成「渲染层可直接 map/取值」的形状，且诊断计数可解释。
 */
import { describe, expect, it } from 'vitest'
import {
  emptyDiagnostics,
  hasDiagnostics,
  MAX_TOTAL_FRAMES,
  MAX_VIEWS_PER_FRAME,
  sanitizeFrame,
  sanitizeView,
} from '../src/engine/sanitize'
import type { ArrayView, TreeView } from '../src/types'
import { runInstrumented } from '../src/engine/protocol'

function diag() {
  return emptyDiagnostics()
}

describe('sanitizeFrame：帧级底线', () => {
  it('stack：字符串直通、空值剔除、超深截断、非数组忽略且不产生诊断', () => {
    const d = diag()
    const frame = sanitizeFrame(
      { at: 'a', msg: 'm', views: {}, stack: ['f(1)', '', 42, null, 'f(2)'] },
      d,
    )
    expect(frame?.stack).toEqual(['f(1)', '42', 'f(2)'])

    const d2 = diag()
    const f2 = sanitizeFrame({ at: 'a', msg: 'm', views: {}, stack: 'not-array' }, d2)
    expect(f2?.stack).toBeUndefined()
    expect(hasDiagnostics(d2)).toBe(false) // 栈为纯展示字段：静默降级

    const d3 = diag()
    const f3 = sanitizeFrame(
      { at: 'a', msg: 'm', views: {}, stack: Array.from({ length: 20 }, (_, i) => `f(${i})`) },
      d3,
    )
    expect(f3?.stack).toHaveLength(12)
  })
  it('非对象入参整帧丢弃并计数', () => {
    const d = diag()
    for (const bad of [null, undefined, 42, 'step', [], true]) {
      expect(sanitizeFrame(bad, d)).toBeNull()
    }
    expect(d.invalidFrames).toBe(6)
  })

  it('缺失/畸形字段归一为空串，帧仍然保留', () => {
    const d = diag()
    const frame = sanitizeFrame({ at: 12, msg: {}, views: null }, d)
    // at 只接受字符串（数字锚点会误命中代码行）；msg 允许原始值降级为文本
    expect(frame).toEqual({ at: '', msg: '', views: {} })
    expect(sanitizeFrame({ at: 'return 1', msg: 42, views: {} }, d)?.msg).toBe('42')
    expect(d.invalidFrames).toBe(0)
  })

  it('超长文本截断，不放大内存', () => {
    const frame = sanitizeFrame({ at: 'x'.repeat(5000), msg: 'y'.repeat(5000), views: {} }, diag())
    expect(frame?.at.length).toBeLessThanOrEqual(400)
    expect(frame?.msg.length).toBeLessThanOrEqual(400)
  })

  it('未知 kind 的视图被剔除，同帧其余视图照常保留', () => {
    const d = diag()
    const frame = sanitizeFrame(
      {
        at: 'return 1',
        msg: '结束',
        views: {
          weird: { kind: 'tree2d', nodes: [] },
          nums: { kind: 'array', values: [1, 2] },
        },
      },
      d,
    )
    expect(frame?.views.nums).toBeDefined()
    expect((frame?.views as Record<string, unknown>).weird).toBeUndefined()
    expect(d.droppedViews).toBe(1)
  })

  it('单帧视图数量与变量条目有上限', () => {
    const views: Record<string, unknown> = {}
    for (let i = 0; i < 12; i++) views[`v${i}`] = { kind: 'array', values: [i] }
    const d = diag()
    const frame = sanitizeFrame({ at: 'x', msg: 'm', views, vars: Object.fromEntries(
      Array.from({ length: 60 }, (_, i) => [`k${i}`, i]),
    ) }, d)
    expect(Object.keys(frame?.views ?? {}).length).toBe(MAX_VIEWS_PER_FRAME)
    expect(Object.keys(frame?.vars ?? {}).length).toBe(24)
    expect(d.droppedViews).toBe(6)
  })

  it('views 不是对象 / vars 是数组：不崩，按缺失处理', () => {
    const d = diag()
    const frame = sanitizeFrame({ at: 'a', msg: 'b', views: [1, 2], vars: [1, 2] }, d)
    expect(frame?.views).toEqual({})
    expect(frame?.vars).toBeUndefined()
    expect(d.droppedViews).toBe(1)
  })

  it('取值即抛错的 getter 不会带崩整帧', () => {
    const hostile = {
      at: 'let x = 1',
      msg: 'ok',
      views: {
        boom: {
          kind: 'array',
          get values(): unknown {
            throw new Error('代理炸了')
          },
        },
        fine: { kind: 'array', values: [1] },
      },
    }
    const d = diag()
    const frame = sanitizeFrame(hostile, d)
    expect(frame?.views.fine).toBeDefined()
    expect(d.droppedViews).toBe(1)
  })

  it('伪造 length 的稀疏数组不会被遍历爆', () => {
    const huge = [] as unknown[]
    huge[0] = 1
    // 声明一个巨大的 length（数组合法上限内），清洗层必须按上限取值而不是遍历它
    Object.defineProperty(huge, 'length', { value: 5_000_000 })
    const d = diag()
    const frame = sanitizeFrame({ at: 'a', msg: 'b', views: { x: { kind: 'array', values: huge } } }, d)
    expect((frame?.views.x as ArrayView).values.length).toBeLessThanOrEqual(200)
  })
})

describe('数组视图', () => {
  it('元素类型归一：对象降为占位文本，NaN 保留可读值', () => {
    const view = sanitizeView(
      { kind: 'array', values: [1, '2.5', null, undefined, { a: 1 }, NaN, Infinity, true] },
      diag(),
    ) as ArrayView
    expect(view.values).toEqual([1, '2.5', null, null, '[对象]', 'NaN', 'Infinity', 'true'])
  })

  it('越界标注、非法 tone、重复索引被剔除并计一次修复', () => {
    const d = diag()
    const view = sanitizeView(
      {
        kind: 'array',
        values: [1, 2, 3],
        marks: [
          { index: 0, tone: 'active' },
          { index: 9, tone: 'ok' },
          { index: 1, tone: 'sparkle' },
          { index: 0, tone: 'ok' },
          null,
        ],
      },
      d,
    ) as ArrayView
    expect(view.marks).toEqual([{ index: 0, tone: 'active' }])
    expect(d.repairedViews).toBe(1)
  })

  it('指针索引必须是范围内整数，字符串索引被拒', () => {
    const d = diag()
    const view = sanitizeView(
      { kind: 'array', values: [1, 2], pointers: { i: 1, j: '0', k: 1.5, l: -1 } },
      d,
    ) as ArrayView
    expect(view.pointers).toEqual({ i: 1 })
    expect(d.repairedViews).toBe(1)
  })

  it('区间色带要求 from<=to 且都在范围内', () => {
    const view = sanitizeView(
      {
        kind: 'array',
        values: [1, 2, 3],
        ranges: [
          { from: 0, to: 2, label: '窗口' },
          { from: 2, to: 1 },
          { from: 0, to: 9 },
        ],
      },
      diag(),
    ) as ArrayView
    expect(view.ranges).toEqual([{ from: 0, to: 2, label: '窗口' }])
  })

  it('空数组上的指针/标注是合法输入，不计修复（空字符串等边界用例）', () => {
    const d = diag()
    const view = sanitizeView(
      { kind: 'array', values: [], pointers: { left: 0 }, marks: [{ index: 0, tone: 'ok' }], ranges: [{ from: 0, to: 0 }] },
      d,
    ) as ArrayView
    expect(view.values).toEqual([])
    expect(view.pointers).toBeUndefined()
    expect(d.repairedViews).toBe(0)
    expect(hasDiagnostics(d)).toBe(false)
  })
})

describe('哈希表视图', () => {
  it('重复键保留首次出现，非二元组条目剔除', () => {
    const d = diag()
    const view = sanitizeView(
      { kind: 'hashmap', entries: [['a', '1'], ['a', '2'], ['b'], null, ['c', '3', 4]] },
      d,
    )
    expect(view?.kind === 'hashmap' && view.entries).toEqual([['a', '1'], ['c', '3']])
    expect(d.repairedViews).toBe(1)
  })

  it('highlightKeys 只保留真实存在的键', () => {
    const d = diag()
    const view = sanitizeView(
      { kind: 'hashmap', entries: [['7', '0']], highlightKeys: ['7', 'ghost'] },
      d,
    )
    expect(view?.kind === 'hashmap' && view.highlightKeys).toEqual(['7'])
    expect(d.repairedViews).toBe(1)
  })

  it('entries 缺失 → 整个视图丢弃', () => {
    const d = diag()
    expect(sanitizeView({ kind: 'hashmap' }, d)).toBeNull()
    expect(d.droppedViews).toBe(0) // 视图级判定由帧层负责计数
  })
})

describe('链表与二叉树', () => {
  it('链表：重复 id 剔除，悬空 next 目标剔除', () => {
    const d = diag()
    const view = sanitizeView(
      {
        kind: 'linkedlist',
        nodes: [{ id: 'n1', value: 1 }, { id: 'n1', value: 2 }, { id: 'n2', value: 3 }],
        next: [['n1', 'n2'], ['n2', 'ghost'], ['ghost', 'n1'], ['n1', 'n2']],
      },
      d,
    )
    expect(view?.kind === 'linkedlist' && view.nodes).toEqual([{ id: 'n1', value: '1' }, { id: 'n2', value: '3' }])
    expect(view?.kind === 'linkedlist' && view.next).toEqual([['n1', 'n2']])
    expect(d.repairedViews).toBe(1)
  })

  it('链表：空链（nodes 为源声明的 []）是合法视图', () => {
    const view = sanitizeView({ kind: 'linkedlist', nodes: [], next: [] }, diag())
    expect(view?.kind === 'linkedlist' && view.nodes).toEqual([])
  })

  it('链表：声明了节点但全部非法 → 视图无意义，丢弃', () => {
    const d = diag()
    expect(sanitizeView({ kind: 'linkedlist', nodes: [{ id: '', value: 1 }], next: [] }, d)).toBeNull()
  })

  it('二叉树：非法 side / 自环 / 一个子节点两个父 都被剔除', () => {
    const d = diag()
    const view = sanitizeView(
      {
        kind: 'tree',
        nodes: [{ id: 'r', value: 1 }, { id: 'l', value: 2 }, { id: 'x', value: 3 }],
        edges: [
          ['r', 'l', 'left'],
          ['r', 'l', 'right'], // 同一子节点重复认领 → 剔除
          ['x', 'x', 'left'], // 自环
          ['r', 'ghost', 'right'],
          ['r', 'x', 'middle'], // 非法 side
          ['r'], // 形状不足
        ],
      },
      d,
    ) as TreeView
    expect(view.edges).toEqual([['r', 'l', 'left']])
    expect(d.repairedViews).toBe(1)
  })

  it('二叉树：pointers 允许 null（渲染 label=null）', () => {
    const view = sanitizeView(
      { kind: 'tree', nodes: [{ id: 'r', value: '1' }], edges: [], pointers: { cur: null, other: 'r' } },
      diag(),
    )
    expect(view?.kind === 'tree' && view.pointers).toEqual({ cur: null, other: 'r' })
  })
})

describe('矩阵 / 网格 / 栈', () => {
  it('矩阵：保留 null 空格，越界单元格标注剔除', () => {
    const d = diag()
    const view = sanitizeView(
      {
        kind: 'matrix',
        values: [['0', null], ['1', null]],
        marks: [{ row: 1, col: 0, tone: 'active' }, { row: 5, col: 0, tone: 'ok' }, { row: 0, col: 9, tone: 'ok' }],
      },
      d,
    )
    expect(view?.kind === 'matrix' && view.values).toEqual([['0', null], ['1', null]])
    expect(view?.kind === 'matrix' && view.marks).toEqual([{ row: 1, col: 0, tone: 'active' }])
    expect(d.repairedViews).toBe(1)
  })

  it('矩阵：-1 表示「无当前格」，静默省略不计修复', () => {
    const d = diag()
    const view = sanitizeView({ kind: 'matrix', values: [['1']], activeRow: -1, activeCol: -1 }, d)
    expect(view?.kind === 'matrix' && view.activeRow).toBeUndefined()
    expect(hasDiagnostics(d)).toBe(false)
  })

  it('矩阵：越界的 activeRow/activeCol 计修复', () => {
    const d = diag()
    sanitizeView({ kind: 'matrix', values: [['1']], activeRow: 7 }, d)
    expect(d.repairedViews).toBe(1)
  })

  it('二维视图裁剪到 40×40，避免 DOM 爆炸', () => {
    const big = Array.from({ length: 300 }, () => Array.from({ length: 300 }, () => '1'))
    const d = diag()
    const view = sanitizeView({ kind: 'grid', cells: big }, d)
    expect(view?.kind === 'grid' && view.cells.length).toBe(40)
    expect(view?.kind === 'grid' && view.cells[0]?.length).toBe(40)
    expect(d.repairedViews).toBe(1)
  })

  it('网格：null 归一为空串（渲染成水格）；栈：null 同样归一', () => {
    const grid = sanitizeView({ kind: 'grid', cells: [[null, '1', 2]] }, diag())
    expect(grid?.kind === 'grid' && grid.cells).toEqual([['', '1', 2]])
    const stack = sanitizeView({ kind: 'stack', items: [1, null, 'a'] }, diag())
    expect(stack?.kind === 'stack' && stack.items).toEqual([1, '', 'a'])
  })

  it('栈：marks 按索引，越界剔除', () => {
    const view = sanitizeView({ kind: 'stack', items: ['a', 'b'], marks: [{ index: 1, tone: 'ok' }, { index: 2, tone: 'ok' }] }, diag())
    expect(view?.kind === 'stack' && view.marks).toEqual([{ index: 1, tone: 'ok' }])
  })

  it('矩阵：不规则行（ragged）不会被当成越界', () => {
    const d = diag()
    const view = sanitizeView({ kind: 'matrix', values: [['1'], ['2', '3']], marks: [{ row: 0, col: 1, tone: 'ok' }] }, d)
    expect(view?.kind === 'matrix' && view.marks).toBeUndefined()
    expect(d.repairedViews).toBe(1)
  })
})

describe('runInstrumented：不可信用例注册表与帧预算', () => {
  const wrap = (body: string): string => `function solve(){ ${body} }\n`

  it('过滤非函数用例，超过上限的用例被丢弃并计数', () => {
    const code =
      wrap('return 1') +
      `__rec.tests([
        { label: 'ok', run: function () { __rec.step({ at: 'return 1', msg: 'm', views: { a: { kind: 'array', values: [1] } } }) } },
        { label: '没有 run' },
        null,
        { run: 'not-a-fn' },
${Array.from({ length: 10 }, (_, i) => `        { label: 'x${i}', run: function () {} },`).join(',\n')}
      ]);`
    const run = runInstrumented({ instrumentedCode: code, fnName: 'solve' })
    expect(run.ok).toBe(true)
    expect(run.tests.length).toBeLessThanOrEqual(8)
    expect(run.tests[0]?.passed).toBe(true)
    expect(run.diagnostics && run.diagnostics.droppedTests > 0).toBe(true)
  })

  it('__rec.tests 传非数组 → 报「未注册可用测试用例」', () => {
    const run = runInstrumented({ instrumentedCode: wrap('__rec.tests("nope"); return 1'), fnName: 'solve' })
    expect(run.ok).toBe(false)
    expect(run.error).toMatch(/未通过 __rec\.tests/)
  })

  it('单用例刷帧只保留 500 帧，超出计入 droppedFrames', () => {
    const code =
      wrap('for (let i = 0; i < 600; i++) { __rec.step({ at: "for (let i", msg: "f" + i, views: {} }) }\nreturn 1') +
      '__rec.tests([{ label: "loop", run: function () { solve() } }]);'
    const run = runInstrumented({ instrumentedCode: code, fnName: 'solve' })
    expect(run.frameGroups[0]?.length).toBe(500)
    expect(run.diagnostics?.droppedFrames).toBe(100)
  })

  it('跨用例总量受 MAX_TOTAL_FRAMES 约束', () => {
    const per = 700
    const code =
      wrap(`for (let i = 0; i < ${per}; i++) { __rec.step({ at: "for (let i", msg: 'f', views: {} }) }\nreturn 1`) +
      `__rec.tests([${Array.from({ length: 4 }, (_, i) => `{ label: 't${i}', run: function () { solve() } }`).join(',')}]);`
    const run = runInstrumented({ instrumentedCode: code, fnName: 'solve' })
    const total = run.frameGroups.reduce((sum, g) => sum + g.length, 0)
    expect(total).toBe(MAX_TOTAL_FRAMES)
    expect(run.diagnostics?.droppedFrames ?? 0).toBeGreaterThan(0)
    expect(run.tests.every((t) => t.passed)).toBe(true)
  })

  it('帧里塞畸形数据不会污染产出：所有帧都带合法视图', () => {
    const code =
      wrap(`__rec.step({ at: 'return 1', msg: '坏数据', views: { x: { kind: 'nope' }, y: { kind: 'array', values: 'not-array' } } });
             __rec.step('我不是对象');
             __rec.step(null);
             return 1`) + '__rec.tests([{ label: "t", run: function () { solve() } }]);'
    const run = runInstrumented({ instrumentedCode: code, fnName: 'solve' })
    expect(run.frameGroups[0]?.length).toBe(1)
    expect(run.diagnostics?.invalidFrames).toBe(2)
    expect(run.diagnostics?.droppedViews).toBe(2)
  })
})
