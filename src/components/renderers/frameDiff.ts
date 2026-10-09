/**
 * 帧间差异：逐视图类型对比前后两帧，输出「变化元素标识」集合（视图名 → 标识集）。
 * 供渲染器给变化元素叠加脉冲高亮 —— 让学习者一眼看到「这一帧变了什么」。
 *
 * 标识约定（与各渲染器的元素标识一致）：
 * - array / stack：元素下标字符串
 * - hashmap：条目的 key
 * - linkedlist / tree：节点 id
 * - matrix / grid："r:c"
 *
 * 无前帧（首帧 / 切换用例）返回空对象 = 不闪烁。
 */
import type { View } from '../../types'

export type FrameFlash = Record<string, ReadonlySet<string>>

export function diffViews(
  prev: Record<string, View> | undefined,
  cur: Record<string, View> | undefined,
): FrameFlash {
  const out: Record<string, Set<string>> = {}
  if (!prev || !cur) return out

  for (const [name, v] of Object.entries(cur)) {
    const p = prev[name]
    // 视图名对不上或 kind 变了（如整体替换视图）不做元素级比较
    if (!p || p.kind !== v.kind) continue
    const changed = new Set<string>()

    switch (v.kind) {
      case 'array': {
        if (p.kind !== 'array') break
        v.values.forEach((val, i) => {
          if (p.values[i] !== val) changed.add(String(i))
        })
        break
      }
      case 'hashmap': {
        if (p.kind !== 'hashmap') break
        const before = new Map(p.entries)
        for (const [k, val] of v.entries) {
          // 新 key 或值变化都算（指针/高亮变化走各自的 transition，不闪）
          if (before.get(k) !== val) changed.add(k)
        }
        break
      }
      case 'linkedlist': {
        if (p.kind !== 'linkedlist') break
        const before = new Map<string, string>()
        p.nodes.forEach((n, i) => {
          before.set(n.id, `${n.value}→${p.next[i]?.[1] ?? 'null'}`)
        })
        v.nodes.forEach((n, i) => {
          // 节点值或它的出边变化 → 闪该节点（重连/改值都是关键一步）
          const sig = `${n.value}→${v.next[i]?.[1] ?? 'null'}`
          if (before.get(n.id) !== sig) changed.add(n.id)
        })
        break
      }
      case 'matrix': {
        if (p.kind !== 'matrix') break
        v.values.forEach((row, r) => {
          row.forEach((val, c) => {
            if ((p.values[r] ?? [])[c] !== val) changed.add(`${r}:${c}`)
          })
        })
        break
      }
      case 'tree': {
        if (p.kind !== 'tree') break
        const sigOf = (nodes: typeof v.nodes, edges: typeof v.edges): Map<string, string> => {
          const m = new Map<string, string>()
          for (const n of nodes) {
            const left = edges.find((e) => e[0] === n.id && e[2] === 'left')?.[1] ?? ''
            const right = edges.find((e) => e[0] === n.id && e[2] === 'right')?.[1] ?? ''
            m.set(n.id, `${n.value}(${left},${right})`)
          }
          return m
        }
        const before = sigOf(p.nodes, p.edges)
        for (const [id, sig] of sigOf(v.nodes, v.edges)) {
          // 节点值或它的左右孩子变化 → 闪（翻转二叉树时节点位置变化即被捕捉）
          if (before.get(id) !== sig) changed.add(id)
        }
        break
      }
      case 'grid': {
        if (p.kind !== 'grid') break
        v.cells.forEach((row, r) => {
          row.forEach((val, c) => {
            if ((p.cells[r] ?? [])[c] !== val) changed.add(`${r}:${c}`)
          })
        })
        break
      }
      case 'stack': {
        if (p.kind !== 'stack') break
        v.items.forEach((item, i) => {
          if (p.items[i] !== item) changed.add(String(i))
        })
        break
      }
      default:
        break
    }

    if (changed.size > 0) out[name] = changed
  }
  return out
}
