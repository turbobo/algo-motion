/**
 * 递归调用栈面板：栈底 → 栈顶水平 chip 链，栈顶（当前执行层）高亮 + 微呼吸。
 * 动效（表现层）：push 右滑入、pop 右滑出（离場 chip 短暂保留）、栈顶呼吸 glow。
 */
import { useEffect, useRef, useState } from 'react'

interface Props {
  stack?: string[]
}

export function CallStackPanel({ stack }: Props) {
  const cur = stack ?? []
  const prevRef = useRef<string[]>([])
  const [leaving, setLeaving] = useState<string[]>([])

  useEffect(() => {
    const prev = prevRef.current
    const removed = prev.filter((f) => !cur.includes(f))
    prevRef.current = cur
    if (removed.length === 0) return
    setLeaving(removed)
    const t = window.setTimeout(() => setLeaving([]), 200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack])

  if (cur.length === 0 && leaving.length === 0) return null
  const topIndex = cur.length - 1

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-line-soft pt-2">
      <span className="font-mono text-[10px] text-sub">调用栈</span>
      {cur.map((frame, i) => (
        <span key={`${i}-${frame}`} className="flex items-center gap-1">
          {i > 0 ? <span className="font-mono text-[10px] text-sub/40">→</span> : null}
          <span
            className={`animate-stack-in rounded border px-1.5 py-0.5 font-mono text-[10px] ${
              i === topIndex
                ? 'animate-stack-breathe border-accent/50 bg-accent/15 text-accent'
                : 'border-line text-sub'
            }`}
          >
            {frame}
          </span>
        </span>
      ))}
      {leaving.map((frame, i) => (
        <span
          key={`out-${i}-${frame}`}
          className="animate-stack-out rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-sub"
        >
          {frame}
        </span>
      ))}
      <span className="font-mono text-[10px] text-sub">（栈底 → 栈顶）</span>
    </div>
  )
}