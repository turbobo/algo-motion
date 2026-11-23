/**
 * 播放页：左代码 / 右舞台的双栏布局（窄屏纵排），
 * 含讲解条、变量面板、用例切换与播放控制。
 *
 * 结构说明：外层负责选择「播放哪个用例的帧」；内层用 key 重挂载，
 * 切换用例时播放状态自然重置。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AlgorithmCase, Frame, FrameDiagnostics } from '../types'
import { describeDiagnostics, hasDiagnostics } from '../engine/sanitize'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SPEED_OPTIONS, usePlayer } from '../hooks/usePlayer'
import { CodePanel } from '../components/player/CodePanel'
import { PlaybackBar } from '../components/player/PlaybackBar'
import { StageView } from '../components/player/StageView'
import { FrameList } from '../components/player/FrameList'
import { CallStackPanel } from '../components/player/CallStackPanel'
import { VarsPanel } from '../components/player/VarsPanel'
import { diffViews } from '../components/renderers/frameDiff'
import { ThemeToggle } from '../components/ThemeToggle'
import { CATALOG } from '../samples/catalog'
import { SolutionCompare } from '../components/compare/SolutionCompare'
import { executeInstrumentResult } from '../engine/runner'

interface Props {
  algoCase: AlgorithmCase
  onBack: () => void
  /** 返回按钮文案（从解题工作台进入时为「返回解题」） */
  backLabel?: string
  /** 播放到最后一帧时回调（首页据此记「已学」） */
  onLearned?: () => void
  /** 同题对照解法的样题 id（无则不显示切换按钮） */
  relatedId?: string
  /** 切换到对照解法 */
  onOpenRelated?: (id: string) => void
}

/** 诊断摘要（无异常时返回空数组，徽章不展示） */
function diagnosticLines(diag: FrameDiagnostics | undefined): string[] {
  return hasDiagnostics(diag) ? describeDiagnostics(diag as FrameDiagnostics) : []
}

/** 默认播放：第一个「通过且产帧」的用例 */
function pickDefaultTest(algoCase: AlgorithmCase): number {
  const passed = algoCase.tests.findIndex((t) => t.passed && t.frameCount > 0)
  if (passed >= 0) return passed
  const anyFrames = algoCase.tests.findIndex((t) => t.frameCount > 0)
  return anyFrames >= 0 ? anyFrames : 0
}

export function PlayerScreen({
  algoCase,
  onBack,
  backLabel = '换一题',
  onLearned,
  relatedId,
  onOpenRelated,
}: Props) {
  const [testIdx, setTestIdx] = useState(() => pickDefaultTest(algoCase))
  const frames = algoCase.framesByTest[testIdx] ?? []
  const passedCount = algoCase.tests.filter((t) => t.passed).length
  const allPassed = passedCount === algoCase.tests.length

  return (
    <PlayerInner
      key={`${algoCase.id}-${testIdx}`}
      algoCase={algoCase}
      frames={frames}
      testIdx={testIdx}
      passedCount={passedCount}
      allPassed={allPassed}
      onChangeTest={setTestIdx}
      onBack={onBack}
      backLabel={backLabel}
      onLearned={onLearned}
      relatedId={relatedId}
      onOpenRelated={onOpenRelated}
    />
  )
}

interface InnerProps {
  algoCase: AlgorithmCase
  frames: Frame[]
  testIdx: number
  passedCount: number
  allPassed: boolean
  onChangeTest: (i: number) => void
  onBack: () => void
  backLabel: string
  onLearned?: () => void
  relatedId?: string
  onOpenRelated?: (id: string) => void
}

