// 样题「最长递增子序列」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：一维 DP 前缀枚举（nums + dp 双数组）（Hot 100 · 动态规划）
function lengthOfLIS(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  const numsSnap = (i, j) => {
    const pointers = {};
    if (i >= 0 && i < n) pointers.当前位置 = i;
    if (j >= 0 && j < i) pointers.比较 = j;
    return {
      kind: 'array',
      values: nums.map((v) => String(v)),
      pointers: pointers,
      marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
      title: 'nums',
    };
  };
  const dpSnap = (i) => ({
    kind: 'array',
    values: dp.map((v) => String(v)),
    ranges: i >= 0 && i < n ? [{ from: 0, to: Math.min(i, n - 1), label: '已算出', tone: 'ok' }] : [],
    marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
    title: 'dp[i]：以 i 结尾的最长递增子序列长度',
  });
  let best = 1;
  __rec.step({
    at: 'let best = 1',
    msg: 'dp[i] 定义成"以第 i 个数结尾"的最长递增子序列长度（自己至少算一个，初值 1）。对每个 i 回头看所有比它小的数 j：dp[i] = max(dp[i], dp[j] + 1)——把 i 接在 j 后面',
    views: { nums: numsSnap(-1, -1), dp: dpSnap(-1) },
    vars: {},
  });
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    best = Math.max(best, dp[i]);
    __rec.step({
      at: 'dp[i] = Math.max(dp[i], dp[j] + 1)',
      msg: `位置 ${i}（值 ${nums[i]}）：向前找所有比它小的数接上——dp[${i}] = ${dp[i]}；全局最长目前是 ${best}`,
      views: { nums: numsSnap(i, -1), dp: dpSnap(i) },
      vars: { 当前长度: String(dp[i]), 全局最长: String(best) },
    });
  }
  __rec.step({
    at: 'return best',
    msg: `所有位置都算完——最长递增子序列长度为 ${best}`,
    views: { nums: numsSnap(-1, -1), dp: dpSnap(-1) },
    vars: { 答案: String(best) },
  });
  return best;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [10,9,2,5,3,7,101,18] → 4',
    run: function () {
      const r = lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '示例: [0,1,0,3,2,3] → 4',
    run: function () {
      const r = lengthOfLIS([0, 1, 0, 3, 2, 3]);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素 [1] → 1',
    run: function () {
      const r = lengthOfLIS([1]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
