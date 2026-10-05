/**
 * 数组视图渲染器：等宽格子 + 索引 + 指针胶囊 + 语义标注。
 * 过渡动画：值变化时数字重挂载触发 popIn；高亮色做 CSS transition。
 */
import type { ArrayView as ArrayViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

interface Props {
  view: ArrayViewModel
}

export function ArrayView({ view }: Props) {
  const marks = new Map((view.marks ?? []).map((m) => [m.index, m.tone]))
  const pointersByIndex = new Map<number, string[]>()
  for (const [label, idx] of Object.entries(view.pointers ?? {})) {
    const list = pointersByIndex.get(idx) ?? []
    list.push(label)
    pointersByIndex.set(idx, list)
  }

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {view.values.map((value, i) => {
          const tone = marks.get(i)
          const style = tone ? TONE_STYLES[tone] : null
          const pointers = pointersByIndex.get(i) ?? []
          return (
            <div key={i} className="flex shrink-0 flex-col items-center gap-1">
              {/* 指针胶囊区（固定高度避免跳动） */}
              <div className="flex h-5 flex-wrap items-end justify-center gap-1">
                {pointers.map((p) => (
                  <span
                    key={p}
                    className="rounded border border-accent/40 bg-accent/15 px-1 font-mono text-[10px] leading-4 text-accent"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm transition-all duration-300"
                style={{
                  borderColor: style?.border ?? 'rgba(255,255,255,0.12)',
                  background: style?.bg ?? 'rgba(255,255,255,0.04)',
                  boxShadow: style ? `0 0 14px ${style.glow}` : 'none',
                  color: style?.color ?? '#e6e6e6',
                }}
              >
                {/* key=值：变化时重挂载，触发 popIn */}
                <span key={String(value)} className="animate-popIn">
                  {value === null ? '∅' : value}
                </span>
              </div>
              <div className="font-mono text-[10px] text-sub">{i}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
