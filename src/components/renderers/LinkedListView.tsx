/**
 * 链表视图渲染器：HTML 节点层 + SVG 箭头层叠放。
 *
 * 布局约定（固定尺寸，无需 DOM 测量）：
 * - 节点水平排列，中心距 STEP；节点 i 中心 x = PAD + i * STEP + HALF
 * - 箭头类型：右邻=直线、左邻=下弧（回头）、跳线=上弧、null=短箭头+∅
 * - 指针胶囊渲染在节点上方；节点 id 角标用于对照讲解文案
 */
import type { LinkedListView as LinkedListViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

const NODE_W = 56
const NODE_H = 56
const STEP = 112
const PAD = 10
const CY = 90
const HALF = NODE_W / 2
const SVG_H = 192

interface Props {
  view: LinkedListViewModel
  /** 本帧值/出边变化的节点 id 集（frameDiff 产出）；配合 frameKey 触发脉冲 */
  flash?: ReadonlySet<string>
  /** 帧序号：连续变化时让节点重新挂载以重播脉冲动画 */
  frameKey?: number
}

interface EdgeGeom {
  d: string
  nullX?: number
}

function edgeGeom(from: number, to: number | null, cx: (i: number) => number): EdgeGeom {
  const x1 = cx(from)
  if (to === null) {
    return { d: `M ${x1 + HALF + 3} ${CY} L ${x1 + HALF + 38} ${CY}`, nullX: x1 + HALF + 48 }
  }
  const x2 = cx(to)
  if (to === from + 1) {
    return { d: `M ${x1 + HALF + 3} ${CY} L ${x2 - HALF - 6} ${CY}` }
  }
  const mid = (x1 + x2) / 2
  if (to === from - 1) {
    // 左向：从底部绕回
    return { d: `M ${x1} ${CY + HALF + 5} Q ${mid} ${CY + HALF + 60} ${x2} ${CY + HALF + 5}` }
  }
  // 非相邻：上弧跳跃
  return { d: `M ${x1} ${CY - HALF - 5} Q ${mid} ${CY - HALF - 34} ${x2} ${CY - HALF - 5}` }
}

export function LinkedListView({ view, flash, frameKey }: Props) {
  const { nodes, next, pointers = {}, marks = [] } = view
  const index = new Map(nodes.map((n, i) => [n.id, i]))
  const cx = (i: number) => PAD + i * STEP + HALF
  const width = Math.max(nodes.length > 0 ? PAD * 2 + (nodes.length - 1) * STEP + NODE_W : 160, 160)
  const markOf = new Map(marks.map((m) => [m.id, m.tone]))

  const pointersByNode = new Map<string, string[]>()
  for (const [label, nodeId] of Object.entries(pointers)) {
    if (!nodeId) continue
    const list = pointersByNode.get(nodeId) ?? []
    list.push(label)
    pointersByNode.set(nodeId, list)
  }

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      {nodes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-3 py-2 font-mono text-xs text-sub">
          （空链表）
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="relative" style={{ width, height: SVG_H }}>
            <svg className="absolute inset-0" width={width} height={SVG_H} aria-hidden="true">
              <defs>
                <marker id="linkedlist-head" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(139,149,165,0.9)" />
                </marker>
              </defs>
              {next.map(([fromId, toId]) => {
                const fi = index.get(fromId)
                if (fi === undefined) return null
                const ti = toId === null ? null : index.get(toId)
                if (ti === undefined) return null
                const geom = edgeGeom(fi, ti, cx)
                return (
                  <g key={`${fromId}->${toId ?? 'null'}`} className="animate-fadeIn">
                    <path
                      d={geom.d}
                      fill="none"
                      stroke="rgba(139,149,165,0.85)"
                      strokeWidth={1.5}
                      markerEnd="url(#linkedlist-head)"
                    />
                    {geom.nullX !== undefined ? (
                      <text x={geom.nullX} y={CY + 4} fill="#8b95a5" fontSize={12} fontFamily="monospace">
                        ∅
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </svg>

            {nodes.map((node, i) => {
              const labels = pointersByNode.get(node.id)
              if (!labels) return null
              return (
                <div
                  key={`p-${node.id}`}
                  className="absolute flex gap-1"
                  style={{ left: cx(i), top: 2, transform: 'translateX(-50%)' }}
                >
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="whitespace-nowrap rounded border border-accent/40 bg-accent/15 px-1 font-mono text-[10px] leading-4 text-accent"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )
            })}

            {nodes.map((node, i) => {
              const tone = markOf.get(node.id)
              const style = tone ? TONE_STYLES[tone] : null
              const isFlash = flash?.has(node.id) ?? false
              return (
                <div
                  key={`${node.id}${isFlash ? '-f' + String(frameKey ?? 0) : ''}`}
                  className={`absolute flex items-center justify-center rounded-xl border font-mono text-base transition-all duration-300${isFlash ? ' animate-flash' : ''}`}
                  style={{
                    left: PAD + i * STEP,
                    top: CY - HALF,
                    width: NODE_W,
                    height: NODE_H,
                    borderColor: style?.border ?? 'rgba(255,255,255,0.14)',
                    background: style?.bg ?? 'rgba(255,255,255,0.04)',
                    boxShadow: style ? `0 0 14px ${style.glow}` : 'none',
                    color: style?.color ?? '#e6e6e6',
                  }}
                >
                  {node.value}
                  <span className="absolute right-1 top-0.5 font-mono text-[9px] text-sub">{node.id}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
