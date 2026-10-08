// 样题「打家劫舍」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：一维 DP 二选一（nums + dp 双数组）（Hot 100 · 动态规划）
function rob(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  const numsSnap = (i) => ({
    kind: 'array',
    values: nums.map((v) => String(v)),
    pointers: i >= 0 && i < n ? { 当前: i } : {},
    marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
    title: '每家的现金',
  });
  const dpSnap = (i, hi) => ({
    kind: 'array',
    values: dp.map((v) => String(v)),
    ranges: hi >= 0 ? [{ from: 0, to: Math.min(hi, n - 1), label: '已决策的范围', tone: 'ok' }] : [],
    marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
    title: 'dp[i]：到第 i 家为止能偷到的最大金额',
  });
  dp[0] = nums[0];
  __rec.step({
    at: 'dp[0] = nums[0]',
    msg: '相邻两家不能同时偷。dp[i] 表示"只考虑前 i 家"的最优解——对第 i 家只有两种选择：不偷（保持 dp[i-1]）或偷（dp[i-2] + 这家现金，隔一家）。取两者的大',
    views: { nums: numsSnap(0), dp: dpSnap(0, 0) },
    vars: {},
  });
  if (n > 1) {
    dp[1] = Math.max(nums[0], nums[1]);
  }
  if (n > 1) {
    __rec.step({
      at: 'dp[1] = Math.max(nums[0], nums[1])',
      msg: `前两家只能选一家：max(${nums[0]}, ${nums[1]}) = ${dp[1]}`,
      views: { nums: numsSnap(1), dp: dpSnap(1, 1) },
      vars: { 金额: String(dp[1]) },
    });
  }
  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    __rec.step({
      at: 'dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i])',
      msg: `第 ${i} 家（${nums[i]} 元）：不偷 = ${dp[i - 1]}，偷 = dp[${i - 2}] + ${nums[i]} = ${dp[i - 2] + nums[i]} → 取 max = ${dp[i]}`,
      views: { nums: numsSnap(i), dp: dpSnap(i, i) },
      vars: { 金额: String(dp[i]) },
    });
  }
  __rec.step({
    at: 'return dp[n - 1]',
    msg: `决策到最后一家的最优解：${dp[n - 1]}`,
    views: { nums: numsSnap(-1), dp: dpSnap(-1, n - 1) },
    vars: { 答案: String(dp[n - 1]) },
  });
  return dp[n - 1];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,2,3,1] → 4（偷 1+3）',
    run: function () {
      const r = rob([1, 2, 3, 1]);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '示例: [2,7,9,3,1] → 12（偷 2+9+1）',
    run: function () {
      const r = rob([2, 7, 9, 3, 1]);
      if (r !== 12) throw new Error('期望 12，实际 ' + r);
    },
  },
  {
    label: '边界: 单家 [5] → 5',
    run: function () {
      const r = rob([5]);
      if (r !== 5) throw new Error('期望 5，实际 ' + r);
    },
  },
]);
