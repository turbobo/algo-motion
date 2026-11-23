/**
 * 解题工作台题库一致性：开放 id ↔ 完整题面 ↔ 动画样题。
 */
import { describe, expect, it } from 'vitest'
import { SOLVE_PROBLEM_IDS } from '../src/flows/shared/solve-catalog'
import { MOCK_PROBLEMS } from '../src/flows/shared/mock-data'
import { CATALOG } from '../src/samples/catalog'

describe('解题题库一致性', () => {
  it('每个开放 id 都有完整题面', () => {
    for (const id of SOLVE_PROBLEM_IDS) {
      expect(MOCK_PROBLEMS.some((p) => p.id === id), id).toBe(true)
    }
  })

  it('题面字段完整（三语言模板 / 示例用例 / 提示）', () => {
    for (const p of MOCK_PROBLEMS) {
      expect(Object.keys(p.starterCode).sort()).toEqual(['java', 'javascript', 'python'])
      expect(p.sampleTests.length).toBeGreaterThan(0)
      expect(p.hints.length).toBeGreaterThan(0)
      expect(p.examples.length).toBeGreaterThan(0)
      expect(p.hiddenCaseCount).toBeGreaterThan(0)
    }
  })

  it('animationId 指向存在的动画样题', () => {
    const ids = new Set(CATALOG.map((c) => c.id))
    for (const p of MOCK_PROBLEMS) {
      if (p.animationId) expect(ids.has(p.animationId), `${p.id}->${p.animationId}`).toBe(true)
    }
  })
})