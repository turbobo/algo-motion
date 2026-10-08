// 样题「买卖股票的最佳时机」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：贪心记录历史最低（array + 最低点指针）（Hot 100 · 贪心）
function maxProfit(prices) {
  const n = prices.length;
  const pricesSnap = (i, minIdx, best) => {
    const pointers = {};
    if (i >= 0 && i < n) pointers.今天 = i;
    if (minIdx >= 0 && minIdx < n) pointers.历史最低 = minIdx;
    return {
      kind: 'array',
      values: prices.map((v) => String(v)),
      ranges:
        minIdx >= 0 && minIdx < n && i > minIdx
          ? [{ from: minIdx, to: Math.min(i, n - 1), label: best > 0 ? `若此刻卖出赚 ${best}` : '这一段暂无利润', tone: best > 0 ? 'ok' : 'warn' }]
          : [],
      pointers: pointers,
      marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
      title: 'prices（每天股价）',
    };
  };
  let minPrice = Infinity;
  let minIdx = -1;
  let best = 0;
  __rec.step({
    at: 'let minPrice = Infinity',
    msg: '只能"先买后卖"一笔交易。贪心思路：从左往右走，一路记住"截至今天的历史最低价"——每一天要么刷新最低价，要么算"今天卖能赚多少"，全程取最大',
    views: { prices: pricesSnap(-1, -1, best) },
    vars: { 利润: '0' },
  });
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < minPrice) {
      minPrice = prices[i];
      minIdx = i;
    } else if (prices[i] - minPrice > best) {
      best = prices[i] - minPrice;
    }
    __rec.step({
      at: 'if (prices[i] < minPrice)',
      msg:
        minIdx === i
          ? `今天 ${prices[i]} 刷新了历史最低——从今天买最划算，利润还是 ${best}`
          : `今天 ${prices[i]}，相对历史最低 ${minPrice}（第 ${minIdx} 天买入）能赚 ${prices[i] - minPrice}${prices[i] - minPrice === best && best > 0 ? '，正是当前最佳' : ''}，当前最佳 ${best}`,
      views: { prices: pricesSnap(i, minIdx, best) },
      vars: { 历史最低: String(minPrice), 利润: String(best) },
    });
  }
  __rec.step({
    at: 'return best',
    msg: `跑完全程——最佳买卖点利润为 ${best}`,
    views: { prices: pricesSnap(-1, minIdx, best) },
    vars: { 答案: String(best) },
  });
  return best;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [7,1,5,3,6,4] → 5（1 买 6 卖）',
    run: function () {
      const r = maxProfit([7, 1, 5, 3, 6, 4]);
      if (r !== 5) throw new Error('期望 5，实际 ' + r);
    },
  },
  {
    label: '示例: [7,6,4,3,1] → 0（一路下跌不交易）',
    run: function () {
      const r = maxProfit([7, 6, 4, 3, 1]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
  {
    label: '边界: 单日 [5] → 0',
    run: function () {
      const r = maxProfit([5]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
