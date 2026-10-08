// 样题「缺失的第一个正数」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：原地哈希（把数字交换到「它应该在的位置」）（Hot 100 · 普通数组）
function firstMissingPositive(nums) {
  const n = nums.length;
  const listSnap = (cur, marks) => ({
    kind: 'array',
    values: [...nums],
    pointers: cur >= 0 ? { i: cur } : {},
    marks: marks || [],
    title: 'nums（原地哈希：数字 x 应该待在 nums[x−1]）',
  });
  __rec.step({
    at: 'for (let i = 0; i < n; i++)',
    msg: `目标 O(n) + O(1) 空间：把每个 [1, n] 范围内的正整数 x 交换到下标 x−1 的位置（像哈希表一样），然后从左往右第一个 nums[i] ≠ i+1 的位置，答案就是 i+1`,
    views: { list: listSnap(-1, []) },
    vars: { n: String(n) },
  });
  for (let i = 0; i < n; i++) {
    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const target = nums[i] - 1;
      const tmp = nums[target];
      nums[target] = nums[i];
      nums[i] = tmp;
      __rec.step({
        at: 'nums[i] = tmp',
        msg: `${nums[target]} 属于 [1, ${n}] 区间 → 把它交换到下标 ${target}（数字 ${nums[target]} 的"本命位"）。如果换过来的数也需要归位，while 会继续处理`,
        views: {
          list: listSnap(i, [
            { index: target, tone: 'ok' },
            { index: i, tone: 'warn' },
          ]),
        },
        vars: { i: String(i), 归位: `nums[${target}] = ${nums[target]}` },
      });
    }
  }
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) {
      __rec.step({
        at: 'return i + 1',
        msg: `从左往右检查：nums[${i}] = ${nums[i]} ≠ ${i + 1} → 位置 ${i} 上不是它该有的数字，第一个缺失的正数就是 ${i + 1}`,
        views: { list: listSnap(i, [{ index: i, tone: 'danger' }]) },
        vars: { 答案: String(i + 1) },
      });
      return i + 1;
    }
  }
  __rec.step({
    at: 'return n + 1',
    msg: `所有位置都归位了（nums[i] = i+1），说明 1..${n} 全部存在——第一个缺失的正数是 ${n + 1}`,
    views: { list: listSnap(-1, []) },
    vars: { 答案: String(n + 1) },
  });
  return n + 1;
}
__rec.tests([
  {
    label: '示例: [3,4,-1,1] → 2',
    run: function () {
      const r = firstMissingPositive([3, 4, -1, 1]);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '示例: [1,2,0] → 3',
    run: function () {
      const r = firstMissingPositive([1, 2, 0]);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '边界: [7,8,9] 全越界 → 1',
    run: function () {
      const r = firstMissingPositive([7, 8, 9]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
