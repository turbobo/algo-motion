/**
 * 关键帧列表：每帧一行讲解（编号 + msg），点击直达该帧。
 * 当前帧高亮并自动滚入视野；多帧题目（全排列/N 皇后等）可快速定位「回溯那一刻」。
 * 窄屏（<lg）隐藏——移动端空间留给舞台与控制栏。
 */
import { useEffect, useRef } from 'react'
import type { Frame } from '../../types'

interface Props {
  frames: Frame[]
  cursor: number
  onSeek: (i: number) => void
}

export function FrameList({ frames, cursor, onSeek }: Props) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // 当前帧滚入视野（block: nearest：已可见时不动，避免来回跳）
  useEffect(() => {
    itemRefs.current[cursor]?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (frames.length === 0) return null

  return (
    <div className="hidden h-48 shrink-0 flex-col border-t border-white/8 lg:flex">
      <div className="flex shrink-0 items-center justify-between px-3 py-2 font-mono text-[11px] text-sub">
        <span>关键帧</span>
        <span className="text-sub">点击直达</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
        {frames.map((f, i) => (
          <button
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            type="button"
            onClick={() => onSeek(i)}
            aria-current={i === cursor ? 'step' : undefined}
            className={`mb-0.5 flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
              i === cursor ? 'bg-accent/15' : 'hover:bg-white/5'
            }`}
          >
            <span
              className={`mt-px shrink-0 font-mono text-[10px] ${i === cursor ? 'text-accent' : 'text-sub'}`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={`text-[11px] leading-snug ${i === cursor ? 'text-ink' : 'text-sub'}`}>
              {f.msg || '（无讲解）'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
