// 样题「划分字母区间」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：贪心扩展片段边界（字符 array + 最后位置 hashmap + 区间色带）（Hot 100 · 贪心）
function partitionLabels(s) {
  const last = new Map();
  const lastSnap = (hi) => ({
    kind: 'hashmap',
    entries: [...last.entries()].map(([ch, pos]) => [ch, `最后出现在 ${pos}`]),
    highlightKeys: hi !== null && hi !== undefined && last.has(hi) ? [hi] : [],
    title: '每个字母最后出现的位置',
  });
  const sSnap = (i, start, end) => {
    const n = s.length;
    const pointers = {};
    if (i >= 0 && i < n) pointers.当前 = i;
    if (start >= 0 && start < n) pointers.片段起点 = start;
    if (end >= 0 && end < n) pointers.片段终点 = end;
    return {
      kind: 'array',
      values: s.split(''),
      ranges: start >= 0 && start < n ? [{ from: start, to: Math.min(end, n - 1), label: '当前片段', tone: 'warn' }] : [],
      pointers: pointers,
      marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
      title: '字符串 s（片段内的字母不能出现在片段外）',
    };
  };
  const resSnap = () => ({ kind: 'array', values: res.map((v) => String(v)), title: '每段的长度' });
  for (let i = 0; i < s.length; i++) {
    last.set(s[i], i);
  }
  const res = [];
  let start = 0;
  let end = 0;
  __rec.step({
    at: 'let start = 0',
    msg: '要把字符串切成尽量多的片段，且同一字母不能出现在两个片段里。先扫一遍记下"每个字母最后出现在哪"——然后从左往右走：片段终点 = 片内所有字母的最后位置的最大值，走到终点就切一刀',
    views: { s: sSnap(-1, -1, -1), last: lastSnap(null), res: resSnap() },
    vars: {},
  });
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last.get(s[i]));
    if (i === end) {
      res.push(end - start + 1);
      __rec.step({
        at: 'res.push(end - start + 1)',
        msg: `走到 ${i} 恰好是片段内所有字母的最后出现位置——可以切了：[${start}, ${end}] 长度为 ${end - start + 1}，收入结果`,
        views: { s: sSnap(i, start, end), last: lastSnap(s[i]), res: resSnap() },
        vars: { 片段: `[${start}, ${end}]` },
      });
      start = i + 1;
      end = start;
    } else {
      __rec.step({
        at: 'end = Math.max(end, last.get(s[i]))',
        msg: `读到 '${s[i]}'（它最后出现在 ${last.get(s[i])}）：片段终点至少要撑到那儿——终点更新为 ${end}`,
        views: { s: sSnap(i, start, end), last: lastSnap(s[i]), res: resSnap() },
        vars: { 片段终点: String(end) },
      });
    }
  }
  __rec.step({
    at: 'return res',
    msg: `切分完成——每段长度 [${res.join(', ')}]`,
    views: { s: sSnap(-1, -1, -1), last: lastSnap(null), res: resSnap() },
    vars: { 答案: JSON.stringify(res) },
  });
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "ababcc" → [4,2]',
    run: function () {
      const r = partitionLabels('ababcc');
      if (JSON.stringify(r) !== JSON.stringify([4, 2])) throw new Error('期望 [4,2]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: 官方长串 → [9,7,8]',
    run: function () {
      const r = partitionLabels('ababcbacadefegdehijhklij');
      if (JSON.stringify(r) !== JSON.stringify([9, 7, 8])) throw new Error('期望 [9,7,8]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 单字符 "z" → [1]',
    run: function () {
      const r = partitionLabels('z');
      if (JSON.stringify(r) !== JSON.stringify([1])) throw new Error('期望 [1]，实际 ' + JSON.stringify(r));
    },
  },
]);
