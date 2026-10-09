/**
 * 播放页：左代码 / 右舞台的双栏布局（窄屏纵排），
 * 含讲解条、变量面板、用例切换与播放控制。
 *
 * 结构说明：外层负责选择「播放哪个用例的帧」；内层用 key 重挂载，
 * 切换用例时播放状态自然重置。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AlgorithmCase, Frame, FrameDiagnostics } from '../types'
import { describeDiagnostics, hasDiagnostics } from '../engine/sanitize'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SPEED_OPTIONS, usePlayer } from '../hooks/usePlayer'
import { CodePanel } from '../components/player/CodePanel'
import { PlaybackBar } from '../components/player/PlaybackBar'
import { StageView } from '../components/player/StageView'
import { FrameList } from '../components/player/FrameList'
import { VarsPanel } from '../components/player/VarsPanel'
import { diffViews } from '../components/renderers/frameDiff'

interface Props {
  algoCase: AlgorithmCase
  onBack: () => void
  /** 播放到最后一帧时回调（首页据此记「已学」） */
  onLearned?: () => void
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

export function PlayerScreen({ algoCase, onBack, onLearned }: Props) {
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
      onLearned={onLearned}
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
  onLearned?: () => void
}

function PlayerInner({ algoCase, frames, testIdx, passedCount, allPassed, onChangeTest, onBack, onLearned }: InnerProps) {
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
  const diagLines = diagnosticLines(algoCase.diagnostics)
  const diagCount = diagLines.reduce((sum, line) => sum + (Number(line.match(/\d+/)?.[0]) ?? 0), 0)

  // 开场不自动播：停在第一帧，等用户点中央播放按钮（任何播放/步进/拖拽也算已开始）
  const [started, setStarted] = useState(false)
  const handleToggle = useCallback(() => {
    setStarted(true)
    toggle()
  }, [toggle])
  const handlePrev = useCallback(() => {
    setStarted(true)
    prev()
  }, [prev])
  const handleNext = useCallback(() => {
    setStarted(true)
    next()
  }, [next])
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

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-white/8 px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-sub transition-colors hover:border-white/25 hover:text-ink"
        >
          ← 换一题
        </button>
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{algoCase.title}</h1>
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
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        {/* 代码面板 */}
        <section className="order-2 flex max-h-[30dvh] min-h-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-surface lg:order-1 lg:max-h-none lg:w-[40%] lg:max-w-[540px]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-3 py-2 font-mono text-[11px] text-sub">
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

        {/* 舞台列 */}
        <section className="order-1 flex min-h-0 flex-1 flex-col gap-3 lg:order-2">
          <div className="relative min-h-0 flex-1">
            <div className="h-full overflow-auto rounded-2xl border border-white/8 bg-bg/60 p-3 md:p-4">
              {/* 单帧视图出错只影响舞台，翻帧（cursor 变化）自动恢复 */}
              <ErrorBoundary resetKey={cursor} label="舞台">
                <StageView frame={frame} flash={flash} frameKey={cursor} />
              </ErrorBoundary>
            </div>
            {/* 开场播放按钮：未开始前盖住舞台，等用户准备好再开播 */}
            {!started ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-bg/60">
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
              </div>
            ) : null}
          </div>

          {/* 讲解条 */}
          <div className="shrink-0 rounded-2xl border border-white/8 bg-surface px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <p key={cursor} className="min-h-[2.75rem] animate-fadeIn text-[13px] leading-relaxed text-ink/90">
                {frame?.msg ?? ''}
              </p>
            </div>
            <VarsPanel vars={frame?.vars} flash={flashVars} frameKey={cursor} />
          </div>

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
                      : 'border-white/10 text-sub hover:border-white/25 hover:text-ink'
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
            <p className="mt-1.5 hidden text-center font-mono text-[10px] text-sub/50 lg:block">
              空格 播放/暂停 · ← → 逐帧 · ↑ ↓ 变速 · R 重放本步
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
