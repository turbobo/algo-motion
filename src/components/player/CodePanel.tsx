/**
 * 代码面板：展示解法代码，当前帧对应行高亮并自动滚入视野。
 * 动效（表现层）：高亮改为单一滑动光标条，translateY 平滑跟随当前行。
 */
import { useEffect, useRef } from 'react'
import { renderTokens } from '../highlight'

const LINE_H = 24
const PAD_Y = 8

interface Props {
  code: string
  activeLine: number | null
}

export function CodePanel({ code, activeLine }: Props) {
  const lines = code.split('\n')
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (activeLine === null) return
    const el = lineRefs.current.get(activeLine)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeLine])

  return (
    <div className="h-full overflow-auto">
      <pre className="relative py-2 font-mono text-[12.5px] leading-6">
        {activeLine !== null ? (
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 bg-accent/10 shadow-[inset_2px_0_0_rgb(var(--c-accent))] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ height: LINE_H, transform: `translateY(${PAD_Y + (activeLine - 1) * LINE_H}px)` }}
          />
        ) : null}
        {lines.map((line, i) => {
          const n = i + 1
          const active = n === activeLine
          return (
            <div
              key={i}
              ref={(el) => {
                if (el) lineRefs.current.set(n, el)
              }}
              className="relative flex px-3"
            >
              <span
                className={`w-8 shrink-0 select-none pr-3 text-right ${
                  active ? 'text-accent' : 'text-faint'
                }`}
              >
                {n}
              </span>
              <span className={`whitespace-pre ${active ? '' : 'opacity-70'}`}>{line ? renderTokens(line) : ' '}</span>
            </div>
          )
        })}
      </pre>
    </div>
  )
}