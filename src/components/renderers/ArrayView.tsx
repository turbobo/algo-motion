/**
 * 数组视图渲染器：等宽格子 + 索引 + 滑移指针 + 语义标注 + 区间色带。
 * 动效（表现层）：值变化用「值落定」settleIn；帧间变化按 tone 语义脉冲；
 * 指针为独立绝对定位层，translateX 平滑滑移；末帧 ok 元素完成绽放。
 */
import type { ArrayView as ArrayViewModel } from '../../types'
import { TONE_STYLES, ViewTitle, flashClass } from './tones'
import { layoutPointers } from './pointerLayout'

const CELL = 44
const STEP = 52

interface Props {
  view: ArrayViewModel
  flash?: ReadonlySet<string>
  frameKey?: number
  /** 末帧（完成时刻）：ok 元素绽放 + ✓ 角标 */
  complete?: boolean
}

export function ArrayView({ view, flash, frameKey, complete }: Props) {
  const marks = new Map((view.marks ?? []).map((m) => [m.index, m.tone]))
  const pointerEntries = Object.entries(view.pointers ?? {})
  const pointerPos = layoutPointers(view.pointers ?? {}, STEP, CELL)
  const ranges = [...(view.ranges ?? [])].sort((a, b) => a.from - b.from)

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      {view.values.length === 0 ? (
        <div className="inline-flex rounded-lg border border-dashed border-line px-3 py-2 font-mono text-xs text-sub">
          （空）
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="inline-block">
            <div className="relative">
              {/* 滑移指针层：持久元素 keyed by label，translateX 过渡 */}
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-5">
                {pointerEntries.map(([label]) => (
                  <span
                    key={label}
                    className="absolute top-0 whitespace-nowrap rounded border border-accent/40 bg-accent/15 px-1 font-mono text-[10px] leading-4 text-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `translateX(${pointerPos[label] ?? 0}px) translateX(-50%)` }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                {view.values.map((value, i) => {
                  const tone = marks.get(i)
                  const style = tone ? TONE_STYLES[tone] : null
                  const isFlash = flash?.has(String(i)) ?? false
                  const isCompleteOk = complete && tone === 'ok'
                  return (
                    <div key={i} className="flex shrink-0 flex-col items-center gap-1">
                      <div className="h-5" />
                      <div
                        key={isFlash ? `f${frameKey ?? 0}` : 's'}
                        className={`relative flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm transition-all duration-300${isFlash ? ` ${flashClass(tone)}` : ''}${isCompleteOk ? ' animate-complete' : ''}`}
                        style={{
                          borderColor: style?.border ?? 'var(--line)',
                          background: style?.bg ?? 'var(--fill)',
                          boxShadow: style ? `0 0 14px ${style.glow}` : 'none',
                          color: style?.color ?? 'rgb(var(--c-ink))',
                        }}
                      >
                        <span key={String(value)} className="animate-settleIn">
                          {value === null ? '∅' : value}
                        </span>
                        {isCompleteOk ? (
                          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ok text-[9px] font-bold text-white animate-check-bloom">
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <div className="font-mono text-[10px] text-sub">{i}</div>
                    </div>
                  )
                })}
              </div>
            </div>

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
                        background: tone ? tone.bg : 'rgb(var(--c-accent) / 0.18)',
                        border: `1px solid ${tone ? tone.border : 'rgb(var(--c-accent) / 0.45)'}`,
                      }}
                    >
                      {r.label ? (
                        <span
                          className="whitespace-nowrap font-mono text-[9px]"
                          style={{ color: tone ? tone.color : 'rgb(var(--c-accent))' }}
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