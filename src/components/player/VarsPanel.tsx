/** 变量面板：当前帧的变量快照（键 = 值 行内网格） */
interface Props {
  vars?: Record<string, string>
}

export function VarsPanel({ vars }: Props) {
  const entries = Object.entries(vars ?? {})
  if (entries.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 pt-2">
      {entries.map(([key, value]) => (
        <span key={key} className="font-mono text-xs">
          <span className="text-sub">{key}</span>
          <span className="mx-1 text-sub/60">=</span>
          <span className="text-ink/90">{value}</span>
        </span>
      ))}
    </div>
  )
}
