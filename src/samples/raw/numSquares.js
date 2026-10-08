// 样题「完全平方数」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：一维 DP 逐格松弛（array 表 + 平方数指针）（Hot 100 · 动态规划）
function numSquares(n) {
  const dp = new Array(n + 1).fill(0);
  const dpSnap = (i, sq) => {
    const pointers = {};
    if (i >= 0 && i <= n) pointers.当前 = i;
    if (sq > 0 && sq <= n) pointers.试的平方数 = sq;
    return {
      kind: 'array',
      values: dp.map((v) => String(v)),
      ranges: i >= 0 && i <= n ? [{ from: 0, to: Math.min(i, n), label: '已算出的范围', tone: 'ok' }] : [],
      pointers: pointers,
      marks: i >= 0 && i <= n ? [{ index: i, tone: 'active' }] : [],
      title: 'dp[i]：凑出 i 所需的最少平方数个数',
    };
  };
  __rec.step({
    at: 'const dp = new Array(n + 1).fill(0)',
    msg: `凑出数字 i 的最少完全平方数个数。最坏情况全用 1（i 个），所以 dp[i] 初值 = i；然后对每个平方数 k² 试"最后一步用 k²"是否更优：dp[i] = min(dp[i], dp[i - k²] + 1)`,
    views: { dp: dpSnap(0, 0) },
    vars: { n: String(n) },
  });
  for (let i = 1; i <= n; i++) {
    dp[i] = i;
    let bestFrom = -1;
    for (let k = 1; k * k <= i; k++) {
      const cand = dp[i - k * k] + 1;
      if (cand < dp[i]) {
        dp[i] = cand;
        bestFrom = k;
      }
    }
    __rec.step({
      at: 'dp[i] = i',
      msg:
        bestFrom > 0
          ? `数字 ${i}：最后一步用 ${bestFrom}²（剩 ${i - bestFrom * bestFrom} 的最优解 + 1）→ dp[${i}] = ${dp[i]}`
          : `数字 ${i}：dp[${i}] = ${dp[i]}${Number.isInteger(Math.sqrt(i)) ? '——它本身就是完全平方数' : ''}`,
      views: { dp: dpSnap(i, bestFrom > 0 ? bestFrom * bestFrom : Number.isInteger(Math.sqrt(i)) ? i : 0) },
      vars: { 当前数: String(i), 最少个数: String(dp[i]) },
    });
  }
  __rec.step({
    at: 'return dp[n]',
    msg: `凑出 ${n} 最少需要 ${dp[n]} 个完全平方数`,
    views: { dp: dpSnap(n, 0) },
    vars: { 答案: String(dp[n]) },
  });
  return dp[n];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: n=12 → 3（4+4+4）',
    run: function () {
      const r = numSquares(12);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '示例: n=13 → 2（4+9）',
    run: function () {
      const r = numSquares(13);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '边界: n=1 → 1',
    run: function () {
      const r = numSquares(1);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
