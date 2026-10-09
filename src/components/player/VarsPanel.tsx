/** 变量面板：当前帧的变量快照（键 = 值 行内网格）；值变化的变量跟随脉冲高亮 */
interface Props {
  vars?: Record<string, string>
  /** 本帧值变化的变量名集（PlayerScreen 由前后帧 diff 得出） */
  flash?: ReadonlySet<string>
  /** 帧序号：连续变化时让值重新挂载以重播闪烁 */
  frameKey?: number
}

export function VarsPanel({ vars, flash, frameKey }: Props) {
  const entries = Object.entries(vars ?? {})
  if (entries.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 pt-2">
      {entries.map(([key, value]) => {
        const isFlash = flash?.has(key) ?? false
        return (
          <span key={key} className="font-mono text-xs">
            <span className="text-sub">{key}</span>
            <span className="mx-1 text-sub">=</span>
            <span
              key={isFlash ? `f${frameKey ?? 0}` : 's'}
              className={`text-ink/90${isFlash ? ' animate-flash-text' : ''}`}
            >
              {value}
            </span>
          </span>
        )
      })}
    </div>
  )
}
