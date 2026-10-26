/**
 * AlgoMotion 应用入口：首页 ↔ 播放页。
 */
import { Suspense, lazy, useCallback, useState } from 'react'
import type { AlgorithmCase } from './types'
import { CATALOG } from './samples/catalog'
import { RELATED_SAMPLES } from './samples/related'
import { executeInstrumentResult } from './engine/runner'
import { generateInstrumented, type GenerateInput } from './llm/client'
import { useProgress } from './hooks/useProgress'
import { HomeScreen } from './screens/HomeScreen'
import { PlayerScreen } from './screens/PlayerScreen'

const SolveWorkspaceRoute = lazy(() =>
  import('./flows/solve-workspace/solve-workspace').then((module) => ({
    default: module.SolveWorkspaceRoute,
  })),
)

export default function App() {
  const [activeCase, setActiveCase] = useState<AlgorithmCase | null>(null)
  const [solveProblemId, setSolveProblemId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { learned, last, markLearned, markOpened } = useProgress()

  /** 打开内置样题：按需加载题库内容 chunk → 沙箱执行 → 进入播放页 */
  const openSample = useCallback(
    async (target: { id: string }) => {
      markOpened(target.id)
      setLoading(true)
      setError(null)
      try {
        // 首页只消费轻量 CATALOG；完整样题（含插桩代码）动态加载
        const { findSample } = await import('./samples')
        const sample = findSample(target.id)
        if (!sample) {
          setError(`样题不存在：${target.id}`)
          return
        }
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
          diagnostics: run.diagnostics,
          complexity: CATALOG.find((e) => e.id === sample.id)?.complexity,
        })
      } finally {
        setLoading(false)
      }
    },
    [markOpened],
  )

  /** 题库 → 解题工作台 */
  const startSolve = useCallback((problemId: string) => {
    setError(null)
    setSolveProblemId(problemId)
  }, [])

  const exitSolve = useCallback(() => {
    setSolveProblemId(null)
  }, [])

  /** 工作台「看动画」：退出解题视图，复用现有样题播放链路 */
  const openAnimationFromSolve = useCallback(
    (sampleId: string) => {
      setSolveProblemId(null)
      void openSample({ id: sampleId })
    },
    [openSample],
  )

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
        diagnostics: run.diagnostics,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setGenerating(false)
    }
  }, [])

  /** 播放页到达最后一帧：记入「已学」（自定义生成的题目不在样题库内，计数侧天然忽略） */
  const handleLearned = useCallback(() => {
    if (activeCase) {
      markLearned(activeCase.id)
    }
  }, [activeCase, markLearned])

  /** 播放页「对照解法」：切到同题的另一个解法 */
  const handleOpenRelated = useCallback(
    (id: string) => {
      void openSample({ id })
    },
    [openSample],
  )

  return (
    <div className="h-full bg-bg text-ink">
      {activeCase ? (
        <PlayerScreen
          algoCase={activeCase}
          onBack={() => setActiveCase(null)}
          onLearned={handleLearned}
          relatedId={RELATED_SAMPLES[activeCase.id]}
          onOpenRelated={handleOpenRelated}
        />
      ) : solveProblemId ? (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-bg text-sm text-sub">
              正在载入解题工作台…
            </div>
          }
        >
          <SolveWorkspaceRoute
            problemId={solveProblemId}
            onExit={exitSolve}
            onOpenAnimation={openAnimationFromSolve}
            onNextProblem={setSolveProblemId}
          />
        </Suspense>
      ) : (
        <HomeScreen
          loading={loading}
          generating={generating}
          error={error}
          learned={learned}
          lastId={last}
          onOpenSample={openSample}
          onGenerate={handleGenerate}
          onStartSolve={startSolve}
        />
      )}
    </div>
  )
}
