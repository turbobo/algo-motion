/** 视图分发器：按 kind 渲染对应视图 */
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
  }
}
