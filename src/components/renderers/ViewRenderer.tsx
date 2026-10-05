/** 视图分发器：按 kind 渲染对应视图 */
import type { View } from '../../types'
import { ArrayView } from './ArrayView'
import { HashmapView } from './HashmapView'
import { LinkedListView } from './LinkedListView'

export function ViewRenderer({ view }: { view: View }) {
  switch (view.kind) {
    case 'array':
      return <ArrayView view={view} />
    case 'hashmap':
      return <HashmapView view={view} />
    case 'linkedlist':
      return <LinkedListView view={view} />
  }
}
