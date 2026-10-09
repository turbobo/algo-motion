/**
 * frameDiff 单元测试：逐视图类型验证「变化元素」的识别。
 */
import { describe, expect, it } from 'vitest'
import { diffViews } from '../src/components/renderers/frameDiff'
import type { View } from '../src/types'

const array = (values: (number | string | null)[]): View => ({ kind: 'array', values })

describe('diffViews：帧间变化识别', () => {
  it('无前帧 / 视图新增 时返回空', () => {
    expect(Object.keys(diffViews(undefined, { a: array([1, 2]) }))).toHaveLength(0)
    expect(Object.keys(diffViews({ a: array([1]) }, { b: array([1]) }))).toHaveLength(0)
  })

  it('array：值变化按下标收录，指针/标记变化不闪', () => {
    const prev: Record<string, View> = {
      nums: { kind: 'array', values: [1, 2, 3], pointers: { i: 0 }, marks: [{ index: 0, tone: 'active' }] },
    }
    const cur: Record<string, View> = {
      nums: { kind: 'array', values: [1, 9, 3], pointers: { i: 1 }, marks: [{ index: 1, tone: 'active' }] },
    }
    const diff = diffViews(prev, cur)
    expect([...(diff.nums ?? [])]).toEqual(['1'])
  })

  it('hashmap：新增 key 与值变化都收录', () => {
    const prev: Record<string, View> = { m: { kind: 'hashmap', entries: [['a', '1'], ['b', '2']] } }
    const cur: Record<string, View> = { m: { kind: 'hashmap', entries: [['a', '1'], ['b', '3'], ['c', '9']] } }
    const diff = diffViews(prev, cur)
    expect([...(diff.m ?? [])].sort()).toEqual(['b', 'c'])
  })

  it('linkedlist：节点值或出边变化都收录', () => {
    const node = (id: string, value: string) => ({ id, value })
    const prev: Record<string, View> = {
      list: { kind: 'linkedlist', nodes: [node('n1', 'A'), node('n2', 'B')], next: [['n1', 'n2'], ['n2', null]] },
    }
    const cur: Record<string, View> = {
      list: { kind: 'linkedlist', nodes: [node('n1', 'A'), node('n2', 'B')], next: [['n1', null], ['n2', null]] },
    }
    const diff = diffViews(prev, cur)
    expect([...(diff.list ?? [])]).toEqual(['n1'])
  })

  it('matrix：逐格对比（null → 数字也算变化）', () => {
    const prev: Record<string, View> = { dp: { kind: 'matrix', values: [[1, null], [null, null]] } }
    const cur: Record<string, View> = { dp: { kind: 'matrix', values: [[1, 2], [null, null]] } }
    expect([...(diffViews(prev, cur).dp ?? [])]).toEqual(['0:1'])
  })

  it('tree：节点值与左右孩子结构变化都收录（翻转场景）', () => {
    const prev: Record<string, View> = {
      tree: {
        kind: 'tree',
        nodes: [{ id: 'n1', value: '1' }, { id: 'n2', value: '2' }, { id: 'n3', value: '3' }],
        edges: [['n1', 'n2', 'left'], ['n1', 'n3', 'right']],
      },
    }
    const cur: Record<string, View> = {
      tree: {
        kind: 'tree',
        nodes: [{ id: 'n1', value: '1' }, { id: 'n2', value: '2' }, { id: 'n3', value: '3' }],
        edges: [['n1', 'n3', 'left'], ['n1', 'n2', 'right']],
      },
    }
    expect([...(diffViews(prev, cur).tree ?? [])]).toEqual(['n1'])
  })

  it('grid 与 stack：下标 / 坐标标识', () => {
    const prev: Record<string, View> = {
      g: { kind: 'grid', cells: [['1', '0']] },
      s: { kind: 'stack', items: ['a', 'b'] },
    }
    const cur: Record<string, View> = {
      g: { kind: 'grid', cells: [['1', '1']] },
      s: { kind: 'stack', items: ['a', 'b', 'c'] },
    }
    const diff = diffViews(prev, cur)
    expect([...(diff.g ?? [])]).toEqual(['0:1'])
    expect([...(diff.s ?? [])]).toEqual(['2'])
  })

  it('视图完全相同时返回空', () => {
    const v: Record<string, View> = { nums: array([1, 2, 3]) }
    expect(Object.keys(diffViews(v, v))).toHaveLength(0)
  })
})
