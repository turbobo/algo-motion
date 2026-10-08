// 样题「分割回文串」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：切分点回溯 + 回文判断（s 区间 + path + res）（Hot 100 · 回溯）
function partition(s) {
  const res = [];
  const path = [];
  const sSnap = (from, to) => ({
    kind: 'array',
    values: s.split(''),
    ranges: from <= to ? [{ from: from, to: to, label: '本段', tone: 'warn' }] : [],
    marks: from <= to ? [{ index: from, tone: 'active' }] : [],
    title: '字符串 s（色带 = 正在切出的片段）',
  });
  const pathSnap = () => ({
    kind: 'array',
    values: path.length > 0 ? [...path] : ['(未切)'],
    title: '已切出的片段',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((r) => r.join('|')),
    title: `已收集的切法（共 ${res.length} 种）`,
  });
  const isPal = (l, r) => {
    while (l < r) {
      if (s[l] !== s[r]) {
        return false;
      }
      l++;
      r--;
    }
    return true;
  };
  const backtrack = (start) => {
    if (start === s.length) {
      res.push([...path]);
      __rec.step({
        at: 'res.push([...path])',
        msg: `切到了末尾——[${path.join(' | ')}] 每一段都是回文，是一种合法切法`,
        views: { s: sSnap(start, start - 1), path: pathSnap(), res: resSnap() },
        vars: { 已收集: String(res.length) },
      });
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) {
        continue;
      }
      path.push(s.slice(start, end + 1));
      __rec.step({
        at: 'path.push(s.slice(start, end + 1))',
        msg: `从位置 ${start} 试到 ${end}：片段 "${s.slice(start, end + 1)}" 是回文 ✓，先切下它，再从 ${end + 1} 继续切后面的部分——切错了回溯再换切点`,
        views: { s: sSnap(start, end), path: pathSnap(), res: resSnap() },
        vars: { 片段: s.slice(start, end + 1) },
      });
      backtrack(end + 1);
      path.pop();
    }
  };
  __rec.step({
    at: 'const backtrack = (start) => {',
    msg: `把 "${s}" 切成若干段，要求每段都是回文。回溯的切法：从 start 开始枚举切点 end，[start..end] 是回文才切，否则往后试`,
    views: { s: sSnap(0, -1), path: pathSnap(), res: resSnap() },
    vars: {},
  });
  backtrack(0);
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "aab" → [[a,a,b],[aa,b]]',
    run: function () {
      const r = partition('aab');
      if (JSON.stringify(r) !== JSON.stringify([['a', 'a', 'b'], ['aa', 'b']])) {
        throw new Error('期望 [[a,a,b],[aa,b]]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '示例: "a" → [[a]]',
    run: function () {
      const r = partition('a');
      if (JSON.stringify(r) !== JSON.stringify([['a']])) throw new Error('期望 [[a]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: "aba" → [[a,b,a],[aba]]',
    run: function () {
      const r = partition('aba');
      if (JSON.stringify(r) !== JSON.stringify([['a', 'b', 'a'], ['aba']])) {
        throw new Error('期望 [[a,b,a],[aba]]，实际 ' + JSON.stringify(r));
      }
    },
  },
]);
