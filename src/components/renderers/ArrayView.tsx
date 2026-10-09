/**
 * 数组视图渲染器：等宽格子 + 索引 + 指针胶囊 + 语义标注 + 区间色带。
 * 过渡动画：值变化时数字重挂载触发 popIn；高亮色做 CSS transition。
 */
import type { ArrayView as ArrayViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

/** 格宽与步进（含 gap），区间色带按同一坐标系统排布 */
const CELL = 44
const STEP = 52

interface Props {
  view: ArrayViewModel
  /** 本帧值变化的元素下标集（frameDiff 产出）；配合 frameKey 触发脉冲 */
  flash?: ReadonlySet<string>
  /** 帧序号：连续变化时让格子重新挂载以重播脉冲动画 */
  frameKey?: number
}

export function ArrayView({ view, flash, frameKey }: Props) {
  const marks = new Map((view.marks ?? []).map((m) => [m.index, m.tone]))
  const pointersByIndex = new Map<number, string[]>()
  for (const [label, idx] of Object.entries(view.pointers ?? {})) {
    const list = pointersByIndex.get(idx) ?? []
    list.push(label)
    pointersByIndex.set(idx, list)
  }
  const ranges = [...(view.ranges ?? [])].sort((a, b) => a.from - b.from)

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      {view.values.length === 0 ? (
        <div className="inline-flex rounded-lg border border-dashed border-white/10 px-3 py-2 font-mono text-xs text-sub">
          （空）
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="inline-block">
            <div className="flex gap-2">
              {view.values.map((value, i) => {
                const tone = marks.get(i)
                const style = tone ? TONE_STYLES[tone] : null
                const pointers = pointersByIndex.get(i) ?? []
                const isFlash = flash?.has(String(i)) ?? false
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
                      key={isFlash ? `f${frameKey ?? 0}` : 's'}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm transition-all duration-300${isFlash ? ' animate-flash' : ''}`}
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

            {/* 区间色带行（滑动窗口/二分区间） */}
            {ranges.length > 0 ? (
              <div className="mt-1 flex h-5">
                {ranges.map((r, idx) => {
                  const prevTo = idx > 0 ? (ranges[idx - 1]?.to ?? -1) : -1
                  const marginLeft =
                    idx === 0 ? r.from * STEP : Math.max((r.from - prevTo) * STEP - CELL, 0)
                  const tone = r.tone ? TONE_STYLES[r.tone] : null
                  return (
                    <div
                      key={`${r.from}-${r.to}-${idx}`}
                      className="flex animate-fadeIn items-center justify-center rounded-full"
                      style={{
                        marginLeft,
                        width: (r.to - r.from) * STEP + CELL,
                        height: 14,
                        background: tone ? tone.bg : 'rgba(245, 158, 11, 0.18)',
                        border: `1px solid ${tone ? tone.border : 'rgba(245, 158, 11, 0.45)'}`,
                      }}
                    >
                      {r.label ? (
                        <span
                          className="whitespace-nowrap font-mono text-[9px]"
                          style={{ color: tone ? tone.color : '#f59e0b' }}
                        >
                          {r.label}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
