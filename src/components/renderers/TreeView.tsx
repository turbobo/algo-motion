/**
 * 二叉树视图渲染器：椭圆节点层 + SVG 边层叠放。
 * 布局自动计算：中序遍历序号定 x（叶子不重叠、父居中于子树），深度定 y。
 */
import type { TreeView as TreeViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

const NODE_W = 46
const NODE_H = 36
const STEP_X = 64
const STEP_Y = 66
const PAD = 16

interface Props {
  view: TreeViewModel
  /** 本帧值/子树结构变化的节点 id 集（frameDiff 产出）；配合 frameKey 触发脉冲 */
  flash?: ReadonlySet<string>
  /** 帧序号：连续变化时让节点重新挂载以重播脉冲动画 */
  frameKey?: number
}

interface Layout {
  x: Map<string, number>
  y: Map<string, number>
  depthMax: number
}

/** 中序序号定 x、深度定 y；visited 防环，孤立节点兜底放末行 */
function computeLayout(view: TreeViewModel): Layout {
  const leftOf = new Map<string, string>()
  const rightOf = new Map<string, string>()
  const hasParent = new Set<string>()
  for (const [p, c, side] of view.edges) {
    if (side === 'left') leftOf.set(p, c)
    else rightOf.set(p, c)
    hasParent.add(c)
  }

  const x = new Map<string, number>()
  const y = new Map<string, number>()
  const visited = new Set<string>()
  let counter = 0
  let depthMax = 0

  const walk = (id: string, depth: number): void => {
    if (visited.has(id)) return
    visited.add(id)
    const l = leftOf.get(id)
    if (l) walk(l, depth + 1)
    x.set(id, counter++)
    y.set(id, depth)
    depthMax = Math.max(depthMax, depth)
    const r = rightOf.get(id)
    if (r) walk(r, depth + 1)
  }

  const root = view.nodes.find((n) => !hasParent.has(n.id))?.id
  if (root) walk(root, 0)
  for (const n of view.nodes) {
    if (!visited.has(n.id)) {
      x.set(n.id, counter++)
      y.set(n.id, 0)
    }
  }
  return { x, y, depthMax }
}

export function TreeView({ view, flash, frameKey }: Props) {
  const { x, y, depthMax } = computeLayout(view)
  const px = (id: string) => PAD + (x.get(id) ?? 0) * STEP_X + NODE_W / 2
  const py = (id: string) => PAD + (y.get(id) ?? 0) * STEP_Y + NODE_H / 2
  const width = PAD * 2 + Math.max(view.nodes.length - 1, 0) * STEP_X + NODE_W
  const height = PAD * 2 + depthMax * STEP_Y + NODE_H + 22
  const markOf = new Map((view.marks ?? []).map((m) => [m.id, m.tone]))

  const pointersByNode = new Map<string, string[]>()
  const nullPointers: string[] = []
  for (const [label, nodeId] of Object.entries(view.pointers ?? {})) {
    if (!nodeId || !x.has(nodeId)) {
      if (!nodeId) nullPointers.push(label)
      continue
    }
    const list = pointersByNode.get(nodeId) ?? []
    list.push(label)
    pointersByNode.set(nodeId, list)
  }

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      <div className="overflow-x-auto pb-1">
        <div className="relative" style={{ width, height }}>
          <svg className="absolute inset-0" width={width} height={height} aria-hidden="true">
            {view.edges.map(([p, c, side]) => {
              if (!x.has(p) || !x.has(c)) return null
              const x1 = px(p)
              const y1 = py(p) + NODE_H / 2
              const x2 = px(c)
              const y2 = py(c) - NODE_H / 2 - 3
              return (
                <line
                  key={`${p}-${c}-${side}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(139,149,165,0.6)"
                  strokeWidth={1.5}
                />
              )
            })}
          </svg>

          {view.nodes.map((node) => {
            const tone = markOf.get(node.id)
            const style = tone ? TONE_STYLES[tone] : null
            const labels = pointersByNode.get(node.id)
            const isFlash = flash?.has(node.id) ?? false
            return (
              <div key={`${node.id}${isFlash ? '-f' + String(frameKey ?? 0) : ''}`}>
                <div
                  className={`absolute flex items-center justify-center rounded-full border font-mono text-sm transition-all duration-300${isFlash ? ' animate-flash' : ''}`}
                  style={{
                    left: px(node.id) - NODE_W / 2,
                    top: py(node.id) - NODE_H / 2,
                    width: NODE_W,
                    height: NODE_H,
                    borderColor: style?.border ?? 'rgba(255,255,255,0.14)',
                    background: style?.bg ?? 'rgba(255,255,255,0.04)',
                    boxShadow: style ? `0 0 14px ${style.glow}` : 'none',
                    color: style?.color ?? '#e6e6e6',
                  }}
                >
                  {node.value}
                </div>
                {labels ? (
                  <div
                    className="absolute flex gap-1"
                    style={{ left: px(node.id), top: py(node.id) + NODE_H / 2 + 2, transform: 'translateX(-50%)' }}
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
                ) : null}
              </div>
            )
          })}

          {nullPointers.length > 0 ? (
            <div className="absolute left-0 font-mono text-[10px] text-sub" style={{ top: height - 18 }}>
              {nullPointers.map((label) => `${label}=null`).join('  ')}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
