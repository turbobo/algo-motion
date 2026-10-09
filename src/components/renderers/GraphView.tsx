/**
 * 图视图渲染器（课程表/依赖关系等有向图）：
 * - 节点环形自动布局（从正上方开始均分圆周），半径随节点数自适应
 * - 有向边带箭头（from → to），线段从节点边缘到边缘
 * - 节点色调走语义 marks（ok/warn/active 等）
 */
import type { GraphView as GraphViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

const NODE_R = 19
const PAD = 44

interface Props {
  view: GraphViewModel
  /** 本帧变化的节点 id 集（frameDiff 产出）；配合 frameKey 触发脉冲 */
  flash?: ReadonlySet<string>
  /** 帧序号：连续变化时让节点重新挂载以重播脉冲动画 */
  frameKey?: number
}

export function GraphView({ view, flash, frameKey }: Props) {
  const n = view.nodes.length
  const radius = Math.max(70, n * 30)
  const size = (radius + PAD) * 2
  const c0 = size / 2
  const pos = new Map(
    view.nodes.map((node, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1)
      return [node.id, { x: c0 + radius * Math.cos(angle), y: c0 + radius * Math.sin(angle) }]
    }),
  )
  const markOf = new Map((view.marks ?? []).map((m) => [m.id, m.tone]))

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      <div className="overflow-x-auto pb-1">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="absolute inset-0" width={size} height={size} aria-hidden="true">
            <defs>
              <marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 z" fill="rgba(139,149,165,0.85)" />
              </marker>
            </defs>
            {view.edges.map(([from, to], i) => {
              const a = pos.get(from)
              const b = pos.get(to)
              if (!a || !b) return null
              const dx = b.x - a.x
              const dy = b.y - a.y
              const len = Math.hypot(dx, dy) || 1
              const ux = dx / len
              const uy = dy / len
              return (
                <line
                  key={`${from}->${to}-${i}`}
                  x1={a.x + ux * (NODE_R + 3)}
                  y1={a.y + uy * (NODE_R + 3)}
                  x2={b.x - ux * (NODE_R + 9)}
                  y2={b.y - uy * (NODE_R + 9)}
                  stroke="rgba(139,149,165,0.7)"
                  strokeWidth={1.5}
                  markerEnd="url(#graph-arrow)"
                />
              )
            })}
          </svg>

          {view.nodes.map((node) => {
            const p = pos.get(node.id)
            if (!p) return null
            const tone = markOf.get(node.id)
            const style = tone ? TONE_STYLES[tone] : null
            const isFlash = flash?.has(node.id) ?? false
            return (
              <div
                key={`${node.id}${isFlash ? '-f' + String(frameKey ?? 0) : ''}`}
                className={`absolute flex items-center justify-center rounded-full border font-mono text-xs transition-all duration-300${isFlash ? ' animate-flash' : ''}`}
                style={{
                  left: p.x - NODE_R,
                  top: p.y - NODE_R,
                  width: NODE_R * 2,
                  height: NODE_R * 2,
                  borderColor: style?.border ?? 'rgba(255,255,255,0.16)',
                  background: style?.bg ?? 'rgba(255,255,255,0.04)',
                  boxShadow: style ? `0 0 12px ${style.glow}` : 'none',
                  color: style?.color ?? '#e6e6e6',
                }}
              >
                {node.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
