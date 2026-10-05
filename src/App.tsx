/**
 * AlgoMotion 应用入口：首页 ↔ 播放页。
 */
import { useCallback, useState } from 'react'
import type { AlgorithmCase } from './types'
import type { Sample } from './samples'
import { executeInstrumentResult } from './engine/runner'
import { generateInstrumented, type GenerateInput } from './llm/client'
import { HomeScreen } from './screens/HomeScreen'
import { PlayerScreen } from './screens/PlayerScreen'

export default function App() {
  const [activeCase, setActiveCase] = useState<AlgorithmCase | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** 打开内置样题：走沙箱执行链路 */
  const openSample = useCallback(async (sample: Sample) => {
    setLoading(true)
    setError(null)
    try {
      const { run, framesByTest } = await executeInstrumentResult(sample.result)
      if (!run.ok) {
        setError(run.error ?? '沙箱执行失败')
        return
      }
      setActiveCase({
        id: sample.id,
        title: sample.title,
        problem: sample.problem,
        sourceCode: sample.sourceCode,
        result: sample.result,
        framesByTest,
        tests: run.tests,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /** 自定义生成：LLM 插桩 → 沙箱执行 → 进入播放页 */
  const handleGenerate = useCallback(async (input: GenerateInput) => {
    setGenerating(true)
    setError(null)
    try {
      const result = await generateInstrumented(input)
      const { run, framesByTest } = await executeInstrumentResult(result)
      if (!run.ok) {
        setError(
          `生成的代码执行失败：${run.error ?? '未知错误'}。可以再试一次，每次生成略有不同。`,
        )
        return
      }
      setActiveCase({
        id: `gen-${Date.now()}`,
        title: result.summary || result.fnName,
        problem: input.problem,
        sourceCode: input.code,
        result,
        framesByTest,
        tests: run.tests,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setGenerating(false)
    }
  }, [])

  return (
    <div className="h-full bg-bg text-ink">
      {activeCase ? (
        <PlayerScreen algoCase={activeCase} onBack={() => setActiveCase(null)} />
      ) : (
        <HomeScreen
          loading={loading}
          generating={generating}
          error={error}
          onOpenSample={openSample}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  )
}
