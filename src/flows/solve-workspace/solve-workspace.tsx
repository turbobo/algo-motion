/**
 * FLOW: Solve Workspace（解题工作台）
 *
 * 题库（现有 HomeScreen）→ 工作台全屏页；6 屏共享同一工作台壳层，
 * 屏间差异由 stage 驱动，右栏判题区是每屏的主要差异点。
 *
 * SCREEN 1 工作台·初始 → SCREEN 2 编码 → SCREEN 3 Run 结果
 * → SCREEN 4 判题中 → SCREEN 5 通过 / SCREEN 6 未通过
 *
 * 三种终态：
 * ✅ Success: Accepted + 下一道题 / 看动画讲解
 * ❌ Error:   WA / TLE / CE / RE 留在工作台，带失败用例与错误信息
 * ↩ Abandon:  草稿按「题目 + 语言」存 localStorage，下次恢复
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  UIEvent as ReactUIEvent,
} from 'react'
import { DifficultyBadge } from '../shared/DifficultyBadge'
import {
  LANGUAGE_OPTIONS,
  MOCK_SUBMISSION_RECORDS,
  VERDICT_META,
  VERDICT_ORDER,
  buildMockSubmission,
  findSolveProblem,
  formatRelativeTime,
  nextSolveProblem,
} from '../shared/mock-data'
import { VERDICT_TONE_STYLE } from '../shared/solve-ui'
import type {
  DraftRecord,
  RunResult,
  SolveLanguage,
  SolveProblem,
  SolveTestCase,
  SubmissionRecord,
  SubmissionResult,
  Verdict,
} from '../shared/types'

type FlowStage = 'initial' | 'coding' | 'run-result' | 'judging' | 'accepted' | 'rejected'
type ProblemTab = 'description' | 'hints' | 'submissions'
type MobilePane = 'problem' | 'code' | 'judge'

const DEBUG_STEPS: ReadonlyArray<{ id: FlowStage; label: string }> = [
  { id: 'initial', label: '1 初始' },
  { id: 'coding', label: '2 编码' },
  { id: 'run-result', label: '3 运行' },
  { id: 'judging', label: '4 判题中' },
  { id: 'accepted', label: '5 通过' },
  { id: 'rejected', label: '6 未通过' },
]

const MOBILE_PANES: ReadonlyArray<{ id: MobilePane; label: string }> = [
  { id: 'problem', label: '题面' },
  { id: 'code', label: '代码' },
  { id: 'judge', label: '判题' },
]

const STAGE_TITLE: Record<FlowStage, string> = {
  initial: '测试用例',
  coding: '测试用例',
  'run-result': '运行结果',
  judging: '判题中',
  accepted: '判题结果',
  rejected: '判题结果',
}

const FIELD_CLS =
  'w-full resize-none rounded-lg border border-white/10 bg-bg/60 px-2.5 py-2 font-mono text-[11px] ' +
  'leading-relaxed text-ink placeholder:text-sub transition-colors focus:border-accent/50 focus:outline-none'

const DRAFT_PREFIX = 'algomotion:solve-draft:'

function draftKey(problemId: string, language: SolveLanguage): string {
  return `${DRAFT_PREFIX}${problemId}:${language}`
}

function loadDraft(problemId: string, language: SolveLanguage): DraftRecord | null {
  try {
    const raw = localStorage.getItem(draftKey(problemId, language))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { code?: unknown; updatedAt?: unknown }
    if (typeof parsed.code !== 'string' || typeof parsed.updatedAt !== 'string') return null
    return { problemId, language, code: parsed.code, updatedAt: parsed.updatedAt }
  } catch {
    return null
  }
}

function loadLatestDraft(problemId: string): DraftRecord | null {
  let latest: DraftRecord | null = null
  for (const option of LANGUAGE_OPTIONS) {
    const draft = loadDraft(problemId, option.value)
    if (!draft) continue
    if (!latest || new Date(draft.updatedAt).getTime() > new Date(latest.updatedAt).getTime()) {
      latest = draft
    }
  }
  return latest
}

function saveDraft(record: DraftRecord): boolean {
  try {
    localStorage.setItem(draftKey(record.problemId, record.language), JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

function languageLabel(language: SolveLanguage): string {
  return LANGUAGE_OPTIONS.find((item) => item.value === language)?.label ?? language
}

/** 原型判题：代码动过且不含 TODO 才视为「写出了东西」 */
function isMeaningfulCode(problem: SolveProblem, language: SolveLanguage, code: string): boolean {
  const starter = problem.starterCode[language]
  return code.trim().length > 0 && code.trim() !== starter.trim() && !code.includes('TODO')
}

function simulateRun(
  problem: SolveProblem,
  language: SolveLanguage,
  code: string,
  customCase: SolveTestCase | null,
): RunResult {
  const meaningful = isMeaningfulCode(problem, language, code)
  const cases = customCase ? [...problem.sampleTests, customCase] : problem.sampleTests
  const outcomes = cases.map((test) => ({
    testId: test.id,
    label: test.label,
    passed: meaningful,
    expected: test.expected,
    actual: meaningful ? test.expected : '(未返回结果)',
  }))

  return {
    passed: outcomes.filter((item) => item.passed).length,
    total: outcomes.length,
    cases: outcomes,
    durationMs: 12 + outcomes.length * 7,
    ranAt: new Date().toISOString(),
  }
}

/** 弹层焦点陷阱：打开聚焦首个控件、Tab 循环、Escape 关闭、关闭归还焦点 */
function useFocusTrap<T extends HTMLElement>(active: boolean, onClose: () => void) {
  const containerRef = useRef<T>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!active) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const getFocusable = (): HTMLElement[] => {
      const node = containerRef.current
      if (!node) return []
      return Array.from(
        node.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')
    }

    getFocusable()[0]?.focus()

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = getFocusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      previous?.focus()
    }
  }, [active])

  return containerRef
}

export interface SolveWorkspaceProps {
  problem: SolveProblem
  onExit: () => void
  onOpenAnimation: (sampleId: string) => void
  onNextProblem: (problemId: string) => void
}

export function SolveWorkspaceFlow(props: SolveWorkspaceProps) {
  // key=problem.id：换题时整体重置会话状态
  return <SolveSession key={props.problem.id} {...props} />
}

export interface SolveWorkspaceRouteProps {
  problemId: string
  onExit: () => void
  onOpenAnimation: (sampleId: string) => void
  onNextProblem: (problemId: string) => void
}

