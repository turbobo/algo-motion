// 样题「无重复字符的最长子串」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：滑动窗口（array 区间色带 + 双指针）+ hashmap（最近出现位置）
function lengthOfLongestSubstring(s) {
  const chars = s.split('');
  const last = new Map();
  const sSnap = (left, right, marks, tone) => ({
    kind: 'array',
    values: [...chars],
    pointers: right >= 0 ? { left: left, right: right } : { left: left },
    ranges: right >= left ? [{ from: left, to: right, label: `窗口 ${right - left + 1}`, tone: tone || 'ok' }] : [],
    marks: marks || [],
    title: `s = "${s}"`,
  });
  const lastSnap = (hi) => ({
    kind: 'hashmap',
    entries: [...last.entries()].map(([k, v]) => [k, String(v)]),
    highlightKeys: hi ? [hi] : [],
    title: 'last：字符 → 最近出现的下标',
  });
  let left = 0;
  let best = 0;
  __rec.step({
    at: 'let best = 0',
    msg: `找 "${s}" 里不含重复字符的最长子串。用滑动窗口：right 负责向右扩张，一旦窗口里混进重复字符，left 就跳到该字符上一次出现位置的右边`,
    views: { s: sSnap(0, -1, []), last: lastSnap() },
    vars: { left: '0', best: '0' },
  });
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (last.has(c) && last.get(c) >= left) {
      left = last.get(c) + 1;
      __rec.step({
        at: 'left = last.get(c) + 1',
        msg: `'${c}' 在窗口里出现过了（上次在第 ${last.get(c)} 位）→ 左边界直接跳到它后面：left = ${left}`,
        views: {
          s: sSnap(left, right, [{ index: right, tone: 'warn' }], 'warn'),
          last: lastSnap(c),
        },
        vars: { left: String(left), right: String(right), best: String(best) },
      });
    }
    last.set(c, right);
    __rec.step({
      at: 'last.set(c, right)',
      msg: `把 '${c}' 的最新位置记为 ${right}（下次再遇到它，左边界就知道该跳到哪里）`,
      views: { s: sSnap(left, right, [{ index: right, tone: 'active' }]), last: lastSnap(c) },
      vars: { left: String(left), right: String(right), best: String(best) },
    });
    best = Math.max(best, right - left + 1);
    __rec.step({
      at: 'best = Math.max(best, right - left + 1)',
      msg: `当前窗口 [${left}, ${right}] 长度 ${right - left + 1} —— 历史最长记录 best = ${best}`,
      views: {
        s: sSnap(left, right, [{ index: right, tone: 'ok' }]),
        last: lastSnap(),
      },
      vars: { left: String(left), right: String(right), best: String(best) },
    });
  }
  __rec.step({
    at: 'return best',
    msg: `扫描结束，最长无重复子串的长度就是 ${best}`,
    views: { s: sSnap(0, -1, []), last: lastSnap() },
    vars: { 答案: String(best) },
  });
  return best;
}
__rec.tests([
  {
    label: '示例: "abcabcbb"',
    run: function () {
      const r = lengthOfLongestSubstring('abcabcbb');
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '全部相同: "bbbbb"',
    run: function () {
      const r = lengthOfLongestSubstring('bbbbb');
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '边界: 空串',
    run: function () {
      const r = lengthOfLongestSubstring('');
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
