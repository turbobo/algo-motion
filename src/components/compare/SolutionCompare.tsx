/**
 * 多解法同屏双播放：两种解法并排，共享一条时间轴。
 * 帧数不同时按比例映射游标，保证两侧同时到达末帧；每侧独立 diff/完成态。
 */
import { useMemo } from 'react'
import type { AlgorithmCase } from '../../types'
import { diffViews } from '../renderers/frameDiff'
import { StageView } from '../player/StageView'
import { PlaybackBar } from '../player/PlaybackBar'
import { ThemeToggle } from '../ThemeToggle'
import { usePlayer } from '../../hooks/usePlayer'

function pickTest(c: AlgorithmCase): number {
  const passed = c.tests.findIndex((t) => t.passed && t.frameCount > 0)
  if (passed >= 0) return passed
  const any = c.tests.findIndex((t) => t.frameCount > 0)
  return any >= 0 ? any : 0
}

function mapCursor(shared: number, total: number, len: number): number {
  if (len <= 1 || total <= 1) return 0
  return Math.round((shared * (len - 1)) / (total - 1))
}

function Side({ algoCase, cursor }: { algoCase: AlgorithmCase; cursor: number }) {
  const testIdx = pickTest(algoCase)
  const frames = algoCase.framesByTest[testIdx] ?? []
  const frame = frames[cursor] ?? null
  const flash = useMemo(
    () => diffViews(frames[cursor - 1]?.views, frames[cursor]?.views),
    [frames, cursor],
  )
  const complete = frames.length > 0 && cursor === frames.length - 1
  const lessonIdea = algoCase.lesson?.idea

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{algoCase.title}</span>
        {algoCase.complexity ? (
          <span className="shrink-0 font-mono text-[10px] text-sub">{algoCase.complexity}</span>
        ) : null}
      </div>
      {lessonIdea ? (
        <p className="line-clamp-2 shrink-0 text-[11px] leading-relaxed text-sub">{lessonIdea}</p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-line bg-bg/60 p-3">
        <StageView frame={frame} flash={flash} frameKey={cursor} complete={complete} />
      </div>
      <div className="shrink-0 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] leading-relaxed text-ink/90">
        <span className="mr-1 font-mono text-[10px] text-accent">
          {cursor + 1}/{frames.length}
        </span>
        {frame?.msg ?? ''}
      </div>
    </div>
  )
}

export function SolutionCompare({
  a,
  b,
  onExit,
}: {
  a: AlgorithmCase
  b: AlgorithmCase
  onExit: () => void
}) {
  const lenA = a.framesByTest[pickTest(a)]?.length ?? 0
  const lenB = b.framesByTest[pickTest(b)]?.length ?? 0
  const total = Math.max(lenA, lenB, 1)
  const player = usePlayer(total)
  const cursorA = mapCursor(player.cursor, total, lenA)
  const cursorB = mapCursor(player.cursor, total, lenB)

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <button
          type="button"
          onClick={onExit}
          className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs text-sub transition-colors hover:border-line-strong hover:text-ink"
        >
          ← 返回
        </button>
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium">
          解法对照 · 同屏双播放
          <span className="ml-2 font-mono text-[11px] text-sub">
            {a.title} vs {b.title}
          </span>
        </h1>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:flex-row">
        <Side algoCase={a} cursor={cursorA} />
        <div className="hidden w-px shrink-0 bg-line md:block" aria-hidden />
        <Side algoCase={b} cursor={cursorB} />
      </div>

      <div className="shrink-0 px-3 pb-3">
        <PlaybackBar
          cursor={player.cursor}
          total={total}
          playing={player.playing}
          speed={player.speed}
          onToggle={player.toggle}
          onPrev={player.prev}
          onNext={player.next}
          onSeek={player.seek}
          onSpeedChange={player.setSpeed}
          onReplay={() => {
            if (player.cursor > 0) {
              player.seek(player.cursor - 1)
              player.setPlaying(true)
            }
          }}
        />
        <p className="mt-1.5 text-center font-mono text-[10px] text-sub">
          同步进度按比例映射到两侧帧序列，结束时两侧同时到达末帧
        </p>
      </div>
    </div>
  )
}