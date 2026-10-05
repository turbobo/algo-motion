/**
 * 代码面板：展示解法代码，当前帧对应行高亮并自动滚入视野。
 */
import { useEffect, useRef } from 'react'

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
      <pre className="py-2 font-mono text-[12.5px] leading-6">
        {lines.map((line, i) => {
          const n = i + 1
          const active = n === activeLine
          return (
            <div
              key={i}
              ref={(el) => {
                if (el) lineRefs.current.set(n, el)
              }}
              className={`flex px-3 transition-colors duration-200 ${
                active ? 'bg-accent/10 shadow-[inset_2px_0_0_#f59e0b]' : ''
              }`}
            >
              <span
                className={`w-8 shrink-0 select-none pr-3 text-right ${
                  active ? 'text-accent' : 'text-white/25'
                }`}
              >
                {n}
              </span>
              <span className={`whitespace-pre ${active ? 'text-ink' : 'text-ink/70'}`}>{line || ' '}</span>
            </div>
          )
        })}
      </pre>
    </div>
  )
}
