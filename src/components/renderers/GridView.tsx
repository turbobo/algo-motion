/**
 * 网格视图渲染器（岛屿/迷宫/棋盘）：
 * - '0' / '.' / '' 等空格渲染为暗色水格；'1' / '#' 等实体渲染为沙色陆格
 * - 其他字符渲染为普通格子 + 文本
 * - marks 叠加语义色调（当前探索 active / 已访问 muted / 新发现 ok）
 */
import type { GridView as GridViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

const CELL = 30
const GAP = 3

interface Props {
  view: GridViewModel
  /** 本帧值变化的格子集（"r:c" 标识，frameDiff 产出）；配合 frameKey 触发脉冲 */
  flash?: ReadonlySet<string>
  /** 帧序号：连续变化时让格子重新挂载以重播脉冲动画 */
  frameKey?: number
}

const VOID_CHARS = new Set(['0', '.', ' ', ''])
const SOLID_CHARS = new Set(['1', '#'])

function classify(value: string | number): 'void' | 'solid' | 'text' {
  const s = String(value)
  if (VOID_CHARS.has(s)) return 'void'
  if (SOLID_CHARS.has(s)) return 'solid'
  return 'text'
}

export function GridView({ view, flash, frameKey }: Props) {
  const markMap = new Map((view.marks ?? []).map((m) => [`${m.row}:${m.col}`, m.tone]))

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col" style={{ gap: GAP }}>
          {view.cells.map((row, ri) => (
            <div key={ri} className="flex" style={{ gap: GAP }}>
              {row.map((value, ci) => {
                const tone = markMap.get(`${ri}:${ci}`)
                const style = tone ? TONE_STYLES[tone] : null
                const kind = classify(value)
                const isFlash = flash?.has(`${ri}:${ci}`) ?? false
                // 默认语义色：水格（暗）与陆格（沙）
                const fallback =
                  kind === 'solid'
                    ? { background: 'rgba(205,165,95,0.30)', borderColor: 'rgba(205,165,95,0.55)' }
                    : kind === 'void'
                      ? { background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.07)' }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }
                return (
                  <div
                    key={isFlash ? `f${frameKey ?? 0}` : 's'}
                    className={`flex items-center justify-center rounded border font-mono text-[11px] transition-all duration-300${isFlash ? ' animate-flash' : ''}`}
                    style={{
                      width: CELL,
                      height: CELL,
                      background: style?.bg ?? fallback.background,
                      borderColor: style?.border ?? fallback.borderColor,
                      boxShadow: style ? `0 0 12px ${style.glow}` : 'none',
                      color: style?.color ?? 'rgba(255,255,255,0.75)',
                    }}
                  >
                    <span key={String(value)} className={kind === 'text' ? 'animate-popIn' : undefined}>
                      {kind === 'text' ? String(value) : ''}
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
