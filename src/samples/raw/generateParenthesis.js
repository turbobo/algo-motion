// 样题「括号生成」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：合法性剪枝回溯（path + res + 配余额）（Hot 100 · 回溯）
function generateParenthesis(n) {
  const res = [];
  let path = '';
  const pathSnap = () => ({
    kind: 'array',
    values: path.length > 0 ? path.split('') : ['(未选)'],
    marks: path.length > 0 ? [{ index: path.length - 1, tone: 'ok' }] : [],
    title: '当前括号串',
  });
  const resSnap = () => ({
    kind: 'array',
    values: [...res],
    title: `已收集的合法组合（共 ${res.length} 个）`,
  });
  const __stack = [];
  const backtrack = (open, close) => {
    __stack.push(`backtrack(左${open}/右${close})`);
    if (path.length === n * 2) {
      res.push(path);
      __rec.step({
        at: 'res.push(path)',
        msg: `"${path}" 全 ${n * 2} 位放完——因为每一步都保证了"左括号数 ≥ 右括号数"，所以只要放满长度，必然是合法的`,
        views: { path: pathSnap(), res: resSnap() },
        vars: { 已收集: String(res.length) },
        stack: [...__stack],
      });
      __stack.pop();
      return;
    }
    if (open < n) {
      path += '(';
      backtrack(open + 1, close);
      path = path.slice(0, -1);
    }
    if (close < open) {
      path += ')';
      backtrack(open, close + 1);
      path = path.slice(0, -1);
    }
    __stack.pop();
  };
  __rec.step({
    at: 'const backtrack = (open, close) => {',
    msg: `${n} 对括号的合法组合 = 边放边守两条规则：① 左括号最多用 ${n} 个；② 右括号数不能超过左括号数（否则出现没法配对的 ")"）。开局先画好这两条红线，回溯时只在红线上选`,
    views: { path: pathSnap(), res: resSnap() },
    vars: { 剩余左: String(n), 剩余右: String(n) },
    stack: ['backtrack(左0/右0)'],
  });
  backtrack(0, 0);
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: n=3 → 5 个组合',
    run: function () {
      const r = generateParenthesis(3);
      const want = ['((()))', '(()())', '(())()', '()(())', '()()()'];
      if (JSON.stringify(r) !== JSON.stringify(want)) throw new Error('期望 5 个，实际 ' + r.join(','));
    },
  },
  {
    label: '示例: n=1 → [()]',
    run: function () {
      const r = generateParenthesis(1);
      if (JSON.stringify(r) !== JSON.stringify(['()'])) throw new Error('期望 [()]，实际 ' + r.join(','));
    },
  },
  {
    label: '边界: n=2 → 2 个',
    run: function () {
      const r = generateParenthesis(2);
      if (JSON.stringify(r) !== JSON.stringify(['(())', '()()'])) throw new Error('期望 (()),()() ，实际 ' + r.join(','));
    },
  },
]);
