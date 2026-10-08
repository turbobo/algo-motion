// 样题「盛最多水的容器」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：左右双指针 + 区间色带展示容器（Hot 100 · 双指针）
function maxArea(height) {
  const listSnap = (l, r, marks, tone, label) => ({
    kind: 'array',
    values: [...height],
    pointers: l >= 0 ? { left: l, right: r } : {},
    marks: marks || [],
    ranges: label ? [{ from: l, to: r, label: label, tone: tone || 'ok' }] : [],
    title: 'height',
  });
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  __rec.step({
    at: 'let best = 0',
    msg: '容器容量 = 两边较矮的高度 × 两边距离。指针从最左最右开始（宽度最大），每轮算一次容量，然后"谁矮谁往里移动"——因为矮边决定了容量，动高边没有意义',
    views: { list: listSnap(left, right, [{ index: left, tone: 'active' }, { index: right, tone: 'active' }], 'ok', '初始容器') },
    vars: { best: '0' },
  });
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    const area = h * (right - left);
    best = Math.max(best, area);
    const moved = height[left] <= height[right] ? '左' : '右';
    __rec.step({
      at: 'best = Math.max(best, area)',
      msg: `当前容器：高 min(${height[left]}, ${height[right]}) = ${h} × 宽 ${right - left} = ${area} → best = ${best}；${moved}边更矮，把它往里移去搏更高的边`,
      views: {
        list: listSnap(
          left,
          right,
          [{ index: left, tone: height[left] <= height[right] ? 'warn' : 'muted' }, { index: right, tone: height[left] <= height[right] ? 'muted' : 'warn' }],
          'ok',
          `${h} × ${right - left} = ${area}`,
        ),
      },
      vars: { best: String(best), 左高: String(height[left]), 右高: String(height[right]) },
    });
    if (height[left] <= height[right]) {
      left++;
    } else {
      right--;
    }
  }
  __rec.step({
    at: 'return best',
    msg: `两指针相遇，所有候选容器都试过了——最大容量 ${best}`,
    views: { list: listSnap(-1, -1, [], null, null) },
    vars: { 答案: String(best) },
  });
  return best;
}
__rec.tests([
  {
    label: '示例: [1,8,6,2,5,4,8,3,7]',
    run: function () {
      const r = maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]);
      if (r !== 49) throw new Error('期望 49，实际 ' + r);
    },
  },
  {
    label: '边界: 两根柱子',
    run: function () {
      const r = maxArea([1, 1]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '边界: 递减高度',
    run: function () {
      const r = maxArea([5, 4, 3, 2, 1]);
      if (r !== 6) throw new Error('期望 6，实际 ' + r);
    },
  },
]);
