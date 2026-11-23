/**
 * 数组指针布局：按目标下标分组，组内按标签宽度水平排列并整体居中于格子上方。
 * 解决多指针同格（左右相遇）重叠；不同下标各自居中，互不影响。
 * 返回每个指针标签的中心 x 坐标（px）。
 */
export function layoutPointers(
  pointers: Record<string, number>,
  step: number,
  cell: number,
): Record<string, number> {
  const groups = new Map<number, string[]>()
  for (const [label, idx] of Object.entries(pointers)) {
    const list = groups.get(idx)
    if (list) list.push(label)
    else groups.set(idx, [label])
  }

  const out: Record<string, number> = {}
  const GAP = 4
  for (const [idx, labels] of groups) {
    const widths = labels.map((l) => Math.max(18, l.length * 7 + 12))
    const total = widths.reduce((a, b) => a + b, 0) + GAP * (labels.length - 1)
    let x = idx * step + cell / 2 - total / 2
    labels.forEach((label, i) => {
      const w = widths[i] ?? 18
      out[label] = x + w / 2
      x += w + GAP
    })
  }
  return out
}