// 样题「最小覆盖子串」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：可变滑动窗口 + 达标计数 + 区间色带伸缩（Hot 100 · 子串）
function minWindow(s, t) {
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  const sSnap = (l, r, tone) => ({
    kind: 'array',
    values: s.split(''),
    pointers: r >= 0 ? { left: l, right: r } : {},
    ranges: r >= l ? [{ from: l, to: r, label: r - l + 1, tone: tone || 'warn' }] : [],
    title: `s = "${s}"`,
  });
  const needSnap = (hi) => ({
    kind: 'hashmap',
    entries: [...need.entries()].map(([key, v]) => [key, String(v)]),
    highlightKeys: hi ? [hi] : [],
    title: `need：t = "${t}" 的需求计数`,
  });
  const winSnap = () => ({
    kind: 'hashmap',
    entries: [...win.entries()].map(([key, v]) => [key, String(v)]),
    title: 'window：窗口内计数',
  });
  const win = new Map();
  let valid = 0;
  let left = 0;
  let start = 0;
  let len = Infinity;
  __rec.step({
    at: 'const win = new Map()',
    msg: `在 s 里找最短的、包含 t = "${t}" 全部字符（按个数）的窗口。右边 right 负责扩张收集字符；一旦窗口凑齐，左边 left 就收缩挤水分——两边都只前进不后退，总复杂度 O(n)`,
    views: { s: sSnap(0, -1), need: needSnap(), window: winSnap() },
    vars: { 需求种类: String(need.size) },
  });
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need.has(ch)) {
      win.set(ch, (win.get(ch) || 0) + 1);
      if (win.get(ch) === need.get(ch)) {
        valid++;
        __rec.step({
          at: 'valid++',
          msg: `扩入 '${ch}'：窗口内它有 ${win.get(ch)} 个，刚好达到需求的 ${need.get(ch)} 个 → 达标字符种类 ${valid}/${need.size}`,
          views: { s: sSnap(left, right), need: needSnap(ch), window: winSnap() },
          vars: { valid: `${valid}/${need.size}`, 当前窗口: `[${left}, ${right}]` },
        });
      }
    }
    while (valid === need.size) {
      if (right - left + 1 < len) {
        start = left;
        len = right - left + 1;
        __rec.step({
          at: 'start = left',
          msg: `窗口 [${left}, ${right}] 已经覆盖全部需求，长度 ${right - left + 1} 破了纪录 → 记住起点 ${left} 和长度`,
          views: { s: sSnap(left, right, 'ok'), need: needSnap(), window: winSnap() },
          vars: { 当前最优: `长度 ${right - left + 1}`, valid: `${valid}/${need.size}` },
        });
      }
      const out = s[left];
      if (need.has(out)) {
        if (win.get(out) === need.get(out)) {
          valid--;
        }
        win.set(out, win.get(out) - 1);
      }
      left++;
      __rec.step({
        at: 'left++',
        msg: `收缩：从左边移出 '${out}'${need.has(out) ? `（窗口内剩 ${win.get(out)} / 需要 ${need.get(out)}）` : '（不是需求字符，随意丢掉）'}；左边界推进到 ${left}${valid < need.size ? `，达标数掉回 ${valid} → 窗口失效，重新扩张` : ''}`,
        views: { s: sSnap(Math.min(left, s.length - 1), right), need: needSnap(), window: winSnap() },
        vars: { valid: `${valid}/${need.size}`, 当前最优: len === Infinity ? '（还没找到）' : `长度 ${len}`, 左边界: String(left) },
      });
    }
  }
  __rec.step({
    at: 'return len === Infinity',
    msg: len === Infinity ? `扫描结束也没凑齐 "${t}"，返回空串` : `扫描完成，最短覆盖窗口是 "${s.slice(start, start + len)}"（长度 ${len}）`,
    views: { s: sSnap(start, len === Infinity ? -1 : start + len - 1, 'ok'), need: needSnap(), window: winSnap() },
    vars: { 答案: len === Infinity ? '""' : `"${s.slice(start, start + len)}"` },
  });
  return len === Infinity ? '' : s.slice(start, start + len);
}
__rec.tests([
  {
    label: '示例: s="ADOBECODEBANC", t="ABC"',
    run: function () {
      const r = minWindow('ADOBECODEBANC', 'ABC');
      if (r !== 'BANC') throw new Error('期望 "BANC"，实际 "' + r + '"');
    },
  },
  {
    label: '示例: s="a", t="a"',
    run: function () {
      const r = minWindow('a', 'a');
      if (r !== 'a') throw new Error('期望 "a"，实际 "' + r + '"');
    },
  },
  {
    label: '边界: 覆盖不了 s="a", t="aa"',
    run: function () {
      const r = minWindow('a', 'aa');
      if (r !== '') throw new Error('期望 ""，实际 "' + r + '"');
    },
  },
]);
