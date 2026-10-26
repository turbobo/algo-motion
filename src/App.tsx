/**
 * AlgoMotion 应用入口：首页 ↔ 播放页。
 */
import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import type { AlgorithmCase } from './types'
import { CATALOG } from './samples/catalog'
import { RELATED_SAMPLES } from './samples/related'
import { executeInstrumentResult } from './engine/runner'
import { generateInstrumented, type GenerateInput } from './llm/client'
import { useProgress } from './hooks/useProgress'
import { isSolveProblemId } from './flows/shared/solve-catalog'
import { HomeScreen } from './screens/HomeScreen'
import { PlayerScreen } from './screens/PlayerScreen'

const SOLVE_HASH_PREFIX = '#/solve/'
const LAST_SOLVE_KEY = 'algomotion:last-solve'

function readSolveIdFromHash(): string | null {
  const match = window.location.hash.match(/^#\/solve\/([\w-]+)$/)
  return match?.[1] ?? null
}

function readLastSolveId(): string | null {
  try {
    const id = localStorage.getItem(LAST_SOLVE_KEY)
    return id && isSolveProblemId(id) ? id : null
  } catch {
    return null
  }
}

function writeLastSolveId(id: string) {
  try {
    localStorage.setItem(LAST_SOLVE_KEY, id)
  } catch {
    /* 存储不可用：静默降级 */
  }
}

const SolveWorkspaceRoute = lazy(() =>
  import('./flows/solve-workspace/solve-workspace').then((module) => ({
    default: module.SolveWorkspaceRoute,
  })),
)

export default function App() {
  const [activeCase, setActiveCase] = useState<AlgorithmCase | null>(null)
  const [solveProblemId, setSolveProblemId] = useState<string | null>(readSolveIdFromHash)
  const [lastSolveId, setLastSolveId] = useState<string | null>(readLastSolveId)
  const [returnSolveId, setReturnSolveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { learned, last, markLearned, markOpened } = useProgress()

  // 浏览器前进/后退、地址栏改 hash、深链：URL 中有 #/solve/:id 就打开工作台并记入「上次做题」
  useEffect(() => {
    const syncFromHash = () => {
      const id = readSolveIdFromHash()
      setSolveProblemId(id)
      setReturnSolveId(null)
      if (id && isSolveProblemId(id)) {
        setLastSolveId(id)
        writeLastSolveId(id)
      }
    }
    window.addEventListener('popstate', syncFromHash)
    window.addEventListener('hashchange', syncFromHash)
    return () => {
      window.removeEventListener('popstate', syncFromHash)
      window.removeEventListener('hashchange', syncFromHash)
    }
  }, [])

  // 直接打开深链时，把它记为「上次做题」，退出后首页可继续
  useEffect(() => {
    const initial = readSolveIdFromHash()
    if (initial && isSolveProblemId(initial)) {
      setLastSolveId(initial)
      writeLastSolveId(initial)
    }
  }, [])

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

  /** 题库 → 解题工作台（同步 URL + 记录上次做题） */
  const startSolve = useCallback((problemId: string) => {
    setError(null)
    setReturnSolveId(null)
    setSolveProblemId(problemId)
    setLastSolveId(problemId)
    writeLastSolveId(problemId)
    const nextHash = `${SOLVE_HASH_PREFIX}${problemId}`
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash)
    }
  }, [])

  const exitSolve = useCallback(() => {
    setSolveProblemId(null)
    if (readSolveIdFromHash()) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [])

  const nextSolve = useCallback((problemId: string) => {
    setReturnSolveId(null)
    setSolveProblemId(problemId)
    setLastSolveId(problemId)
    writeLastSolveId(problemId)
    const nextHash = `${SOLVE_HASH_PREFIX}${problemId}`
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash)
    }
  }, [])

  /** 工作台「看动画」：退出解题视图，复用现有样题播放链路；播放页返回时恢复工作台 */
  const openAnimationFromSolve = useCallback(
    (sampleId: string) => {
      if (solveProblemId) setReturnSolveId(solveProblemId)
      setSolveProblemId(null)
      if (readSolveIdFromHash()) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      }
      void openSample({ id: sampleId })
    },
    [openSample, solveProblemId],
  )

  /** 播放页返回：从解题工作台进入时回到工作台，否则回首页 */
  const handlePlayerBack = useCallback(() => {
    setActiveCase(null)
    if (returnSolveId) {
      setSolveProblemId(returnSolveId)
      setReturnSolveId(null)
      const nextHash = `${SOLVE_HASH_PREFIX}${returnSolveId}`
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, '', nextHash)
      }
    }
  }, [returnSolveId])

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
          onBack={handlePlayerBack}
          backLabel={returnSolveId ? '返回解题' : '换一题'}
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
            onNextProblem={nextSolve}
          />
        </Suspense>
      ) : (
        <HomeScreen
          loading={loading}
          generating={generating}
          error={error}
          learned={learned}
          lastId={last}
          lastSolveId={lastSolveId}
          onOpenSample={openSample}
          onGenerate={handleGenerate}
          onStartSolve={startSolve}
        />
      )}
    </div>
  )
}
