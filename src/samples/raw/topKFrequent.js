// 样题「前 K 个高频元素」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：频率桶排序倒扫（hashmap 频率 + 桶列表 + 结果）（Hot 100 · 堆）
function topKFrequent(nums, k) {
  const freq = new Map();
  const freqSnap = () => ({
    kind: 'hashmap',
    entries: [...freq.entries()].map(([num, f]) => [String(num), `${f} 次`]),
    highlightKeys: [],
    title: '频率表',
  });
  const buckets = [];
  const bucketSnap = (f) => ({
    kind: 'array',
    values: buckets.flatMap((b, i) => (b.length > 0 ? [`${i} 次 → [${b.join(', ')}]`] : [])),
    marks: [],
    title: '频率桶（出现 i 次的数放进第 i 个桶）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((v) => String(v)),
    title: `结果（前 ${k} 高频）`,
  });
  const res = [];
  __rec.step({
    at: 'const freq = new Map();',
    msg: `${nums.length} 个数字里找前 ${k} 高频：先数频率，再把"出现 f 次的数"放进第 f 个桶（桶就是个二维表）——最后从最高频的桶倒着扫，凑满 ${k} 个就收工，不用排序`,
    views: { freq: freqSnap(), buckets: bucketSnap(-1), res: resSnap() },
    vars: {},
  });
  for (const x of nums) {
    freq.set(x, (freq.get(x) || 0) + 1);
  }
  for (let i = 0; i <= nums.length; i++) {
    buckets.push([]);
  }
  for (const pair of freq) {
    buckets[pair[1]].push(pair[0]);
  }
  __rec.step({
    at: 'const buckets = [];',
    msg: `数完频率、装好桶：最高频的桶在最后（越靠后越热），从那儿倒着捡就能先拿到高频元素`,
    views: { freq: freqSnap(), buckets: bucketSnap(-1), res: resSnap() },
    vars: { 桶数: String(buckets.length) },
  });
  for (let f = nums.length; f >= 0 && res.length < k; f--) {
    for (const num of buckets[f]) {
      res.push(num);
      __rec.step({
        at: 'res.push(num)',
        msg: `从 ${f} 次桶里捡出 ${num}——${res.length === k ? '凑满 ' + k + ' 个，结束！' : '还差 ' + (k - res.length) + ' 个，继续往低频方向扫'}`,
        views: { freq: freqSnap(), buckets: bucketSnap(f), res: resSnap() },
        vars: { 当前桶: f + ' 次', 已凑: `${res.length}/${k}` },
      });
      if (res.length === k) {
        return res;
      }
    }
  }
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,1,1,2,2,3], k=2 → [1,2]',
    run: function () {
      const r = topKFrequent([1, 1, 1, 2, 2, 3], 2);
      if (JSON.stringify(r) !== JSON.stringify([1, 2])) throw new Error('期望 [1,2]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: [1], k=1 → [1]',
    run: function () {
      const r = topKFrequent([1], 1);
      if (JSON.stringify(r) !== JSON.stringify([1])) throw new Error('期望 [1]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: [1,2], k=2 → [1,2]（各一次）',
    run: function () {
      const r = topKFrequent([1, 2], 2);
      if (JSON.stringify(r) !== JSON.stringify([1, 2])) throw new Error('期望 [1,2]，实际 ' + JSON.stringify(r));
    },
  },
]);
