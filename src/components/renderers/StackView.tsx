/**
 * 栈视图渲染器：垂直堆叠，栈顶在上（带 top 指示），栈底画基座线。
 * 新元素压栈时 popIn；marks 按原数组索引（栈底 = 0）着色。
 */
import type { StackView as StackViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

interface Props {
  view: StackViewModel
}

export function StackView({ view }: Props) {
  const markOf = new Map((view.marks ?? []).map((m) => [m.index, m.tone]))
  const topIndex = view.items.length - 1

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      {view.items.length === 0 ? (
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[10px] text-sub">（空栈）</span>
          <div className="h-0.5 w-24 rounded-full bg-white/20" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[10px] text-accent">top ↓</span>
          {/* 栈顶在上：反序渲染 */}
          {[...view.items].reverse().map((item, i) => {
            const idx = view.items.length - 1 - i
            const tone = markOf.get(idx)
            const style = tone ? TONE_STYLES[tone] : null
            return (
              <div
                key={`${idx}-${String(item)}`}
                className="flex h-7 w-16 animate-popIn items-center justify-center rounded border font-mono text-xs transition-all duration-300"
                style={{
                  borderColor: style?.border ?? 'rgba(255,255,255,0.14)',
                  background: style?.bg ?? 'rgba(255,255,255,0.04)',
                  boxShadow: style ? `0 0 12px ${style.glow}` : 'none',
                  color: style?.color ?? '#e6e6e6',
                }}
                title={idx === topIndex ? '栈顶' : undefined}
              >
                {item}
              </div>
            )
          })}
          <div className="h-0.5 w-24 rounded-full bg-white/20" />
          <span className="font-mono text-[10px] text-sub">栈底</span>
        </div>
      )}
    </div>
  )
}
