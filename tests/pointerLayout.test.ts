/**
 * 数组指针布局：单指针居中、同格多指针并排不重叠、不同下标各自居中。
 */
import { describe, expect, it } from 'vitest'
import { layoutPointers } from '../src/components/renderers/pointerLayout'

const STEP = 52
const CELL = 44

describe('layoutPointers', () => {
  it('单指针精确居中于格子', () => {
    const pos = layoutPointers({ i: 2 }, STEP, CELL)
    expect(pos.i).toBe(2 * STEP + CELL / 2)
  })

  it('不同下标的指针各自居中，互不影响', () => {
    const pos = layoutPointers({ left: 1, right: 3 }, STEP, CELL)
    expect(pos.left).toBe(1 * STEP + CELL / 2)
    expect(pos.right).toBe(3 * STEP + CELL / 2)
  })

  it('左右相遇同格时并排且不重叠（间距 >= 间隙）', () => {
    const pos = layoutPointers({ left: 4, right: 4 }, STEP, CELL)
    const wl = Math.max(18, 'left'.length * 7 + 12)
    const wr = Math.max(18, 'right'.length * 7 + 12)
    const distance = Math.abs((pos.left ?? 0) - (pos.right ?? 0))
    // 两指针半宽之和 + 4px 间隙 = 不重叠的最小中心距
    expect(distance).toBeGreaterThanOrEqual((wl + wr) / 2 + 4)
    // 组按「左右边缘」整体居中于格子（不同宽标签下中心均值不等于格中心）
    const leftEdge = (pos.left ?? 0) - wl / 2
    const rightEdge = (pos.right ?? 0) + wr / 2
    expect((leftEdge + rightEdge) / 2).toBeCloseTo(4 * STEP + CELL / 2, 5)
  })

  it('短标签同格也不重叠', () => {
    const pos = layoutPointers({ i: 0, j: 0 }, STEP, CELL)
    expect(Math.abs((pos.i ?? 0) - (pos.j ?? 0))).toBeGreaterThanOrEqual(22)
  })
})