function PlayerInner({
  algoCase,
  frames,
  testIdx,
  passedCount,
  allPassed,
  onChangeTest,
  onBack,
  backLabel,
  onLearned,
  relatedId,
}: InnerProps) {
  const { cursor, playing, speed, setSpeed, next, prev, seek, toggle, setPlaying } = usePlayer(frames.length)
  const frame = frames[cursor] ?? null

  // 「播完 = 已学」：到达最后一帧（含拖拽直达）即记账给首页
  useEffect(() => {
    if (frames.length > 0 && cursor === frames.length - 1) {
      onLearned?.()
    }
  }, [cursor, frames.length, onLearned])

  // 帧间变化：与上一帧逐元素对比，让「这一帧变了什么」脉冲高亮（首帧/切片重置为空）
  const flash = useMemo(() => diffViews(frames[cursor - 1]?.views, frames[cursor]?.views), [frames, cursor])
  const flashVars = useMemo(() => {
    const out = new Set<string>()
    const prevFrameObj = frames[cursor - 1]
    if (!prevFrameObj) return out // 无前帧（首帧 / 用例首帧）：不闪
    // 前帧存在但无 vars 字段视为空对象：新出现的变量同样算「变化」
    const prevVars = prevFrameObj.vars ?? {}
    const curVars = frames[cursor]?.vars
    if (!curVars) return out
    for (const [k, v] of Object.entries(curVars)) {
      if (prevVars[k] !== v) out.add(k)
    }
    return out
  }, [frames, cursor])
  const isComplete = frames.length > 0 && cursor === frames.length - 1

  // 帧呼吸：前进上飘 / 后退下飘。用 class 重触发而非重挂载，保护指针滑移的持久元素
  const stageBoxRef = useRef<HTMLDivElement>(null)
  const prevCursorRef = useRef(cursor)
  useEffect(() => {
    const dir = cursor - prevCursorRef.current
    prevCursorRef.current = cursor
    const el = stageBoxRef.current
    if (!el || dir === 0) return
    el.classList.remove('animate-breath-fwd', 'animate-breath-back')
    void el.offsetWidth
    el.classList.add(dir > 0 ? 'animate-breath-fwd' : 'animate-breath-back')
  }, [cursor])

  const diagLines = diagnosticLines(algoCase.diagnostics)
  const diagCount = diagLines.reduce((sum, line) => sum + (Number(line.match(/\d+/)?.[0]) ?? 0), 0)

  // 开场不自动播：停在第一帧，等用户点中央播放按钮（任何播放/步进/拖拽也算已开始）
  const [started, setStarted] = useState(false)

  // ===== 教学层：策略先行 / 预测暂停 / 渐进揭示 =====
  const lesson = algoCase.lesson
  const [showCode, setShowCode] = useState(!lesson)
  const [mobilePane, setMobilePane] = useState<'stage' | 'code'>('stage')
  const shareable = !algoCase.id.startsWith('gen-')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [compareCase, setCompareCase] = useState<AlgorithmCase | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [answered, setAnswered] = useState<Record<number, boolean>>({})
  const [wrongIdx, setWrongIdx] = useState<number | null>(null)
  const activePredict = lesson?.predicts?.find((p) => p.atFrame === cursor)
  const pendingPredict = activePredict && !answered[cursor] ? activePredict : null

  // 到达预测点自动暂停，先猜再看
  useEffect(() => {
    if (pendingPredict && playing) setPlaying(false)
  }, [pendingPredict, playing, setPlaying])

  const answerPredict = (idx: number) => {
    if (!pendingPredict) return
    if (pendingPredict.options[idx]?.correct) {
      setAnswered((a) => ({ ...a, [cursor]: true }))
      setWrongIdx(null)
      setStarted(true)
    } else {
      setWrongIdx(idx)
    }
  }

  const handleToggle = useCallback(() => {
    setStarted(true)
    toggle()
  }, [toggle])
  const handlePrev = useCallback(() => {
    setStarted(true)
    prev()
  }, [prev])
  const handleNext = useCallback(() => {
    if (pendingPredict) return
    setStarted(true)
    next()
  }, [next, pendingPredict])
  const handleSeek = useCallback(
    (n: number) => {
      setStarted(true)
      seek(n)
    },
    [seek],
  )
  /** 重放本步：回到上一帧并继续播放——再看一遍刚才那步的变化 */
  const handleReplay = useCallback(() => {
    if (cursor <= 0) return
    setStarted(true)
    seek(cursor - 1)
    setPlaying(true)
  }, [cursor, seek, setPlaying])

  /** 分享链接：内置样题生成 #/play/:id 深链（生成题不可分享） */
  const handleShare = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#/play/${algoCase.id}`
    const done = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(done)
    } else {
      done()
    }
  }, [algoCase.id])

  /** 导出当前用例为 GIF（浏览器 canvas 绘制 + gifenc 编码） */
  const handleExportGif = useCallback(async () => {
    if (exporting) return
    setExporting(true)
    try {
      const mod = await import('../export/exportFrames')
      const blob = mod.exportCaseToGif(algoCase, testIdx)
      mod.downloadGif(blob, `algomotion-${algoCase.id}.gif`)
    } catch {
      /* 无帧或绘图不可用：静默失败，不打断播放 */
    } finally {
      setExporting(false)
    }
  }, [algoCase, testIdx, exporting])

  // 对照解法：加载 + 沙箱执行，进入同屏双播放
  const startCompare = useCallback(async () => {
    if (!relatedId || compareLoading) return
    setCompareLoading(true)
    try {
      const { findSample } = await import('../samples')
      const s = findSample(relatedId)
      if (!s) return
      const { run, framesByTest } = await executeInstrumentResult(s.result)
      if (!run.ok) return
      setCompareCase({
        id: s.id,
        title: s.title,
        problem: s.problem,
        sourceCode: s.sourceCode,
        result: s.result,
        framesByTest,
        tests: run.tests,
        diagnostics: run.diagnostics,
        complexity: CATALOG.find((e) => e.id === s.id)?.complexity,
        lesson: s.lesson,
      })
    } finally {
      setCompareLoading(false)
    }
  }, [relatedId, compareLoading])

  // 键盘快捷键：空格 播放/暂停 · ←/→ 逐帧 · ↑/↓ 变速 · R 重放本步
  // 输入控件/按钮聚焦时不劫持（按钮的原生键盘激活优先）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        tag === 'BUTTON' ||
        target?.isContentEditable
      ) {
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        handleToggle()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number])
        const base = idx < 0 ? 1 : idx
        const nextIdx = Math.max(0, Math.min(SPEED_OPTIONS.length - 1, base + (e.key === 'ArrowUp' ? 1 : -1)))
        setSpeed(SPEED_OPTIONS[nextIdx] ?? 1)
      } else if (e.key === 'r' || e.key === 'R') {
        handleReplay()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleToggle, handlePrev, handleNext, handleReplay, speed, setSpeed])

  const lineCount = algoCase.result.displayCode.split('\n').length

  if (compareCase) {
    return <SolutionCompare a={algoCase} b={compareCase} onExit={() => setCompareCase(null)} />
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs text-sub transition-colors hover:border-line-strong hover:text-ink"
        >
          ← {backLabel}
        </button>
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{algoCase.title}</h1>
        {relatedId ? (
          <button
            type="button"
            onClick={startCompare}
            disabled={compareLoading}
            className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            title="同屏双播放对照两种解法"
          >
            {compareLoading ? '载入对照…' : '⇄ 对照解法'}
          </button>
        ) : null}
        {shareable ? (
          <button
            type="button"
            onClick={handleShare}
            className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 font-mono text-xs text-sub transition-colors hover:border-line-strong hover:text-ink"
            aria-label="复制分享链接"
          >
            {copied ? '已复制 ✓' : '分享'}
          </button>
        ) : null}
        {shareable ? (
          <button
            type="button"
            onClick={handleExportGif}
            disabled={exporting}
            className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 font-mono text-xs text-sub transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="导出 GIF"
          >
            {exporting ? '导出中…' : 'GIF'}
          </button>
        ) : null}
        {algoCase.complexity ? (
          <span
            className="shrink-0 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-sub"
            title="时间复杂度 · 空间复杂度（标准最优解口径）"
          >
            {algoCase.complexity}
          </span>
        ) : null}
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
            allPassed ? 'border-ok/40 bg-ok/10 text-ok' : 'border-warn/40 bg-warn/10 text-warn'
          }`}
          title={algoCase.tests.map((t) => `${t.passed ? '✓' : '✗'} ${t.label}${t.error ? '：' + t.error : ''}`).join('\n')}
        >
          用例校验 {passedCount}/{algoCase.tests.length}
        </span>
        {diagCount > 0 ? (
          /* 沙箱对不可信帧数据的修复统计：异常不静默，但也不阻断播放 */
          <span
            className="shrink-0 rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 font-mono text-[11px] text-warn"
            title={diagLines.join('\n')}
          >
            已清洗 {diagCount} 处
          </span>
        ) : null}
        {lesson ? (
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 font-mono text-xs text-sub transition-colors hover:border-line-strong hover:text-ink"
          >
            {showCode ? '收起代码' : '看代码'}
          </button>
        ) : null}
        <ThemeToggle />
      </header>

      {/* 移动端分栏：舞台 / 代码（桌面双栏不受影响） */}
      <div className="flex shrink-0 gap-1 border-b border-line px-3 py-2 lg:hidden" aria-label="移动端分栏">
        <button
          type="button"
          onClick={() => setMobilePane('stage')}
          aria-pressed={mobilePane === 'stage'}
          className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${
            mobilePane === 'stage' ? 'bg-accent/15 font-medium text-accent' : 'text-sub'
          }`}
        >
          舞台
        </button>
        <button
          type="button"
          onClick={() => {
            setShowCode(true)
            setMobilePane('code')
          }}
          aria-pressed={mobilePane === 'code'}
          className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${
            mobilePane === 'code' ? 'bg-accent/15 font-medium text-accent' : 'text-sub'
          }`}
        >
          代码
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        {/* 代码面板（渐进揭示：有教学设计的题默认收起，按需展开） */}
        {showCode ? (
        <section className={`order-2 ${mobilePane === 'code' ? 'flex' : 'hidden'} max-h-[60dvh] min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface lg:order-1 lg:flex lg:max-h-none lg:w-[40%] lg:max-w-[540px]`}>
          <div className="flex shrink-0 items-center justify-between border-b border-line px-3 py-2 font-mono text-[11px] text-sub">
            <span>
              {algoCase.result.fnName}(…) · {lineCount} 行
            </span>
            <span>当前第 {frame?.line ?? '—'} 行</span>
          </div>
          <div className="min-h-0 flex-1">
            <CodePanel code={algoCase.result.displayCode} activeLine={frame?.line ?? null} />
          </div>
          {/* 关键帧列表：点击直达任意帧（窄屏隐藏，lg 以上显示） */}
          <FrameList frames={frames} cursor={cursor} onSeek={handleSeek} />
        </section>
        ) : null}

        {/* 舞台列 */}
        <section className={`order-1 ${mobilePane === 'stage' ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col gap-3 lg:order-2 lg:flex`}>
          <div className="relative min-h-0 flex-1">
            <div ref={stageBoxRef} className="h-full overflow-auto rounded-2xl border border-line bg-bg/60 p-3 md:p-4">
              {/* 单帧视图出错只影响舞台，翻帧（cursor 变化）自动恢复 */}
              <ErrorBoundary resetKey={cursor} label="舞台">
                <StageView frame={frame} flash={flash} frameKey={cursor} complete={isComplete} />
              </ErrorBoundary>
            </div>
            {/* 开场：有教学设计先展示策略卡（先懂为什么），否则中央播放按钮 */}
            {!started ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 overflow-auto rounded-2xl bg-bg/80 p-4 backdrop-blur-sm">
                {lesson ? (
                  <div className="w-full max-w-md animate-fadeIn rounded-2xl border border-line bg-surface p-5">
                    <div className="font-mono text-[11px] font-semibold tracking-wide text-accent">核心想法</div>
                    <p className="mt-2 text-[15px] font-medium leading-relaxed text-ink">{lesson.idea}</p>
                    {lesson.contrast ? (
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-[11px] leading-relaxed text-danger-text">
                          {lesson.contrast.bad}
                        </div>
                        <div className="rounded-lg border border-ok/30 bg-ok/5 px-3 py-2 text-[11px] leading-relaxed text-ok">
                          {lesson.contrast.good}
                        </div>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="mt-4 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      开始演示 →
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleToggle}
                      aria-label="开始播放"
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/60 bg-accent/20 text-accent shadow-2xl shadow-black/50 transition-all hover:scale-105 hover:bg-accent/30 active:scale-95"
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 4.5v15L19.5 12z" />
                      </svg>
                    </button>
                    <span className="font-mono text-xs text-sub">点击播放动画</span>
                  </>
                )}
              </div>
            ) : null}

            {/* 预测暂停：关键决策点先猜再看 */}
            {started && activePredict ? (
              <div className="absolute inset-0 z-20 flex items-end justify-center rounded-2xl bg-bg/70 backdrop-blur-sm">
                <div className="m-3 w-full max-w-md animate-fadeIn rounded-2xl border border-accent/30 bg-surface-2 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span aria-hidden>🤔</span> {activePredict.question}
                  </div>
                  {answered[cursor] ? (
                    <>
                      <div className="mt-3 rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-[12px] leading-relaxed text-ok">
                        ✓ {activePredict.explain}
                      </div>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-[13px] font-semibold text-black transition-all hover:brightness-110"
                      >
                        继续 →
                      </button>
                    </>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2">
                      {activePredict.options.map((o, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => answerPredict(i)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-all ${
                            wrongIdx === i
                              ? 'animate-flash-danger border-danger/50 bg-danger/10 text-danger-text'
                              : 'border-line bg-fill text-ink hover:border-accent/40 hover:bg-accent/5'
                          }`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line font-mono text-[11px] text-sub">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {o.text}
                        </button>
                      ))}
                      {wrongIdx !== null ? (
                        <div className="text-[11px] text-danger-text">再想想——答案就在眼前的状态里。</div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* 讲解条 */}
          <div className="shrink-0 rounded-2xl border border-line bg-surface px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <p key={cursor} className="min-h-[2.75rem] animate-fadeIn text-[13px] leading-relaxed text-ink/90">
                {frame?.msg ?? ''}
              </p>
            </div>
            <CallStackPanel stack={frame?.stack} />
            <VarsPanel vars={frame?.vars} flash={flashVars} frameKey={cursor} />
          </div>

          {/* 复盘：末帧展示 takeaway（教学层） */}
          {isComplete && lesson?.takeaways ? (
            <div className="shrink-0 animate-fadeIn rounded-2xl border border-ok/30 bg-ok/5 px-4 py-3">
              <div className="font-mono text-[11px] font-semibold text-ok">复盘 · 你刚看懂了什么</div>
              <ul className="mt-2 space-y-1.5">
                {lesson.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-ink/90">
                    <span className="shrink-0 font-mono text-ok">{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 用例切换 */}
          {algoCase.tests.length > 1 ? (
            <div className="flex shrink-0 flex-wrap gap-2">
              {algoCase.tests.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChangeTest(i)}
                  className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-colors ${
                    i === testIdx
                      ? 'border-accent/50 bg-accent/15 text-accent'
                      : 'border-line text-sub hover:border-line-strong hover:text-ink'
                  }`}
                  title={t.error}
                >
                  {t.passed ? '✓' : '✗'} {t.label} · {t.frameCount}帧
                </button>
              ))}
            </div>
          ) : null}

          <div className="shrink-0">
            <PlaybackBar
              cursor={cursor}
              total={frames.length}
              playing={playing}
              speed={speed}
              onToggle={handleToggle}
              onPrev={handlePrev}
              onNext={handleNext}
              onSeek={handleSeek}
              onSpeedChange={setSpeed}
              onReplay={handleReplay}
            />
            <p className="mt-1.5 hidden text-center font-mono text-[10px] text-sub lg:block">
              空格 播放/暂停 · ← → 逐帧 · ↑ ↓ 变速 · R 重放本步
            </p>
          </div>
        </section>
      </div>

    </div>
  )
}
