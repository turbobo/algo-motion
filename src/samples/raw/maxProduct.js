// 样题「乘积最大子数组」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：一维 DP 双状态（最大/最小同维护）（Hot 100 · 动态规划）
function maxProduct(nums) {
  const n = nums.length;
  const numsSnap = (i) => {
    const pointers = {};
    if (i >= 0 && i < n) pointers.当前 = i;
    return {
      kind: 'array',
      values: nums.map((v) => String(v)),
      ranges: i >= 0 && i < n ? [{ from: 0, to: Math.min(i, n - 1), label: '已扫过', tone: 'ok' }] : [],
      pointers: pointers,
      marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
      title: 'nums（高亮 = 刚乘上的数）',
    };
  };
  let maxProd = nums[0];
  let minProd = nums[0];
  let best = nums[0];
  __rec.step({
    at: 'let maxProd = nums[0]',
    msg: '子数组必须连续——所以每个位置只关心"以我结尾"的最大乘积。坑在负数：负 × 负会变大，所以还要同时维护"以我结尾的最小乘积"——每步都可能翻转',
    views: { nums: numsSnap(0) },
    vars: { 最大乘积: String(maxProd), 最小乘积: String(minProd) },
  });
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    if (x < 0) {
      const t = maxProd;
      maxProd = minProd;
      minProd = t;
    }
    maxProd = Math.max(x, maxProd * x);
    minProd = Math.min(x, minProd * x);
    best = Math.max(best, maxProd);
    __rec.step({
      at: 'best = Math.max(best, maxProd)',
      msg: `乘上 ${x}${x < 0 ? '（负数！先交换最大/最小再乘——负负得正嘛）' : ''}：以 ${i} 结尾的最大乘积 = ${maxProd}，最小乘积 = ${minProd}，全局最佳 ${best}`,
      views: { nums: numsSnap(i) },
      vars: { 最大乘积: String(maxProd), 最小乘积: String(minProd), best: String(best) },
    });
  }
  __rec.step({
    at: 'return best',
    msg: `全程最大乘积为 ${best}`,
    views: { nums: numsSnap(-1) },
    vars: { 答案: String(best) },
  });
  return best;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [2,3,-2,4] → 6（[2,3]）',
    run: function () {
      const r = maxProduct([2, 3, -2, 4]);
      if (r !== 6) throw new Error('期望 6，实际 ' + r);
    },
  },
  {
    label: '示例: [-2,0,-1] → 0',
    run: function () {
      const r = maxProduct([-2, 0, -1]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
  {
    label: '边界: [-2,-3] → 6（负负得正）',
    run: function () {
      const r = maxProduct([-2, -3]);
      if (r !== 6) throw new Error('期望 6，实际 ' + r);
    },
  },
]);
