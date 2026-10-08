// 样题「接雨水」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：左右双指针 + 两侧最高柱维护（Hot 100 · 双指针）
function trap(height) {
  const listSnap = (l, r, marks) => ({
    kind: 'array',
    values: [...height],
    pointers: l >= 0 ? { left: l, right: r } : {},
    marks: marks || [],
    title: 'height',
  });
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  __rec.step({
    at: 'let water = 0',
    msg: '每根柱子能接的水 = min(它左边最高柱, 它右边最高柱) - 自身高度。双指针技巧：leftMax/rightMax 记录两边的历史最高，谁那边矮就结算谁——矮边的接水量已经确定，不受对面影响',
    views: { list: listSnap(left, right, [{ index: left, tone: 'active' }, { index: right, tone: 'active' }]) },
    vars: { leftMax: '0', rightMax: '0', water: '0' },
  });
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      const gain = leftMax - height[left];
      __rec.step({
        at: 'water += leftMax - height[left]',
        msg:
          gain > 0
            ? `左边 ${height[left]} 更矮：leftMax 是 ${leftMax}，这格头顶能接 ${leftMax} - ${height[left]} = ${gain} 格水，water 累计 ${water}`
            : `左边 ${height[left]} 更矮，但它本身就是左墙新高（leftMax = ${leftMax}）→ 头顶接不到水，water 保持 ${water}`,
        views: { list: listSnap(left, right, [{ index: left, tone: gain > 0 ? 'ok' : 'warn' }]) },
        vars: { leftMax: String(leftMax), rightMax: String(rightMax), water: String(water) },
      });
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      const gain = rightMax - height[right];
      __rec.step({
        at: 'water += rightMax - height[right]',
        msg:
          gain > 0
            ? `右边 ${height[right]} 更矮：rightMax 是 ${rightMax}，这格头顶能接 ${rightMax} - ${height[right]} = ${gain} 格水，water 累计 ${water}`
            : `右边 ${height[right]} 更矮，但它刷新了右墙高度（rightMax = ${rightMax}）→ 头顶接不到水，water 保持 ${water}`,
        views: { list: listSnap(left, right, [{ index: right, tone: gain > 0 ? 'ok' : 'warn' }]) },
        vars: { leftMax: String(leftMax), rightMax: String(rightMax), water: String(water) },
      });
      right--;
    }
  }
  __rec.step({
    at: 'return water',
    msg: `两指针相遇，所有柱子上方的水都结算完了——总共能接 ${water} 格雨水`,
    views: { list: listSnap(-1, -1, []) },
    vars: { 答案: String(water) },
  });
  return water;
}
__rec.tests([
  {
    label: '示例: [0,1,0,2,1,0,1,3,2,1,2,1]',
    run: function () {
      const r = trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]);
      if (r !== 6) throw new Error('期望 6，实际 ' + r);
    },
  },
  {
    label: '边界: [4,2,0,3,2,5]',
    run: function () {
      const r = trap([4, 2, 0, 3, 2, 5]);
      if (r !== 9) throw new Error('期望 9，实际 ' + r);
    },
  },
  {
    label: '边界: 太短接不到水 [5,4]',
    run: function () {
      const r = trap([5, 4]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
