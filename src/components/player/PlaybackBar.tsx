/**
 * 播放控制栏：上一帧 / 播放暂停 / 下一帧 / 进度拖拽 / 帧指示 / 倍速。
 * 图标全部内联 SVG（不引入图标库）。
 */
import { SPEED_OPTIONS } from '../../hooks/usePlayer'

interface Props {
  cursor: number
  total: number
  playing: boolean
  speed: number
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (n: number) => void
  onSpeedChange: (s: number) => void
  /** 重放本步：回到上一帧继续播放（再看一遍刚才那步的变化） */
  onReplay: () => void
}

const ICON_SIZE = 18

function IconPrev() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 5h2v14H6zM20 5v14L9.5 12z" />
    </svg>
  )
}

function IconNext() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 5h2v14h-2zM4 5v14L14.5 12z" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15L19.5 12z" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z" />
    </svg>
  )
}

function IconReplay() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  )
}

const BTN =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink/80 ' +
  'transition-colors hover:border-white/25 hover:text-ink active:scale-95 disabled:opacity-40'

export function PlaybackBar({ cursor, total, playing, speed, onToggle, onPrev, onNext, onSeek, onSpeedChange, onReplay }: Props) {
  const last = Math.max(total - 1, 0)
  const nextSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number])
    return SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length] ?? 1
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-surface px-3 py-2 md:gap-3">
      <button
        type="button"
        className={BTN}
        onClick={onReplay}
        disabled={cursor <= 0}
        aria-label="重放本步"
        title="重放本步（R）：回到上一帧继续播"
      >
        <IconReplay />
      </button>
      <button type="button" className={BTN} onClick={onPrev} disabled={cursor <= 0} aria-label="上一帧">
        <IconPrev />
      </button>
      <button
        type="button"
        className={`${BTN} border-accent/50 bg-accent/15 text-accent hover:text-accent`}
        onClick={onToggle}
        aria-label={playing ? '暂停' : '播放'}
      >
        {playing ? <IconPause /> : <IconPlay />}
      </button>
      <button type="button" className={BTN} onClick={onNext} disabled={cursor >= last} aria-label="下一帧">
        <IconNext />
      </button>

      <input
        type="range"
        min={0}
        max={last}
        value={cursor}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="播放进度"
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
      />

      <span className="w-14 shrink-0 text-center font-mono text-xs text-sub">
        {cursor + 1}/{total}
      </span>
      <button
        type="button"
        className={`${BTN} w-auto px-2.5 font-mono text-xs`}
        onClick={() => onSpeedChange(nextSpeed())}
        aria-label="切换倍速"
      >
        {speed}x
      </button>
    </div>
  )
}
