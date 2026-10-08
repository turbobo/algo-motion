// 样题「跳跃游戏 II」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：贪心逐层扩边（array + 边界指针）（Hot 100 · 贪心）
function jump(nums) {
  const n = nums.length;
  const numsSnap = (i, end, farthest) => {
    const pointers = {};
    if (i >= 0 && i < n) pointers.当前位置 = i;
    if (end >= 0 && end < n) pointers.本跳边界 = end;
    if (farthest >= 0 && farthest < n) pointers.下一跳最远 = farthest;
    return {
      kind: 'array',
      values: nums.map((v) => String(v)),
      ranges: end >= 0 ? [{ from: 0, to: Math.min(end, n - 1), label: '当前这一跳能覆盖的范围', tone: 'ok' }] : [],
      pointers: pointers,
      marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
      title: 'nums（每格 = 能再跳几步）',
    };
  };
  let jumps = 0;
  let end = 0;
  let farthest = 0;
  __rec.step({
    at: 'let jumps = 0',
    msg: '最少跳几次 = BFS 的思路：把"当前这一跳能到的所有位置"看成一层，站在层内每个位置都探一下"下一跳最远到哪"，走到层的边界就必须跳一次，把边界推进到刚才探出的最远处',
    views: { nums: numsSnap(-1, end, farthest) },
    vars: { 已跳: '0' },
  });
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === end) {
      jumps++;
      end = farthest;
      __rec.step({
        at: 'end = farthest',
        msg: `走到第 ${i} 格的层边界——必须跳了！第 ${jumps} 跳把覆盖范围推进到 ${end}（层内所有格子探出的最远距离）`,
        views: { nums: numsSnap(i, end, farthest) },
        vars: { 已跳: String(jumps), 覆盖到: String(end) },
      });
    }
  }
  __rec.step({
    at: 'return jumps',
    msg: `覆盖范围已经推过终点——最少跳 ${jumps} 次`,
    views: { nums: numsSnap(-1, end, farthest) },
    vars: { 答案: String(jumps) },
  });
  return jumps;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [2,3,1,1,4] → 2',
    run: function () {
      const r = jump([2, 3, 1, 1, 4]);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '示例: [2,3,0,1,4] → 2',
    run: function () {
      const r = jump([2, 3, 0, 1, 4]);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素 [0] → 0（已在终点）',
    run: function () {
      const r = jump([0]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
