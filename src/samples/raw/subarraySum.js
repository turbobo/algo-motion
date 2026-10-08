// 样题「和为 K 的子数组」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：前缀和 + 哈希表计数（Hot 100 · 子串）
function subarraySum(nums, k) {
  const listSnap = (cur) => ({
    kind: 'array',
    values: [...nums],
    pointers: cur >= 0 ? { i: cur } : {},
    marks: cur >= 0 ? [{ index: cur, tone: 'active' }] : [],
    title: 'nums',
  });
  const countSnap = (hi) => {
    const exists = hi !== null && hi !== undefined && count.has(hi);
    return {
      kind: 'hashmap',
      entries: [...count.entries()].map(([key, v]) => [String(key), `${v} 次`]),
      highlightKeys: exists ? [String(hi)] : [],
      title: 'count：前缀和 → 出现次数',
    };
  };
  const count = new Map();
  count.set(0, 1);
  let sum = 0;
  let res = 0;
  __rec.step({
    at: 'count.set(0, 1)',
    msg: `核心等式：子数组 (j, i] 的和 = 前缀和 sum(0..i) − sum(0..j)。所以边累加前缀和 sum，边查"sum − k 出现过几次"。先塞入 sum = 0 出现 1 次（代表空前缀，让从 0 开始的子数组也能被算到）`,
    views: { list: listSnap(-1), count: countSnap(0) },
    vars: { k: String(k), sum: '0', res: '0' },
  });
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (count.has(sum - k)) {
      res += count.get(sum - k);
    }
    const hits = count.get(sum - k) || 0;
    count.set(sum, (count.get(sum) || 0) + 1);
    __rec.step({
      at: 'count.set(sum, (count.get(sum) || 0) + 1)',
      msg: `加上 ${nums[i]} 后前缀和 sum = ${sum}；查 sum − k = ${sum - k}：${hits > 0 ? `出现过 ${hits} 次 → 新增 ${hits} 个合法子数组，res = ${res}` : '没出现过 → 本轮没有以 i 结尾的答案'}。然后把 ${sum} 也记进表`,
      views: { list: listSnap(i), count: countSnap(sum - k) },
      vars: { sum: String(sum), 'sum − k': String(sum - k), res: String(res) },
    });
  }
  __rec.step({
    at: 'return res',
    msg: `扫描完成，和为 ${k} 的连续子数组共有 ${res} 个`,
    views: { list: listSnap(-1), count: countSnap(null) },
    vars: { 答案: String(res) },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: nums=[1,2,3], k=3',
    run: function () {
      const r = subarraySum([1, 2, 3], 3);
      if (r !== 2) throw new Error('期望 2（[1,2] 和 [3]），实际 ' + r);
    },
  },
  {
    label: '含负数: [1,-1,0], k=0',
    run: function () {
      const r = subarraySum([1, -1, 0], 0);
      if (r !== 3) throw new Error('期望 3（[1,-1]、[0]、[1,-1,0]），实际 ' + r);
    },
  },
  {
    label: '边界: 无解 [1,1], k=3',
    run: function () {
      const r = subarraySum([1, 1], 3);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
