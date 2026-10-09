/**
 * 二维表格渲染器（DP 填表）：
 * - 行头/列头标签；null 单元格显示为未填
 * - activeRow/activeCol 渲染十字弱高亮（展示扫描位置）
 * - 单元格标注走语义色调
 */
import type { MatrixView as MatrixViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

/** 单元格与表头尺寸 */
const CELL_W = 40
const CELL_H = 30
const HEAD_W = 30
const HEAD_H = 22

interface Props {
  view: MatrixViewModel
  /** 本帧值变化的格子集（"r:c" 标识，frameDiff 产出）；配合 frameKey 触发脉冲 */
  flash?: ReadonlySet<string>
  /** 帧序号：连续变化时让格子重新挂载以重播脉冲动画 */
  frameKey?: number
}

export function MatrixView({ view, flash, frameKey }: Props) {
  const markMap = new Map((view.marks ?? []).map((m) => [`${m.row}:${m.col}`, m.tone]))
  const hasRowHead = Array.isArray(view.rowLabels) && view.rowLabels.length > 0
  const hasColHead = Array.isArray(view.colLabels) && view.colLabels.length > 0

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col">
          {/* 列头 */}
          {hasColHead ? (
            <div className="flex">
              {hasRowHead ? <div style={{ width: HEAD_W, height: HEAD_H }} /> : null}
              {view.colLabels?.map((label, ci) => (
                <div
                  key={ci}
                  className="flex items-center justify-center font-mono text-xs transition-colors duration-200"
                  style={{
                    width: CELL_W,
                    height: HEAD_H,
                    color: ci === view.activeCol ? '#f59e0b' : '#8b95a5',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          ) : null}

          {/* 数据行 */}
          {view.values.map((row, ri) => (
            <div key={ri} className="flex">
              {hasRowHead ? (
                <div
                  className="flex items-center justify-center font-mono text-xs transition-colors duration-200"
                  style={{ width: HEAD_W, color: ri === view.activeRow ? '#f59e0b' : '#8b95a5' }}
                >
                  {view.rowLabels?.[ri] ?? ''}
                </div>
              ) : null}
              {row.map((value, ci) => {
                const tone = markMap.get(`${ri}:${ci}`)
                const style = tone ? TONE_STYLES[tone] : null
                const inCross = ri === view.activeRow || ci === view.activeCol
                const isFlash = flash?.has(`${ri}:${ci}`) ?? false
                return (
                  <div
                    key={isFlash ? `f${frameKey ?? 0}` : 's'}
                    className={`flex items-center justify-center border font-mono text-xs transition-all duration-300${isFlash ? ' animate-flash' : ''}`}
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      borderColor: style?.border ?? 'rgba(255,255,255,0.08)',
                      background: style?.bg ?? (inCross ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)'),
                      boxShadow: style ? `0 0 12px ${style.glow}` : 'none',
                      color: style?.color ?? (value === null ? 'rgba(255,255,255,0.2)' : '#e6e6e6'),
                    }}
                  >
                    <span key={String(value)} className="animate-popIn">
                      {value === null ? '·' : value}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
