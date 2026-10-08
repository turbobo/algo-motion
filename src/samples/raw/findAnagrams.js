// 样题「找到字符串中所有字母异位词」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：定长滑动窗口 + 区间色带 + 双哈希表计数对比（Hot 100 · 滑动窗口）
function findAnagrams(s, p) {
  const need = new Map();
  for (const ch of p) need.set(ch, (need.get(ch) || 0) + 1);
  const sSnap = (left, marks, tone) => {
    const inWin = left + p.length <= s.length;
    return {
      kind: 'array',
      values: s.split(''),
      pointers: inWin ? { left: left } : {},
      ranges: inWin
        ? [{ from: left, to: left + p.length - 1, label: `"${s.slice(left, left + p.length)}"`, tone: tone || 'warn' }]
        : [],
      marks: marks || [],
      title: `s = "${s}"`,
    };
  };
  const needSnap = () => ({
    kind: 'hashmap',
    entries: [...need.entries()].map(([k, v]) => [k, String(v)]),
    title: `need：p = "${p}" 的字符计数`,
  });
  const res = [];
  __rec.step({
    at: 'const need = new Map()',
    msg: `先在 s 里找 p = "${p}" 的所有异位词起点。异位词窗口长度固定 = p 的长度，所以用"定长窗口"从左往右滑，逐窗对比字符计数`,
    views: { s: sSnap(0, []), need: needSnap() },
    vars: { 目标长度: String(p.length) },
  });
  for (let left = 0; left + p.length <= s.length; left++) {
    const win = new Map();
    for (let i = left; i < left + p.length; i++) {
      const ch = s[i];
      win.set(ch, (win.get(ch) || 0) + 1);
    }
    let ok = win.size === need.size;
    for (const [ch, cnt] of need) {
      if ((win.get(ch) || 0) !== cnt) {
        ok = false;
        break;
      }
    }
    const winSnap = {
      kind: 'hashmap',
      entries: [...win.entries()].map(([k, v]) => [k, String(v)]),
      highlightKeys: [...win.keys()],
      title: 'window：当前窗口的字符计数',
    };
    __rec.step({
      at: 'if (ok)',
      msg: ok
        ? `窗口 "${s.slice(left, left + p.length)}" 的计数和 "${p}" 完全一致 → 命中一个异位词！`
        : `窗口 "${s.slice(left, left + p.length)}" 的计数和 "${p}" 不一致 → 整窗右移一位`,
      views: { s: sSnap(left, [], ok ? 'ok' : 'warn'), need: needSnap(), win: winSnap },
      vars: { left: String(left), 窗口: `"${s.slice(left, left + p.length)}"`, 匹配: ok ? '✓' : '✗' },
    });
    if (ok) {
      res.push(left);
      __rec.step({
        at: 'res.push(left)',
        msg: `把起点 ${left} 记入答案：目前找到 ${res.length} 个`,
        views: { s: sSnap(left, [{ index: left, tone: 'ok' }], 'ok'), need: needSnap(), win: winSnap },
        vars: { 答案: JSON.stringify(res) },
      });
    }
  }
  __rec.step({
    at: 'return res',
    msg: `扫描完成，所有异位词的起点是 [${res.join(', ')}]`,
    views: { s: sSnap(s.length, []), need: needSnap() },
    vars: { 答案: JSON.stringify(res) },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: s="cbaebabacd", p="abc"',
    run: function () {
      const r = findAnagrams('cbaebabacd', 'abc');
      if (JSON.stringify(r) !== JSON.stringify([0, 6])) throw new Error('期望 [0,6]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: s="abab", p="ab"',
    run: function () {
      const r = findAnagrams('abab', 'ab');
      if (JSON.stringify(r) !== JSON.stringify([0, 1, 2])) throw new Error('期望 [0,1,2]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: p 比 s 长',
    run: function () {
      const r = findAnagrams('a', 'ab');
      if (r.length !== 0) throw new Error('期望 []，实际 ' + JSON.stringify(r));
    },
  },
]);
