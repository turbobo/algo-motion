// 样题「零钱兑换」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：完全背包逐轮松弛（array 表 + ∞ 初值）（Hot 100 · 动态规划）
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  const dpSnap = (coin) => {
    const pointers = {};
    if (coin > 0 && coin <= amount) pointers.本轮硬币 = coin;
    return {
      kind: 'array',
      values: dp.map((v) => (v === Infinity ? '∞' : String(v))),
      pointers: pointers,
      title: 'dp[i]：凑出金额 i 所需的最少硬币数（∞ = 暂时凑不出）',
    };
  };
  dp[0] = 0;
  __rec.step({
    at: 'dp[0] = 0',
    msg: '凑出金额 0 需要 0 枚硬币；其余金额先标记 ∞（凑不出）。之后拿每种硬币过一轮：每个金额 i 都试"用一枚这硬币（即 i - coin 的最优解 + 1）"是否更省',
    views: { dp: dpSnap(0) },
    vars: { 目标: String(amount) },
  });
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      if (dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
    __rec.step({
      at: 'dp[i] = dp[i - coin] + 1',
      msg: `用 ${coin} 元硬币过完一轮：所有"叠一枚 ${coin} 更省"的金额都被刷新——比如金额 ${amount} 现在需要 ${dp[amount] === Infinity ? '∞' : dp[amount]} 枚`,
      views: { dp: dpSnap(coin) },
      vars: { 本轮硬币: String(coin), 当前最优组合数: dp[amount] === Infinity ? '∞' : String(dp[amount]) },
    });
  }
  __rec.step({
    at: 'return dp[amount] === Infinity ? -1 : dp[amount]',
    msg: dp[amount] === Infinity ? `金额 ${amount} 怎么也凑不出——返回 -1` : `凑出金额 ${amount} 最少需要 ${dp[amount]} 枚硬币`,
    views: { dp: dpSnap(0) },
    vars: { 答案: dp[amount] === Infinity ? '-1' : String(dp[amount]) },
  });
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,2,5], 11 → 3（5+5+1）',
    run: function () {
      const r = coinChange([1, 2, 5], 11);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '示例: [2], 3 → -1（凑不出）',
    run: function () {
      const r = coinChange([2], 3);
      if (r !== -1) throw new Error('期望 -1，实际 ' + r);
    },
  },
  {
    label: '边界: [1], 0 → 0（目标为 0）',
    run: function () {
      const r = coinChange([1], 0);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
