// 样题「接雨水」的插桩版代码（模拟 LLM 插桩产物）——单调栈解法
// 与 id: trap 的双指针版互为对照：同一道题两种思路，动画可并排对比（Hot 100 · 栈）
// 覆盖场景：单调栈逐层接水（柱高 array + 色带水面 + 栈）
function trap(height) {
  const stack = [];
  let water = 0;
  const n = height.length;
  const hSnap = (left, right, bottom) => ({
    kind: 'array',
    values: height.map((v) => String(v)),
    ranges:
      left >= 0 && right >= 0 && left <= right && right < n
        ? [{ from: left, to: right, label: '这一段接住水', tone: 'ok' }]
        : [],
    pointers: bottom >= 0 && bottom < n ? { 盆底: bottom } : {},
    title: '柱高（色带 = 正在蓄水的凹槽）',
  });
  const stackSnap = () => ({
    kind: 'stack',
    items: stack.map((k) => `${k}(${height[k]})`),
    marks: stack.length > 0 ? [{ index: stack.length - 1, tone: 'ok' }] : [],
    title: '递减栈（还没遇到更高的右墙）',
  });
  __rec.step({
    at: 'const stack = [];',
    msg: '接雨水（栈版）：栈里存"还没找到右墙"的柱子，高度从底到顶递减。一旦来了比栈顶高的柱子：栈顶就是"盆底"，它左边那根是左墙、当前是右墙——这个凹槽的水面高度 = min(左墙, 右墙)，一格一格结算',
    views: { h: hSnap(-1, -1, -1), stack: stackSnap() },
    vars: {},
  });
  for (let i = 0; i < height.length; i++) {
    while (stack.length > 0 && height[i] > height[stack[stack.length - 1]]) {
      const bottom = stack.pop();
      if (stack.length === 0) {
        break;
      }
      const left = stack[stack.length - 1];
      const w = i - left - 1;
      const h = Math.min(height[left], height[i]) - height[bottom];
      water += w * h;
      if (h > 0) {
        __rec.step({
          at: 'water += w * h',
          msg: `凹槽 [${left}, ${i}]：左墙高 ${height[left]}、右墙高 ${height[i]}，水面高 ${Math.min(height[left], height[i])}，盆底 ${height[bottom]}——蓄水 宽 ${w} × 高 ${h} = ${w * h} 格，累计 ${water}`,
          views: { h: hSnap(left, i, bottom), stack: stackSnap() },
          vars: { 本次蓄水: String(w * h), 累计: String(water) },
        });
      }
    }
    stack.push(i);
  }
  __rec.step({
    at: 'return water',
    msg: `所有凹槽都结算完——整个地形总共接住 ${water} 格雨水`,
    views: { h: hSnap(-1, -1, -1), stack: stackSnap() },
    vars: { 答案: String(water) },
  });
  return water;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [0,1,0,2,1,0,1,3,2,1,2,1] → 6',
    run: function () {
      const r = trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]);
      if (r !== 6) throw new Error('期望 6，实际 ' + r);
    },
  },
  {
    label: '示例: [4,2,0,3,2,5] → 9',
    run: function () {
      const r = trap([4, 2, 0, 3, 2, 5]);
      if (r !== 9) throw new Error('期望 9，实际 ' + r);
    },
  },
  {
    label: '边界: 单调递增 [1,2,3] → 0（接不到水）',
    run: function () {
      const r = trap([1, 2, 3]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
