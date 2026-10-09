// 样题「电话号码的字母组合」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：多路回溯收集组合（digits + path + res）（Hot 100 · 回溯）
function letterCombinations(digits) {
  const map = {
    '2': 'abc',
    '3': 'def',
    '4': 'ghi',
    '5': 'jkl',
    '6': 'mno',
    '7': 'pqrs',
    '8': 'tuv',
    '9': 'wxyz',
  };
  const res = [];
  let path = '';
  const digitsSnap = (idx) => ({
    kind: 'array',
    values: digits.split(''),
    pointers: idx >= 0 && idx < digits.length ? { 位置: idx } : {},
    marks: idx >= 0 && idx < digits.length ? [{ index: idx, tone: 'active' }] : [],
    title: '输入数字（高亮 = 当前处理到哪一位）',
  });
  const pathSnap = (hint) => ({
    kind: 'array',
    values: path.length > 0 ? path.split('') : ['(未选)'],
    marks: path.length > 0 ? [{ index: path.length - 1, tone: 'ok' }] : [],
    title: hint || '当前字母组合',
  });
  const resSnap = () => ({
    kind: 'array',
    values: [...res],
    title: `已收集的组合（共 ${res.length} 个）`,
  });
  if (digits.length === 0) {
    __rec.step({
      at: 'return []',
      msg: '空输入没有任何组合——直接返回 []',
      views: { digits: digitsSnap(-1), path: pathSnap(), res: resSnap() },
      vars: {},
    });
    return [];
  }
  const __stack = [];
  const backtrack = (idx) => {
    __stack.push(`backtrack(第 ${idx} 位)`);
    if (idx === digits.length) {
      res.push(path);
      __rec.step({
        at: 'res.push(path)',
        msg: `每一位都选完了——组合 "${path}" 收入结果。回到上一层，把最后一位换成下一个字母（回溯撤销）`,
        views: { digits: digitsSnap(idx - 1), path: pathSnap('刚凑满的组合'), res: resSnap() },
        vars: { 已收集: String(res.length) },
        stack: [...__stack],
      });
      __stack.pop();
      return;
    }
    for (const ch of map[digits[idx]]) {
      path += ch;
      backtrack(idx + 1);
      path = path.slice(0, -1);
    }
    __stack.pop();
  };
  __rec.step({
    at: 'const backtrack = (idx) => {',
    msg: `数字 "${digits}" 的字母组合 = 每位数字在自己的字母表里挑一个，全排一遍。第 ${digits.length} 位都选定就是一个组合——一共 ${digits.split('').map((d) => map[d].length).join(' × ')} 种`,
    views: { digits: digitsSnap(0), path: pathSnap(), res: resSnap() },
    vars: {},
    stack: ['backtrack(第 0 位)'],
  });
  backtrack(0);
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "23" → 9 个组合',
    run: function () {
      const r = letterCombinations('23');
      const want = ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'];
      if (JSON.stringify(r) !== JSON.stringify(want)) throw new Error('期望 ' + want.join(',') + '，实际 ' + r.join(','));
    },
  },
  {
    label: '示例: "2" → [a,b,c]',
    run: function () {
      const r = letterCombinations('2');
      if (JSON.stringify(r) !== JSON.stringify(['a', 'b', 'c'])) throw new Error('期望 a,b,c，实际 ' + r.join(','));
    },
  },
  {
    label: '边界: 空字符串 → []',
    run: function () {
      const r = letterCombinations('');
      if (JSON.stringify(r) !== JSON.stringify([])) throw new Error('期望 []，实际 ' + JSON.stringify(r));
    },
  },
]);
