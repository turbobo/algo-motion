// 样题「爬楼梯」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：一维 DP 递推填表（array 表 + 前两格高亮）（Hot 100 · 动态规划）
function climbStairs(n) {
  const dp = new Array(n + 1).fill(0);
  const dpSnap = (i) => ({
    kind: 'array',
    values: dp.map((v) => String(v)),
    ranges: i >= 2 ? [{ from: i - 2, to: i - 1, label: '上一格 + 上上格', tone: 'warn' }] : [],
    marks: i >= 0 && i <= n ? [{ index: i, tone: 'active' }] : [],
    title: 'dp[i]：爬到第 i 阶的方法数',
  });
  dp[0] = 1;
  dp[1] = 1;
  __rec.step({
    at: 'dp[0] = 1',
    msg: '爬楼梯的递推：到第 i 阶的最后一步要么从 i-1 迈 1 步、要么从 i-2 迈 2 步 → dp[i] = dp[i-1] + dp[i-2]（斐波那契）。地基：dp[0] = dp[1] = 1',
    views: { dp: dpSnap(0) },
    vars: {},
  });
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    __rec.step({
      at: 'dp[i] = dp[i - 1] + dp[i - 2]',
      msg: `第 ${i} 阶：dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      views: { dp: dpSnap(i) },
      vars: { 阶数: String(i), 方法数: String(dp[i]) },
    });
  }
  __rec.step({
    at: 'return dp[n]',
    msg: `填到第 ${n} 阶——一共 ${dp[n]} 种爬法`,
    views: { dp: dpSnap(n) },
    vars: { 答案: String(dp[n]) },
  });
  return dp[n];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: n=3 → 3',
    run: function () {
      const r = climbStairs(3);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '示例: n=5 → 8',
    run: function () {
      const r = climbStairs(5);
      if (r !== 8) throw new Error('期望 8，实际 ' + r);
    },
  },
  {
    label: '边界: n=1 → 1',
    run: function () {
      const r = climbStairs(1);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
