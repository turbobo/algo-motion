/**
 * 视图分发器：按 kind 渲染对应视图。
 * 沙箱侧 sanitizeView 已保证只有已登记的 kind 能到达这里；default 是第二道防线——
 * 未经清洗的数据（手工构造、未来新增 kind）绝不允许把整页带崩。
 */
import type { View } from '../../types'
import { ArrayView } from './ArrayView'
import { GridView } from './GridView'
import { HashmapView } from './HashmapView'
import { LinkedListView } from './LinkedListView'
import { MatrixView } from './MatrixView'
import { StackView } from './StackView'
import { TreeView } from './TreeView'

export function ViewRenderer({ view }: { view: View }) {
  switch (view.kind) {
    case 'array':
      return <ArrayView view={view} />
    case 'hashmap':
      return <HashmapView view={view} />
    case 'linkedlist':
      return <LinkedListView view={view} />
    case 'matrix':
      return <MatrixView view={view} />
    case 'tree':
      return <TreeView view={view} />
    case 'grid':
      return <GridView view={view} />
    case 'stack':
      return <StackView view={view} />
    default: {
      const kind = (view as { kind?: unknown }).kind
      return (
        <div className="rounded-lg border border-dashed border-white/10 px-3 py-2 font-mono text-xs text-sub">
          暂不支持的视图类型：{typeof kind === 'string' ? kind.slice(0, 24) : '未知'}
        </div>
      )
    }
  }
}