/** App 入口：按 id 取题，避免把题面数据静态打进主包 */
export function SolveWorkspaceRoute({ problemId, ...rest }: SolveWorkspaceRouteProps) {
  const problem = findSolveProblem(problemId)

  if (!problem) {
    return (
      <div className="flex h-full items-center justify-center bg-bg px-6 text-center text-ink">
        <div>
          <p className="text-sm text-sub">这道题还没有开放做题，先看动画讲解吧。</p>
          <button
            type="button"
            onClick={rest.onExit}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-black transition-all hover:brightness-110"
          >
            返回题库
          </button>
        </div>
      </div>
    )
  }

  return <SolveWorkspaceFlow problem={problem} {...rest} />
}

function SolveSession({ problem, onExit, onOpenAnimation, onNextProblem }: SolveWorkspaceProps) {
  const [initialDraft] = useState(() => loadLatestDraft(problem.id))
  const [stage, setStage] = useState<FlowStage>('initial')
  const [language, setLanguage] = useState<SolveLanguage>(() => initialDraft?.language ?? 'javascript')
  const [code, setCode] = useState(
    () => initialDraft?.code ?? problem.starterCode[initialDraft?.language ?? 'javascript'],
  )
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(initialDraft?.updatedAt ?? null)
  const [restoredDraft] = useState(() => Boolean(initialDraft))
  const [problemTab, setProblemTab] = useState<ProblemTab>('description')
  const [hintLevel, setHintLevel] = useState(0)
  const [activeTestCaseId, setActiveTestCaseId] = useState(problem.sampleTests[0]?.id ?? '')
  const [customCase, setCustomCase] = useState<SolveTestCase | null>(null)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [submission, setSubmission] = useState<SubmissionResult | null>(null)
  const [sessionSubmissions, setSessionSubmissions] = useState<SubmissionRecord[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [mobilePane, setMobilePane] = useState<MobilePane>('problem')
  const [problemDrawerOpen, setProblemDrawerOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [forcedVerdict, setForcedVerdict] = useState<Verdict | null>(null)

  const drawerRef = useFocusTrap<HTMLElement>(problemDrawerOpen, () =>
    setProblemDrawerOpen(false),
  )
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const hasEditedRef = useRef(false)
  const latestDraftRef = useRef<DraftRecord | null>(null)
  const timersRef = useRef<number[]>([])
  const toastTimerRef = useRef<number | null>(null)

  const later = useCallback((task: () => void, delay: number) => {
    const id = window.setTimeout(task, delay)
    timersRef.current.push(id)
  }, [])

  const clearPending = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200)
  }, [])

  const focusEditor = useCallback(() => {
    window.requestAnimationFrame(() => editorRef.current?.focus())
  }, [])

  const persistDraft = useCallback(() => {
    if (!hasEditedRef.current) return
    const record: DraftRecord = {
      problemId: problem.id,
      language,
      code,
      updatedAt: new Date().toISOString(),
    }
    if (saveDraft(record)) setDraftSavedAt(record.updatedAt)
  }, [problem.id, language, code])

  // 记住最新草稿，供输入停顿 / 组件卸载（浏览器后退）时落盘
  useEffect(() => {
    latestDraftRef.current = {
      problemId: problem.id,
      language,
      code,
      updatedAt: new Date().toISOString(),
    }
  }, [code, language, problem.id])

  // 输入停顿 600ms 后自动保存草稿
  useEffect(() => {
    if (!hasEditedRef.current) return
    const timer = window.setTimeout(() => {
      const record: DraftRecord = {
        problemId: problem.id,
        language,
        code,
        updatedAt: new Date().toISOString(),
      }
      if (saveDraft(record)) setDraftSavedAt(record.updatedAt)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [code, language, problem.id])

  // 浏览器后退 / 关闭页面时也保存一次，避免最后一个 600ms 的修改丢失
  useEffect(() => {
    return () => {
      if (hasEditedRef.current && latestDraftRef.current) saveDraft(latestDraftRef.current)
    }
  }, [])

  useEffect(() => {
    if (restoredDraft) showToast('已恢复上次草稿')
  }, [restoredDraft, showToast])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  const canSubmit = isMeaningfulCode(problem, language, code) && stage !== 'judging' && !isRunning

  const startCoding = () => {
    if (stage === 'judging' || isRunning) return
    setStage('coding')
    setMobilePane('code')
    focusEditor()
  }

  const handleCodeChange = (next: string) => {
    if (stage === 'judging' || isRunning) return
    hasEditedRef.current = true
    setCode(next)
    if (stage !== 'coding') setStage('coding')
    setMobilePane('code')
  }

  const handleLanguageChange = (next: SolveLanguage) => {
    if (next === language || stage === 'judging' || isRunning) return
    persistDraft()
    const draft = loadDraft(problem.id, next)
    setLanguage(next)
    setCode(draft?.code ?? problem.starterCode[next])
    setDraftSavedAt(draft?.updatedAt ?? null)
    hasEditedRef.current = Boolean(draft)
    setRunResult(null)
    setSubmission(null)
    if (stage !== 'initial' && stage !== 'coding') setStage('coding')
    showToast(draft ? `已恢复 ${languageLabel(next)} 草稿` : `已切换到 ${languageLabel(next)}`)
  }

  const handleReset = () => {
    if (stage === 'judging' || isRunning) return
    persistDraft()
    hasEditedRef.current = true
    setCode(problem.starterCode[language])
    setRunResult(null)
    setSubmission(null)
    setStage('coding')
    setMobilePane('code')
    showToast('已恢复初始代码')
    focusEditor()
  }

  const handleRun = () => {
    if (isRunning || stage === 'judging') return
    setIsRunning(true)
    setStage('coding')
    setMobilePane('judge')
    later(() => {
      setRunResult(simulateRun(problem, language, code, customCase))
      setIsRunning(false)
      setStage('run-result')
      setMobilePane('judge')
    }, 650)
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    setIsRunning(false)
    setSubmission(null)
    setStage('judging')
    setMobilePane('judge')
    later(() => {
      const verdict =
        forcedVerdict ?? (isMeaningfulCode(problem, language, code) ? 'accepted' : 'wrong_answer')
      const nextSubmission = buildMockSubmission(problem, verdict)
      setSubmission(nextSubmission)
      setSessionSubmissions((records) => [
        {
          id: `session-${nextSubmission.submittedAt}`,
          problemId: problem.id,
          language,
          verdict: nextSubmission.verdict,
          submittedAt: nextSubmission.submittedAt,
          runtimeMs: nextSubmission.runtimeMs,
          code,
          ...(nextSubmission.failedCase ? { failedCase: nextSubmission.failedCase } : {}),
          ...(nextSubmission.errorMessage ? { errorMessage: nextSubmission.errorMessage } : {}),
        },
        ...records,
      ])
      setStage(verdict === 'accepted' ? 'accepted' : 'rejected')
      setMobilePane('judge')
    }, 1600)
  }

  const handleBackToEdit = () => {
    setStage('coding')
    setMobilePane('code')
    focusEditor()
  }

  const handleUnlockHint = () => {
    setHintLevel((level) => Math.min(level + 1, problem.hints.length))
  }

  const handleViewSubmissions = () => {
    setProblemTab('submissions')
    setMobilePane('problem')
    setProblemDrawerOpen(true)
  }

  const handleOpenAnimation = () => {
    persistDraft()
    onOpenAnimation(problem.animationId ?? problem.id)
  }

  const handleNextProblem = () => {
    persistDraft()
    onNextProblem(nextSolveProblem(problem.id).id)
  }

  const handleExit = () => {
    persistDraft()
    onExit()
  }

  /** DEV 设计预览：直接跳到任意屏（并取消尚未触发的 Run/Submit 定时器） */
  const jumpTo = (target: FlowStage) => {
    clearPending()
    setIsRunning(false)
    setProblemDrawerOpen(false)

    if (target === 'run-result') {
      setRunResult(simulateRun(problem, language, code, customCase))
      setStage('run-result')
      setMobilePane('judge')
      return
    }
    if (target === 'accepted') {
      setSubmission(buildMockSubmission(problem, 'accepted'))
      setStage('accepted')
      setMobilePane('judge')
      return
    }
    if (target === 'rejected') {
      const verdict =
        forcedVerdict !== null && forcedVerdict !== 'accepted' ? forcedVerdict : 'wrong_answer'
      setSubmission(buildMockSubmission(problem, verdict))
      setStage('rejected')
      setMobilePane('judge')
      return
    }
    if (target === 'judging') {
      setStage('judging')
      setMobilePane('judge')
      return
    }
    if (target === 'coding') {
      setStage('coding')
      setMobilePane('code')
      return
    }
    setStage('initial')
    setMobilePane('problem')
  }

  const currentSubmissionId = sessionSubmissions[0]?.id ?? null
  const submissionRecords = useMemo(() => {
    const base = MOCK_SUBMISSION_RECORDS.filter((record) => record.problemId === problem.id)
    return [...sessionSubmissions, ...base].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )
  }, [problem.id, sessionSubmissions])

  const topBarProps: TopBarProps = {
    problem,
    language,
    draftSavedAt,
    isRunning,
    isJudging: stage === 'judging',
    canSubmit,
    onLanguageChange: handleLanguageChange,
    onExit: handleExit,
    onOpenProblem: () => setProblemDrawerOpen(true),
    onRun: handleRun,
    onSubmit: handleSubmit,
  }

  const problemPaneProps: ProblemPaneProps = {
    problem,
    tab: problemTab,
    onTabChange: setProblemTab,
    hintLevel,
    onUnlockHint: handleUnlockHint,
    submissions: submissionRecords,
    currentSubmissionId,
    onOpenAnimation: handleOpenAnimation,
    onStartCoding: startCoding,
  }

  const editorProps: CodeEditorProps = {
    code,
    language,
    stage,
    draftSavedAt,
    textareaRef: editorRef,
    locked: isRunning || stage === 'judging',
    onChange: handleCodeChange,
    onStartCoding: startCoding,
    onRequestReset: () => {
      if (isRunning || stage === 'judging') return
      setResetConfirmOpen(true)
    },
  }

  const judgeProps: JudgePaneProps = {
    stage,
    problem,
    activeTestCaseId,
    onSelectTestCase: setActiveTestCaseId,
    customCase,
    onCustomCaseChange: setCustomCase,
    isRunning,
    runResult,
    submission,
    onRun: handleRun,
    onSubmit: handleSubmit,
    onBackToEdit: handleBackToEdit,
    onNextProblem: handleNextProblem,
    onOpenAnimation: handleOpenAnimation,
    onViewSubmissions: handleViewSubmissions,
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg text-ink">
      <TopBar {...topBarProps} />

      <div className="flex min-h-0 flex-1">
        <aside
          className={`${
            mobilePane === 'problem' ? 'flex' : 'hidden'
          } min-h-0 w-full shrink-0 flex-col border-r border-white/10 bg-surface/20 md:hidden lg:flex lg:w-[340px]`}
        >
          <ProblemPane {...problemPaneProps} />
        </aside>

        <main
          className={`${
            mobilePane === 'code' ? 'flex' : 'hidden'
          } min-h-0 min-w-0 flex-1 flex-col md:flex`}
        >
          {stage === 'coding' && submission && submission.verdict !== 'accepted' ? (
            <FailureBanner
              submission={submission}
              onView={() => {
                setStage('rejected')
                setMobilePane('judge')
              }}
            />
          ) : null}
          <CodeEditor {...editorProps} />
        </main>

        <aside
          className={`${
            mobilePane === 'judge' ? 'flex' : 'hidden'
          } min-h-0 w-full shrink-0 flex-col border-l border-white/10 bg-surface/20 md:flex md:w-[340px] lg:w-[380px]`}
        >
          <JudgePane {...judgeProps} />
        </aside>
      </div>

      <nav
        className="flex shrink-0 border-t border-white/10 bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="工作台分栏"
      >
        {MOBILE_PANES.map((pane) => (
          <button
            key={pane.id}
            type="button"
            onClick={() => setMobilePane(pane.id)}
            disabled={stage === 'judging'}
            aria-pressed={mobilePane === pane.id}
            className={`flex-1 border-t-2 py-2.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              mobilePane === pane.id
                ? 'border-accent font-medium text-accent'
                : 'border-transparent text-sub'
            }`}
          >
            {pane.label}
          </button>
        ))}
      </nav>

      {problemDrawerOpen ? (
        <div className="fixed inset-0 z-40 hidden md:flex lg:hidden">
          <button
            type="button"
            aria-label="关闭题面"
            onClick={() => setProblemDrawerOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="题面"
            className="relative z-10 flex h-full w-[360px] max-w-[85%] animate-fadeIn flex-col border-r border-white/10 bg-surface shadow-2xl"
          >
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 px-3">
              <span className="font-mono text-[11px] text-sub">题面</span>
              <button
                type="button"
                onClick={() => setProblemDrawerOpen(false)}
                aria-label="关闭"
                className="rounded p-1 text-sub transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ProblemPane {...problemPaneProps} />
            </div>
          </aside>
        </div>
      ) : null}

      {resetConfirmOpen ? (
        <ConfirmDialog
          title="恢复初始代码？"
          description="当前语言的编辑内容会被覆盖，已保存的草稿也会被替换。"
          confirmLabel="恢复初始代码"
          onCancel={() => setResetConfirmOpen(false)}
          onConfirm={() => {
            setResetConfirmOpen(false)
            handleReset()
          }}
        />
      ) : null}

      {toast ? <Toast message={toast} /> : null}

      {import.meta.env.DEV ? (
        <DebugRail
          stage={stage}
          onJump={jumpTo}
          forcedVerdict={forcedVerdict}
          onForcedVerdictChange={setForcedVerdict}
        />
      ) : null}
    </div>
  )
}

interface TopBarProps {
  problem: SolveProblem
  language: SolveLanguage
  draftSavedAt: string | null
  isRunning: boolean
  isJudging: boolean
  canSubmit: boolean
  onLanguageChange: (language: SolveLanguage) => void
  onExit: () => void
  onOpenProblem: () => void
  onRun: () => void
  onSubmit: () => void
}

function TopBar({
  problem,
  language,
  draftSavedAt,
  isRunning,
  isJudging,
  canSubmit,
  onLanguageChange,
  onExit,
  onOpenProblem,
  onRun,
  onSubmit,
}: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-surface px-2.5 md:gap-3 md:px-4">
      <button
        type="button"
        onClick={onExit}
        aria-label="返回题库"
        className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 font-mono text-xs text-sub transition-colors hover:bg-white/5 hover:text-ink"
      >
        <span aria-hidden>←</span>
        <span className="hidden sm:inline">题库</span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="shrink-0 font-mono text-[11px] text-sub">{problem.number}.</span>
          <h1 className="truncate text-sm font-medium">{problem.title}</h1>
          <span className="hidden shrink-0 sm:inline-flex">
            <DifficultyBadge difficulty={problem.difficulty} />
          </span>
        </div>
        <div className="mt-0.5 hidden items-center gap-2 font-mono text-[10px] text-sub sm:flex">
          <span>通过率 {problem.acceptanceRate}%</span>
          <span aria-hidden>·</span>
          <span>{problem.category}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${draftSavedAt ? 'bg-ok/70' : 'bg-sub/40'}`}
            />
            {draftSavedAt ? '草稿已保存' : '自动保存中'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenProblem}
        className="hidden shrink-0 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink md:inline-flex lg:hidden"
      >
        题面
      </button>

      <select
        value={language}
        onChange={(event) => onLanguageChange(event.target.value as SolveLanguage)}
        disabled={isJudging || isRunning}
        aria-label="切换语言"
        className="shrink-0 rounded-lg border border-white/10 bg-bg/60 px-2 py-1.5 text-xs text-sub transition-colors focus:border-accent/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.shortLabel}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onRun}
        disabled={isRunning || isJudging}
        className="solve-topbar-run shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isRunning ? '运行中…' : '运行'}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="shrink-0 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isJudging ? '判题中…' : '提交'}
      </button>
    </header>
  )
}

interface ProblemPaneProps {
  problem: SolveProblem
  tab: ProblemTab
  onTabChange: (tab: ProblemTab) => void
  hintLevel: number
  onUnlockHint: () => void
  submissions: SubmissionRecord[]
  currentSubmissionId: string | null
  onOpenAnimation: () => void
  onStartCoding: () => void
}

function ProblemPane({
  problem,
  tab,
  onTabChange,
  hintLevel,
  onUnlockHint,
  submissions,
  currentSubmissionId,
  onOpenAnimation,
  onStartCoding,
}: ProblemPaneProps) {
  const tabs: Array<{ id: ProblemTab; label: string }> = [
    { id: 'description', label: '描述' },
    {
      id: 'hints',
      label: hintLevel > 0 ? `提示 ${hintLevel}/${problem.hints.length}` : '提示',
    },
    { id: 'submissions', label: `提交 ${submissions.length}` },
  ]

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 gap-1 border-b border-white/10 px-2 py-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            aria-pressed={tab === item.id}
            className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-colors ${
              tab === item.id
                ? 'bg-accent/15 font-medium text-accent'
                : 'text-sub hover:bg-white/5 hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
        {tab === 'description' ? (
          <DescriptionTab
            problem={problem}
            onUnlockHint={() => {
              onTabChange('hints')
              onUnlockHint()
            }}
            onStartCoding={onStartCoding}
          />
        ) : null}
        {tab === 'hints' ? (
          <HintsTab
            problem={problem}
            hintLevel={hintLevel}
            onUnlockHint={onUnlockHint}
            onOpenAnimation={onOpenAnimation}
          />
        ) : null}
        {tab === 'submissions' ? (
          <SubmissionsTab
            records={submissions}
            currentSubmissionId={currentSubmissionId}
            onStartCoding={onStartCoding}
          />
        ) : null}
      </div>
    </div>
  )
}

function DescriptionTab({
  problem,
  onUnlockHint,
  onStartCoding,
}: {
  problem: SolveProblem
  onUnlockHint: () => void
  onStartCoding: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-sub">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span>{problem.category}</span>
        <span aria-hidden>·</span>
        <span>通过率 {problem.acceptanceRate}%</span>
      </div>

      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink/90">
        {problem.description}
      </p>

      <section>
        <h2 className="mb-2 font-mono text-[11px] tracking-wide text-sub">示例</h2>
        <div className="space-y-2">
          {problem.examples.map((example) => (
            <div key={example.id} className="rounded-xl border border-white/10 bg-surface p-3">
              <div className="font-mono text-[10px] text-sub">{example.label}</div>
              <div className="mt-2 space-y-1.5 font-mono text-[12px] leading-relaxed">
                <div>
                  <span className="text-sub">输入：</span>
                  {example.input}
                </div>
                <div>
                  <span className="text-sub">输出：</span>
                  <span className="text-ok">{example.output}</span>
                </div>
              </div>
              {example.explanation ? (
                <p className="mt-2 text-[11px] leading-relaxed text-sub">{example.explanation}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-mono text-[11px] tracking-wide text-sub">约束</h2>
        <ul className="space-y-1 font-mono text-[11px] leading-relaxed text-sub">
          {problem.constraints.map((constraint) => (
            <li key={constraint}>· {constraint}</li>
          ))}
        </ul>
      </section>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onUnlockHint}
          className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-accent/40 hover:text-accent"
        >
          看提示
        </button>
        <button
          type="button"
          onClick={onStartCoding}
          className="flex-1 rounded-lg bg-accent/15 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/25"
        >
          开始编码
        </button>
      </div>
    </div>
  )
}

function HintsTab({
  problem,
  hintLevel,
  onUnlockHint,
  onOpenAnimation,
}: {
  problem: SolveProblem
  hintLevel: number
  onUnlockHint: () => void
  onOpenAnimation: () => void
}) {
  const unlocked = problem.hints.slice(0, hintLevel)
  const allUnlocked = hintLevel >= problem.hints.length

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-sub">
        提示按「从方向到细节」逐条解锁。建议先自己写 5 分钟，卡住再看下一条。
      </p>

      {unlocked.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-surface/40 p-4 text-center text-xs text-sub">
          还没有解锁提示
        </div>
      ) : null}

      {unlocked.map((hint, index) => (
        <div key={`${index}-${hint}`} className="rounded-xl border border-white/10 bg-surface p-3">
          <div className="font-mono text-[10px] text-accent">提示 {index + 1}</div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/90">{hint}</p>
        </div>
      ))}

      {!allUnlocked ? (
        <button
          type="button"
          onClick={onUnlockHint}
          className="w-full rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-accent transition-colors hover:bg-accent/15"
        >
          解锁第 {hintLevel + 1} 条提示（{hintLevel}/{problem.hints.length}）
        </button>
      ) : (
        <div className="space-y-2">
          <div className="rounded-xl border border-ok/30 bg-ok/10 px-3 py-2.5 text-xs text-ok">
            提示已全部解锁，先试着自己实现一遍。
          </div>
          <button
            type="button"
            onClick={onOpenAnimation}
            className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-xs text-sub transition-colors hover:border-accent/40 hover:text-accent"
          >
            还是不懂？看动画讲解 →
          </button>
        </div>
      )}
    </div>
  )
}

function SubmissionsTab({
  records,
  currentSubmissionId,
  onStartCoding,
}: {
  records: SubmissionRecord[]
  currentSubmissionId: string | null
  onStartCoding: () => void
}) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-surface/40 p-5 text-center">
        <p className="text-xs text-sub">还没有提交记录</p>
        <p className="mt-1 text-[11px] leading-relaxed text-sub">
          运行只跑示例用例，写完后再用右上角「提交」跑隐藏用例。
        </p>
        <button
          type="button"
          onClick={onStartCoding}
          className="mt-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11px] text-accent transition-colors hover:bg-accent/15"
        >
          开始编码
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <details
          key={record.id}
          className="group rounded-xl border border-white/10 bg-surface open:border-white/20"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-center gap-2">
              <VerdictBadge verdict={record.verdict} />
              {record.id === currentSubmissionId ? (
                <span className="rounded-full bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                  本次
                </span>
              ) : null}
              <span className="truncate font-mono text-[10px] text-sub">
                {languageLabel(record.language)}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-sub">
              <span>
                {formatRelativeTime(record.submittedAt)} · {record.runtimeMs} ms
              </span>
              <span aria-hidden className="text-sub transition-transform group-open:rotate-90">
                ▸
              </span>
            </span>
          </summary>
          {record.failedCase ? (
            <div className="border-t border-white/5 px-3 py-2 font-mono text-[10px] leading-relaxed text-sub">
              <div>
                {record.failedCase.label} · 期望{' '}
                <span className="text-ink">{record.failedCase.expected}</span> · 实际{' '}
                <span className="text-danger">{record.failedCase.actual}</span>
              </div>
              <div className="mt-1">输入：{record.failedCase.input}</div>
            </div>
          ) : null}
          {record.errorMessage ? (
            <pre className="border-t border-white/5 px-3 py-2 font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-danger">
              {record.errorMessage}
            </pre>
          ) : null}
          <pre className="max-h-44 overflow-auto border-t border-white/5 p-3 font-mono text-[11px] leading-relaxed text-sub">
            {record.code}
          </pre>
        </details>
      ))}
    </div>
  )
}

/** 编辑态保留上次失败现场，避免「继续修改」后只能凭记忆改代码 */
function FailureBanner({
  submission,
  onView,
}: {
  submission: SubmissionResult
  onView: () => void
}) {
  const meta = VERDICT_META[submission.verdict]
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-danger/30 bg-danger/10 px-3 py-2 text-[11px]">
      <span className="font-mono text-danger">
        {meta.code} {meta.label}
      </span>
      {submission.failedCase ? (
        <>
          <span className="text-sub">{submission.failedCase.label}</span>
          <span className="font-mono text-sub">
            期望 <span className="text-ink">{submission.failedCase.expected}</span>
          </span>
          <span className="font-mono text-sub">
            实际 <span className="text-danger">{submission.failedCase.actual}</span>
          </span>
        </>
      ) : submission.errorMessage ? (
        <span className="min-w-0 truncate font-mono text-danger">{submission.errorMessage}</span>
      ) : null}
      <button
        type="button"
        onClick={onView}
        className="ml-auto shrink-0 rounded border border-danger/40 px-2 py-0.5 text-[10px] text-danger transition-colors hover:bg-danger/15"
      >
        查看完整结果
      </button>
    </div>
  )
}

interface CodeEditorProps {
  code: string
  language: SolveLanguage
  stage: FlowStage
  draftSavedAt: string | null
  textareaRef: RefObject<HTMLTextAreaElement>
  locked: boolean
  onChange: (next: string) => void
  onStartCoding: () => void
  onRequestReset: () => void
}

function CodeEditor({
  code,
  language,
  stage,
  draftSavedAt,
  textareaRef,
  locked,
  onChange,
  onStartCoding,
  onRequestReset,
}: CodeEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const [cursorLine, setCursorLine] = useState(1)
  const lines = useMemo(() => code.split('\n'), [code])

  const syncCursor = (element: HTMLTextAreaElement) => {
    const before = element.value.slice(0, element.selectionStart)
    setCursorLine(before.split('\n').length)
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
    syncCursor(event.target)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.currentTarget.blur()
      return
    }
    if (event.key !== 'Tab') return
    // Shift+Tab 保留浏览器默认行为，让键盘用户能离开编辑器（避免键盘陷阱）
    if (event.shiftKey) return
    event.preventDefault()
    const element = event.currentTarget
    const start = element.selectionStart
    const end = element.selectionEnd
    const value = element.value
    onChange(value.slice(0, start) + '  ' + value.slice(end))
    window.requestAnimationFrame(() => {
      element.selectionStart = start + 2
      element.selectionEnd = start + 2
    })
  }

  const handleScroll = (event: ReactUIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-3 font-mono text-[10px] text-sub">
        <div className="flex items-center gap-2">
          <span className="text-ink">{languageLabel(language)}</span>
          <span aria-hidden>·</span>
          <span>{lines.length} 行</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 lg:flex">Tab 缩进 · Shift+Tab 退出</span>
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${draftSavedAt ? 'bg-ok/70' : 'bg-sub/40'}`} />
            {draftSavedAt ? '草稿已保存' : '自动保存中'}
          </span>
          <button
            type="button"
            onClick={onRequestReset}
            disabled={locked}
            className="rounded border border-white/10 px-1.5 py-0.5 transition-colors hover:border-white/25 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            重置
          </button>
        </div>
      </div>

      {stage === 'initial' ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-accent/20 bg-accent/10 px-3 py-2 text-[11px]">
          <span className="text-sub">先读题，再开始编码；草稿会自动保存</span>
          <button
            type="button"
            onClick={onStartCoding}
            className="shrink-0 rounded-md bg-accent px-2.5 py-1 font-medium text-black"
          >
            开始编码
          </button>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          ref={gutterRef}
          aria-hidden
          className="w-11 shrink-0 overflow-hidden border-r border-white/5 bg-surface/30 py-3 text-right font-mono text-[11px] leading-[22px] text-sub/80"
        >
          {lines.map((_line, index) => (
            <div key={index} className={index + 1 === cursorLine ? 'text-accent' : undefined}>
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={(event) => syncCursor(event.currentTarget)}
          onClick={(event) => syncCursor(event.currentTarget)}
          onScroll={handleScroll}
          spellCheck={false}
          wrap="off"
          readOnly={locked}
          aria-label="代码编辑器"
          title="Tab 缩进 · Shift+Tab 退出编辑器 · Esc 失焦"
          className="min-h-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 font-mono text-[12.5px] leading-[22px] text-ink outline-none read-only:opacity-70"
        />
      </div>
    </div>
  )
}

interface JudgePaneProps {
  stage: FlowStage
  problem: SolveProblem
  activeTestCaseId: string
  onSelectTestCase: (id: string) => void
  customCase: SolveTestCase | null
  onCustomCaseChange: (next: SolveTestCase | null) => void
  isRunning: boolean
  runResult: RunResult | null
  submission: SubmissionResult | null
  onRun: () => void
  onSubmit: () => void
  onBackToEdit: () => void
  onNextProblem: () => void
  onOpenAnimation: () => void
  onViewSubmissions: () => void
}

function JudgePane(props: JudgePaneProps) {
  const { stage, runResult, submission } = props

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-3 font-mono text-[10px] text-sub">
        <div className="flex items-center gap-2">
          <span>{STAGE_TITLE[stage]}</span>
          <span
            title="原型模式：判题结果为前端模拟，不执行真实代码"
            className="rounded-full border border-warn/30 bg-warn/10 px-1.5 py-0.5 text-[10px] text-warn"
          >
            原型模拟
          </span>
        </div>
        {stage === 'run-result' && runResult ? (
          <span className={runResult.passed === runResult.total ? 'text-ok' : 'text-danger'}>
            通过 {runResult.passed}/{runResult.total}
          </span>
        ) : null}
        {stage === 'judging' ? <span className="text-warn">判题中…</span> : null}
        {stage === 'accepted' ? <span className="text-ok">AC</span> : null}
        {stage === 'rejected' && submission ? (
          <span className="text-danger">{VERDICT_META[submission.verdict].code}</span>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">{renderJudgeContent(props)}</div>
    </div>
  )
}

function renderJudgeContent(props: JudgePaneProps) {
  const casesPanel = (
    <CasesPanel
      problem={props.problem}
      customCase={props.customCase}
      onCustomCaseChange={props.onCustomCaseChange}
      activeTestCaseId={props.activeTestCaseId}
      onSelectTestCase={props.onSelectTestCase}
      isRunning={props.isRunning}
      onRun={props.onRun}
    />
  )

  /* ================================================
     FLOW: Solve Workspace（解题工作台）
     SCREEN 1 of 6: 工作台·初始
     ------------------------------------------------
     ENTRY:  题库「去做题」/ 首页「继续上次」
     EXIT:   「开始编码」→ SCREEN 2: 工作台·编码
     BRANCH: 「运行」→ SCREEN 3；「看提示」→ 左栏提示 Tab
     ================================================ */
  if (props.stage === 'initial') return casesPanel

  /* ================================================
     FLOW: Solve Workspace（解题工作台）
     SCREEN 2 of 6: 工作台·编码
     ------------------------------------------------
     ENTRY:  SCREEN 1「开始编码」/ SCREEN 3、6「继续修改」
     EXIT:   「运行」→ SCREEN 3；「提交」→ SCREEN 4
     BRANCH: 切换语言 → 恢复该语言草稿；编辑即自动保存
     ================================================ */
  if (props.stage === 'coding') return casesPanel

  /* ================================================
     FLOW: Solve Workspace（解题工作台）
     SCREEN 3 of 6: Run 结果
     ------------------------------------------------
     ENTRY:  SCREEN 2「运行」完成
     EXIT:   「提交判题」→ SCREEN 4: 提交判题
     BRANCH: 「继续修改」→ SCREEN 2
     ================================================ */
  if (props.stage === 'run-result') {
    if (!props.runResult) return casesPanel
    return (
      <RunResultPanel
        runResult={props.runResult}
        onBackToEdit={props.onBackToEdit}
        onSubmit={props.onSubmit}
      />
    )
  }

  /* ================================================
     FLOW: Solve Workspace（解题工作台）
     SCREEN 4 of 6: 提交判题
     ------------------------------------------------
     ENTRY:  SCREEN 2 / 3「提交」
     EXIT:   判题完成 → SCREEN 5（AC）/ SCREEN 6（非 AC）
     BRANCH: 原型可用设计预览强制结论
     ================================================ */
  if (props.stage === 'judging') {
    return <JudgingPanel totalCases={props.problem.hiddenCaseCount} />
  }

  /* ================================================
     FLOW: Solve Workspace（解题工作台）
     SCREEN 5 of 6: 判题通过
     ------------------------------------------------
     ENTRY:  SCREEN 4 判题通过
     EXIT:   「下一道题」→ 新 flow 实例；顶部「题库」→ 退出
     BRANCH: 「看动画」→ 现有播放页；「提交记录」→ 左栏
     ================================================ */
  if (props.stage === 'accepted') {
    if (!props.submission) return casesPanel
    return (
      <AcceptedPanel
        submission={props.submission}
        onNextProblem={props.onNextProblem}
        onOpenAnimation={props.onOpenAnimation}
        onViewSubmissions={props.onViewSubmissions}
      />
    )
  }

  /* ================================================
     FLOW: Solve Workspace（解题工作台）
     SCREEN 6 of 6: 判题未通过
     ------------------------------------------------
     ENTRY:  SCREEN 4 判题未通过（WA / TLE / CE / RE）
     EXIT:   「继续修改」→ SCREEN 2
     BRANCH: 「查看提交记录」→ 左栏；「看动画」→ 现有播放页
     ================================================ */
  if (props.stage === 'rejected') {
    if (!props.submission) return casesPanel
    return (
      <RejectedPanel
        submission={props.submission}
        onBackToEdit={props.onBackToEdit}
        onOpenAnimation={props.onOpenAnimation}
        onViewSubmissions={props.onViewSubmissions}
      />
    )
  }

  return casesPanel
}

interface CasesPanelProps {
  problem: SolveProblem
  customCase: SolveTestCase | null
  onCustomCaseChange: (next: SolveTestCase | null) => void
  activeTestCaseId: string
  onSelectTestCase: (id: string) => void
  isRunning: boolean
  onRun: () => void
}

function CasesPanel({
  problem,
  customCase,
  onCustomCaseChange,
  activeTestCaseId,
  onSelectTestCase,
  isRunning,
  onRun,
}: CasesPanelProps) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [expected, setExpected] = useState('')

  const cases = useMemo(
    () => (customCase ? [...problem.sampleTests, customCase] : problem.sampleTests),
    [problem.sampleTests, customCase],
  )
  const activeCase = cases.find((item) => item.id === activeTestCaseId) ?? cases[0]

  const openEditor = () => {
    setInput(customCase?.input ?? '')
    setExpected(customCase?.expected === '—' ? '' : customCase?.expected ?? '')
    setEditing(true)
  }

  const saveCustomCase = () => {
    const trimmed = input.trim()
    const trimmedExpected = expected.trim()
    if (!trimmed || !trimmedExpected) return
    onCustomCaseChange({
      id: 'custom-case',
      label: '自定义',
      input: trimmed,
      expected: trimmedExpected,
      custom: true,
    })
    onSelectTestCase('custom-case')
    setEditing(false)
  }

  const removeCustomCase = () => {
    onCustomCaseChange(null)
    setEditing(false)
    const first = problem.sampleTests[0]
    if (first) onSelectTestCase(first.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {cases.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTestCase(item.id)}
              aria-pressed={activeCase?.id === item.id}
              className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] transition-colors ${
                activeCase?.id === item.id
                  ? 'border-accent/60 bg-accent/15 text-accent'
                  : 'border-white/10 text-sub hover:border-white/25 hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={openEditor}
            className="shrink-0 rounded-full border border-dashed border-white/20 px-3 py-1 font-mono text-[10px] text-sub transition-colors hover:border-accent/50 hover:text-accent"
          >
            {customCase ? '编辑自定义' : '＋ 自定义'}
          </button>
        </div>

        {activeCase ? (
          <div className="rounded-xl border border-white/10 bg-bg/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-sub">{activeCase.label}</span>
              {activeCase.custom ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-accent">自定义</span>
                  <button
                    type="button"
                    onClick={removeCustomCase}
                    className="font-mono text-[10px] text-danger transition-colors hover:underline"
                  >
                    删除
                  </button>
                </div>
              ) : null}
            </div>
            <div className="mt-2 space-y-2 font-mono text-[11.5px] leading-relaxed">
              <div>
                <div className="text-sub">输入</div>
                <div className="mt-1 whitespace-pre-wrap text-ink">{activeCase.input}</div>
              </div>
              <div>
                <div className="text-sub">期望输出</div>
                <div className="mt-1 whitespace-pre-wrap text-ok">{activeCase.expected}</div>
              </div>
            </div>
          </div>
        ) : null}

        {editing ? (
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
            <div className="font-mono text-[10px] text-accent">自定义用例</div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              aria-label="自定义用例输入"
              placeholder="输入，如 nums = [1,2], target = 3"
              className={`${FIELD_CLS} mt-2`}
            />
            <textarea
              value={expected}
              onChange={(event) => setExpected(event.target.value)}
              rows={1}
              aria-label="自定义用例期望输出"
              placeholder="期望输出（必填）"
              className={`${FIELD_CLS} mt-2`}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-sub transition-colors hover:border-white/25 hover:text-ink"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveCustomCase}
                disabled={!input.trim() || !expected.trim()}
                className="rounded-lg bg-accent px-3 py-1.5 text-[11px] font-medium text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                保存用例
              </button>
            </div>
          </div>
        ) : null}

        <p className="font-mono text-[10px] leading-relaxed text-sub">
          原型模拟判题：运行只跑示例/自定义用例，提交使用预设结论，不会执行真实代码。
        </p>
      </div>

      <div className="shrink-0 space-y-1.5 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? '运行中…' : '运行示例'}
        </button>
        <p className="text-center font-mono text-[10px] text-sub">提交请用右上角「提交」</p>
      </div>
    </div>
  )
}

function RunResultPanel({
  runResult,
  onBackToEdit,
  onSubmit,
}: {
  runResult: RunResult
  onBackToEdit: () => void
  onSubmit: () => void
}) {
  const allPassed = runResult.passed === runResult.total

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        <div
          className={`rounded-xl border p-3 ${
            allPassed ? 'border-ok/30 bg-ok/10' : 'border-danger/30 bg-danger/10'
          }`}
        >
          <div className={`text-sm font-medium ${allPassed ? 'text-ok' : 'text-danger'}`}>
            {allPassed ? '示例全部通过' : '还有用例未通过'}
          </div>
          <div className="mt-1 font-mono text-[10px] text-sub">
            通过 {runResult.passed} / {runResult.total} · {runResult.durationMs} ms
          </div>
        </div>

        {runResult.cases.map((item) => (
          <div
            key={item.testId}
            className={`rounded-xl border p-3 ${
              item.passed ? 'border-white/10 bg-surface' : 'border-danger/30 bg-danger/5'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs">
                {item.passed ? '✓' : '✕'} {item.label}
              </span>
              <span className={`font-mono text-[10px] ${item.passed ? 'text-ok' : 'text-danger'}`}>
                {item.passed ? '通过' : '失败'}
              </span>
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed">
              <div>
                <span className="text-sub">期望 </span>
                {item.expected}
              </div>
              <div>
                <span className="text-sub">实际 </span>
                <span className={item.passed ? 'text-ok' : 'text-danger'}>{item.actual}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onBackToEdit}
          className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink"
        >
          继续修改
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-black transition-all hover:brightness-110 active:scale-[0.98]"
        >
          提交判题
        </button>
      </div>
    </div>
  )
}

function JudgingPanel({ totalCases }: { totalCases: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div
        role="status"
        aria-label="正在判题"
        className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-accent"
      />
      <div>
        <div className="text-sm text-ink">正在判题…</div>
        <div className="mt-1 font-mono text-[10px] text-sub">即将运行 {totalCases} 个隐藏用例</div>
      </div>
      <div className="w-full max-w-[240px]">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-accent/80" />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-sub">
          <span>编译</span>
          <span>运行用例</span>
          <span>汇总</span>
        </div>
      </div>
      <p className="font-mono text-[10px] text-sub">请勿关闭页面</p>
    </div>
  )
}

function AcceptedPanel({
  submission,
  onNextProblem,
  onOpenAnimation,
  onViewSubmissions,
}: {
  submission: SubmissionResult
  onNextProblem: () => void
  onOpenAnimation: () => void
  onViewSubmissions: () => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <div className="rounded-2xl border border-ok/30 bg-ok/10 p-4 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ok/15 text-xl text-ok">
            ✓
          </div>
          <div className="mt-2 text-base font-semibold text-ok">Accepted</div>
          <div className="mt-1 font-mono text-[10px] text-sub">
            通过 {submission.passedCases} / {submission.totalCases} 个用例 ·{' '}
            {formatRelativeTime(submission.submittedAt)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="运行时间"
            value={`${submission.runtimeMs} ms`}
            percentile={submission.runtimePercentile}
            bar="bg-ok"
          />
          <StatCard
            label="内存占用"
            value={`${submission.memoryMb} MB`}
            percentile={submission.memoryPercentile}
            bar="bg-accent"
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-surface p-3 text-[11px] leading-relaxed text-sub">
          你的解法已经记录到提交历史。想弄懂每一步为什么这样走，可以看同题的逐帧动画。
          原型模拟判题的结果不代表真实执行。
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onNextProblem}
          className="w-full rounded-lg bg-accent px-3 py-2.5 text-xs font-medium text-black transition-all hover:brightness-110 active:scale-[0.99]"
        >
          下一道题 →
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenAnimation}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-accent/40 hover:text-accent"
          >
            看动画讲解
          </button>
          <button
            type="button"
            onClick={onViewSubmissions}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink"
          >
            提交记录
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  percentile,
  bar,
}: {
  label: string
  value: string
  percentile: number
  bar: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-3">
      <div className="font-mono text-[10px] text-sub">{label}</div>
      <div className="mt-1 text-sm tabular-nums text-ink">{value}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${Math.min(100, Math.max(0, percentile))}%` }}
        />
      </div>
      <div className="mt-1 font-mono text-[10px] tabular-nums text-sub">击败 {percentile}%</div>
    </div>
  )
}

function RejectedPanel({
  submission,
  onBackToEdit,
  onOpenAnimation,
  onViewSubmissions,
}: {
  submission: SubmissionResult
  onBackToEdit: () => void
  onOpenAnimation: () => void
  onViewSubmissions: () => void
}) {
  const meta = VERDICT_META[submission.verdict]
  const showFailedCase =
    submission.verdict === 'wrong_answer' || submission.verdict === 'time_limit'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <div className={`rounded-2xl border p-4 ${VERDICT_TONE_STYLE[meta.tone]}`}>
          <div className="flex items-center gap-2">
            <VerdictBadge verdict={submission.verdict} size="lg" />
            <span className="text-sm font-medium">{meta.label}</span>
          </div>
          <div className="mt-2 font-mono text-[10px] opacity-80">
            通过 {submission.passedCases} / {submission.totalCases} 个用例 ·{' '}
            {formatRelativeTime(submission.submittedAt)}
          </div>
        </div>

        {submission.errorMessage ? (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-3">
            <div className="font-mono text-[10px] text-danger">错误信息</div>
            <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-danger/90">
              {submission.errorMessage}
            </pre>
          </div>
        ) : null}

        {showFailedCase && submission.failedCase ? (
          <div className="rounded-xl border border-white/10 bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-sub">{submission.failedCase.label}</span>
              <span className="font-mono text-[10px] text-danger">未通过</span>
            </div>
            <div className="mt-2 space-y-1.5 font-mono text-[11px] leading-relaxed">
              <div>
                <span className="text-sub">输入 </span>
                {submission.failedCase.input}
              </div>
              <div>
                <span className="text-sub">期望 </span>
                {submission.failedCase.expected}
              </div>
              <div>
                <span className="text-sub">实际 </span>
                <span className="text-danger">{submission.failedCase.actual}</span>
              </div>
            </div>
          </div>
        ) : null}

        <p className="text-[11px] leading-relaxed text-sub">
          失败现场已保留，编辑器里的代码不会丢。建议先看失败用例，再回到代码定位差异。
          原型模拟判题的结果不代表真实执行。
        </p>
      </div>

      <div className="shrink-0 space-y-2 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onBackToEdit}
          className="w-full rounded-lg bg-accent px-3 py-2.5 text-xs font-medium text-black transition-all hover:brightness-110 active:scale-[0.99]"
        >
          继续修改
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onViewSubmissions}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink"
          >
            提交记录
          </button>
          <button
            type="button"
            onClick={onOpenAnimation}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-accent/40 hover:text-accent"
          >
            看动画讲解
          </button>
        </div>
      </div>
    </div>
  )
}

function VerdictBadge({ verdict, size = 'sm' }: { verdict: Verdict; size?: 'sm' | 'lg' }) {
  const meta = VERDICT_META[verdict]
  return (
    <span
      title={meta.label}
      className={`inline-flex shrink-0 items-center rounded-full border font-mono ${
        VERDICT_TONE_STYLE[meta.tone]
      } ${size === 'lg' ? 'px-3 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]'}`}
    >
      {meta.code}
    </span>
  )
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>(true, onCancel)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fadeIn bg-black/60" onClick={onCancel} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="solve-confirm-title"
        className="relative z-10 w-full max-w-sm animate-fadeIn rounded-2xl border border-white/10 bg-surface p-4 shadow-2xl"
      >
        <h2 id="solve-confirm-title" className="text-sm font-medium">
          {title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-sub">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-danger px-3 py-2 text-xs font-medium text-white transition-all hover:brightness-110"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 animate-fadeIn rounded-xl border border-white/10 bg-surface-2 px-4 py-2 text-xs text-ink shadow-2xl md:bottom-6"
    >
      {message}
    </div>
  )
}

function DebugRail({
  stage,
  onJump,
  forcedVerdict,
  onForcedVerdictChange,
}: {
  stage: FlowStage
  onJump: (stage: FlowStage) => void
  forcedVerdict: Verdict | null
  onForcedVerdictChange: (verdict: Verdict | null) => void
}) {
  return (
    <div className="fixed bottom-16 left-2 z-50 rounded-xl border border-white/10 bg-surface/95 p-2 shadow-xl backdrop-blur md:bottom-3 md:left-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-wide text-sub">设计预览</span>
        <span className="font-mono text-[10px] text-accent">DEV</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {DEBUG_STEPS.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onJump(step.id)}
            className={`rounded border px-1.5 py-1 font-mono text-[10px] transition-colors ${
              stage === step.id
                ? 'border-accent/60 bg-accent/15 text-accent'
                : 'border-white/10 text-sub hover:border-white/25 hover:text-ink'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>
      <label className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[10px] text-sub">
        判题
        <select
          value={forcedVerdict ?? 'auto'}
          onChange={(event) =>
            onForcedVerdictChange(event.target.value === 'auto' ? null : (event.target.value as Verdict))
          }
          className="rounded border border-white/10 bg-bg/60 px-1 py-0.5 text-[10px] text-sub focus:outline-none"
        >
          <option value="auto">自动</option>
          {VERDICT_ORDER.map((verdict) => (
            <option key={verdict} value={verdict}>
              {VERDICT_META[verdict].label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
