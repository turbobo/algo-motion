/**
 * 视图分发器：按 kind 渲染对应视图。
 * 沙箱侧 sanitizeView 已保证只有已登记的 kind 能到达这里；default 是第二道防线——
 * 未经清洗的数据（手工构造、未来新增 kind）绝不允许把整页带崩。
 */
import type { View } from '../../types'
import { ArrayView } from './ArrayView'
import { GraphView } from './GraphView'
import { GridView } from './GridView'
import { HashmapView } from './HashmapView'
import { LinkedListView } from './LinkedListView'
import { MatrixView } from './MatrixView'
import { StackView } from './StackView'
import { TreeView } from './TreeView'

export function ViewRenderer({
  view,
  flash,
  frameKey,
  complete,
}: {
  view: View
  /** 本帧变化元素标识集（frameDiff 产出，按视图名分发到各渲染器） */
  flash?: ReadonlySet<string>
  /** 帧序号：让连续变化的同一元素重新挂载以重播脉冲动画 */
  frameKey?: number
  /** 末帧（完成时刻）：ok 元素绽放 */
  complete?: boolean
}) {
  switch (view.kind) {
    case 'array':
      return <ArrayView view={view} flash={flash} frameKey={frameKey} complete={complete} />
    case 'hashmap':
      return <HashmapView view={view} flash={flash} frameKey={frameKey} complete={complete} />
    case 'linkedlist':
      return <LinkedListView view={view} flash={flash} frameKey={frameKey} complete={complete} />
    case 'matrix':
      return <MatrixView view={view} flash={flash} frameKey={frameKey} complete={complete} />
    case 'tree':
      return <TreeView view={view} flash={flash} frameKey={frameKey} complete={complete} />
    case 'grid':
      return <GridView view={view} flash={flash} frameKey={frameKey} />
    case 'stack':
      return <StackView view={view} flash={flash} frameKey={frameKey} complete={complete} />
    case 'graph':
      return <GraphView view={view} flash={flash} frameKey={frameKey} complete={complete} />
    default: {
      const kind = (view as { kind?: unknown }).kind
      return (
        <div className="rounded-lg border border-dashed border-line px-3 py-2 font-mono text-xs text-sub">
          暂不支持的视图类型：{typeof kind === 'string' ? kind.slice(0, 24) : '未知'}
        </div>
      )
    }
  }
}
