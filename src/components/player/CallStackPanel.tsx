/**
 * 递归调用栈面板：栈底 → 栈顶水平 chip 链，栈顶（当前执行层）高亮。
 * 仅递归题提供 stack 帧字段；非递归帧不渲染。
 */
interface Props {
  stack?: string[]
}

export function CallStackPanel({ stack }: Props) {
  if (!stack || stack.length === 0) return null
  const topIndex = stack.length - 1
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-white/5 pt-2">
      <span className="font-mono text-[10px] text-sub">调用栈</span>
      {stack.map((frame, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 ? <span className="font-mono text-[10px] text-sub/40">→</span> : null}
          <span
            className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
              i === topIndex
                ? 'border-accent/50 bg-accent/15 text-accent'
                : 'border-white/10 text-sub'
            }`}
          >
            {frame}
          </span>
        </span>
      ))}
      <span className="font-mono text-[10px] text-sub">（栈底 → 栈顶）</span>
    </div>
  )
}
