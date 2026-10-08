// 样题「分割等和子集」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：01 背包逆序枚举（bool array dp）（Hot 100 · 动态规划）
function canPartition(nums) {
  let sum = 0;
  for (const x of nums) {
    sum += x;
  }
  __rec.step({
    at: 'if (sum % 2 !== 0)',
    msg: `能不能分成两个和相等的子集 = 能不能挑出一些数凑出总和的一半 ${sum} ÷ 2。如果总和是奇数，一半都不是整数——直接不行`,
    views: { nums: { kind: 'array', values: nums.map((v) => String(v)), title: 'nums（总和 ' + sum + '）' } },
    vars: { 总和: String(sum), 目标: String(Math.floor(sum / 2)) },
  });
  if (sum % 2 !== 0) {
    __rec.step({
      at: 'return false',
      msg: `总和 ${sum} 是奇数——无法平分，返回 false`,
      views: { nums: { kind: 'array', values: nums.map((v) => String(v)), title: 'nums' } },
      vars: { 答案: 'false' },
    });
    return false;
  }
  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  const dpSnap = () => ({
    kind: 'array',
    values: dp.map((v) => (v ? '✓' : '·')),
    title: `dp[j]：能不能用部分数凑出 j（目标 ${target}）`,
  });
  dp[0] = true;
  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      if (dp[j - num]) {
        dp[j] = true;
      }
    }
    __rec.step({
      at: 'for (let j = target; j >= num; j--) {',
      msg: `过一遍数 ${num}（金额从大到小逆序扫——保证每个数最多用一次）：所有"差 ${num} 就能凑到"的金额都点亮了——当前能凑到 ${dp.filter(Boolean).length} 种金额`,
      views: { dp: dpSnap() },
      vars: { 本轮数: String(num), 目标可达: String(dp[target]) },
    });
  }
  __rec.step({
    at: 'return dp[target]',
    msg: dp[target] ? `凑出了 ${target}——另一半自然也是 ${target}，可以平分！` : `凑不出 ${target}——不能平分`,
    views: { dp: dpSnap() },
    vars: { 答案: String(dp[target]) },
  });
  return dp[target];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,5,11,5] → true（1+11 = 5+5）',
    run: function () {
      const r = canPartition([1, 5, 11, 5]);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: [1,2,3,5] → false（奇数）',
    run: function () {
      const r = canPartition([1, 2, 3, 5]);
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: [1,2,3] → true（3 = 1+2）',
    run: function () {
      const r = canPartition([1, 2, 3]);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
]);
