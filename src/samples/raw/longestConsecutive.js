// 样题「最长连续序列」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：哈希集合 O(1) 查数 + array 扫描指针（Hot 100 · 哈希）
function longestConsecutive(nums) {
  const set = new Set(nums);
  const listSnap = (cur) => ({
    kind: 'array',
    values: [...nums],
    marks: cur >= 0 ? [{ index: cur, tone: 'active' }] : [],
    pointers: cur >= 0 ? { num: cur } : {},
    title: 'nums',
  });
  const setSnap = (hi) => ({
    kind: 'hashmap',
    entries: [...set].map((v) => [String(v), '✓']),
    highlightKeys: hi !== null && hi !== undefined ? [String(hi)] : [],
    title: 'set：数字 → 存在（O(1) 查表）',
  });
  __rec.step({
    at: 'const set = new Set(nums)',
    msg: '先把所有数字装进集合。核心思路：一个数字是"连续段的起点"，当且仅当它没有前驱（num - 1 不在集合里）——只从起点开始往后数，总复杂度才是 O(n)',
    views: { list: listSnap(-1), set: setSnap(null) },
    vars: { best: '0' },
  });
  let best = 0;
  for (const num of nums) {
    const idx = nums.indexOf(num);
    if (set.has(num - 1)) {
      __rec.step({
        at: 'if (set.has(num - 1)) continue',
        msg: `${num} 有前驱 ${num - 1}（在集合里）→ 它不是起点，跳过——等从真正的起点扫过来时会带上它`,
        views: { list: listSnap(idx), set: setSnap(num - 1) },
        vars: { best: String(best), 当前: String(num) },
      });
      continue;
    }
    let cur = num;
    let len = 1;
    __rec.step({
      at: 'let cur = num',
      msg: `${num} 没有前驱 → 它是某个连续段的起点！从这里开始往后延伸`,
      views: { list: listSnap(idx), set: setSnap(num) },
      vars: { best: String(best), 当前: String(num) },
    });
    while (set.has(cur + 1)) {
      cur++;
      len++;
    }
    best = Math.max(best, len);
    __rec.step({
      at: 'best = Math.max(best, len)',
      msg: `从 ${num} 一直延伸到 ${cur}，连续长度 ${len} → 最长记录 best = ${best}`,
      views: { list: listSnap(idx), set: setSnap(cur) },
      vars: { best: String(best), 当前段: `${num} → ${cur}（长 ${len}）` },
    });
  }
  __rec.step({
    at: 'return best',
    msg: `扫描结束，最长连续序列的长度是 ${best}`,
    views: { list: listSnap(-1), set: setSnap(null) },
    vars: { 答案: String(best) },
  });
  return best;
}
__rec.tests([
  {
    label: '示例: [100,4,200,1,3,2]',
    run: function () {
      const r = longestConsecutive([100, 4, 200, 1, 3, 2]);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '示例: [0,3,7,2,5,8,4,6,0,1]',
    run: function () {
      const r = longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]);
      if (r !== 9) throw new Error('期望 9，实际 ' + r);
    },
  },
  {
    label: '边界: 空数组',
    run: function () {
      const r = longestConsecutive([]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
