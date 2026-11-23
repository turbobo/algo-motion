/**
 * 教学层数据校验：策略卡 / 预测暂停 / 复盘的可选字段必须自洽，
 * 预测点帧下标必须落在真实帧序列内，且每个预测点恰有一个正确选项。
 */
import { describe, expect, it } from 'vitest'
import { SAMPLES } from '../src/samples'
import { runInstrumented } from '../src/engine/protocol'

describe('教学层 lesson 字段自洽', () => {
  const withLesson = SAMPLES.filter((s) => s.lesson)

  it('至少有一道题提供教学设计（两数之和试点）', () => {
    expect(withLesson.length).toBeGreaterThan(0)
    expect(withLesson.some((s) => s.id === 'two-sum')).toBe(true)
  })

  it('idea 非空；contrast / takeaways 若提供则非空', () => {
    for (const s of withLesson) {
      const l = s.lesson!
      expect(l.idea.trim().length, s.id).toBeGreaterThan(0)
      if (l.contrast) {
        expect(l.contrast.bad.trim().length).toBeGreaterThan(0)
        expect(l.contrast.good.trim().length).toBeGreaterThan(0)
      }
      if (l.takeaways) expect(l.takeaways.length).toBeGreaterThan(0)
    }
  })

  it('预测点恰有一个正确选项，且帧下标落在真实帧序列内', () => {
    for (const s of withLesson) {
      const predicts = s.lesson!.predicts ?? []
      if (predicts.length === 0) continue
      const run = runInstrumented({ instrumentedCode: s.result.instrumentedCode, fnName: s.result.fnName })
      expect(run.ok, s.id).toBe(true)
      const frameCount = run.frameGroups[0]?.length ?? 0
      for (const p of predicts) {
        expect(p.atFrame, `${s.id} atFrame`).toBeGreaterThanOrEqual(0)
        expect(p.atFrame, `${s.id} atFrame<${frameCount}`).toBeLessThan(frameCount)
        expect(p.options.length).toBeGreaterThanOrEqual(2)
        expect(p.options.filter((o) => o.correct).length, `${s.id} 单一正确`).toBe(1)
        expect(p.explain.trim().length).toBeGreaterThan(0)
      }
    }
  })
})