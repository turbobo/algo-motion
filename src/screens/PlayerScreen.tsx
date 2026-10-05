/**
 * 播放页：左代码 / 右舞台的双栏布局（窄屏纵排），
 * 含讲解条、变量面板、用例切换与播放控制。
 *
 * 结构说明：外层负责选择「播放哪个用例的帧」；内层用 key 重挂载，
 * 切换用例时播放状态自然重置。
 */
import { useEffect, useState } from 'react'
import type { AlgorithmCase, Frame } from '../types'
import { usePlayer } from '../hooks/usePlayer'
import { CodePanel } from '../components/player/CodePanel'
import { PlaybackBar } from '../components/player/PlaybackBar'
import { StageView } from '../components/player/StageView'
import { VarsPanel } from '../components/player/VarsPanel'

interface Props {
  algoCase: AlgorithmCase
  onBack: () => void
}

/** 默认播放：第一个「通过且产帧」的用例 */
function pickDefaultTest(algoCase: AlgorithmCase): number {
  const passed = algoCase.tests.findIndex((t) => t.passed && t.frameCount > 0)
  if (passed >= 0) return passed
  const anyFrames = algoCase.tests.findIndex((t) => t.frameCount > 0)
  return anyFrames >= 0 ? anyFrames : 0
}

export function PlayerScreen({ algoCase, onBack }: Props) {
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
}

function PlayerInner({ algoCase, frames, testIdx, passedCount, allPassed, onChangeTest, onBack }: InnerProps) {
  const { cursor, playing, speed, setSpeed, next, prev, seek, toggle, setPlaying } = usePlayer(frames.length)
  const frame = frames[cursor] ?? null

  // 进入后自动开播（给舞台一点时间渲染首帧）
  useEffect(() => {
    const timer = window.setTimeout(() => setPlaying(true), 700)
    return () => window.clearTimeout(timer)
  }, [setPlaying])

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
        </section>

        {/* 舞台列 */}
        <section className="order-1 flex min-h-0 flex-1 flex-col gap-3 lg:order-2">
          <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-white/8 bg-bg/60 p-3 md:p-4">
            <StageView frame={frame} />
          </div>

          {/* 讲解条 */}
          <div className="shrink-0 rounded-2xl border border-white/8 bg-surface px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <p key={cursor} className="min-h-[2.75rem] animate-fadeIn text-[13px] leading-relaxed text-ink/90">
                {frame?.msg ?? ''}
              </p>
            </div>
            <VarsPanel vars={frame?.vars} />
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
              onToggle={toggle}
              onPrev={prev}
              onNext={next}
              onSeek={seek}
              onSpeedChange={setSpeed}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
