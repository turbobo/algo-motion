// 样题「字符串解码」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：双栈剥括号（数字栈 + 字符串栈）（Hot 100 · 栈）
function decodeString(s) {
  const numStack = [];
  const strStack = [];
  let cur = '';
  let num = 0;
  const sSnap = (i) => ({
    kind: 'array',
    values: s.split(''),
    pointers: i >= 0 && i < s.length ? { 当前: i } : {},
    marks: i >= 0 && i < s.length ? [{ index: i, tone: 'active' }] : [],
    title: '输入（高亮 = 当前字符）',
  });
  const numSnap = () => ({
    kind: 'stack',
    items: numStack.map((v) => String(v)),
    marks: numStack.length > 0 ? [{ index: numStack.length - 1, tone: 'warn' }] : [],
    title: '数字栈（重复次数）',
  });
  const strSnap = () => ({
    kind: 'stack',
    items: strStack.map((v) => (v === '' ? '""' : v)),
    marks: strStack.length > 0 ? [{ index: strStack.length - 1, tone: 'ok' }] : [],
    title: '字符串栈（外层已拼好的前缀）',
  });
  __rec.step({
    at: 'const numStack = [];',
    msg: '多层嵌套的 "3[a2[c]]" 靠两个栈解：遇 [ 就把"前面的数字"和"外面的字符串"分别存档，清空当前段；遇 ] 就取出存档：外层前缀 + 当前段重复 k 次',
    views: { s: sSnap(-1), nums: numSnap(), strs: strSnap() },
    vars: {},
  });
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    } else if (ch === '[') {
      numStack.push(num);
      strStack.push(cur);
      __rec.step({
        at: 'strStack.push(cur)',
        msg: `遇到 '['：把重复次数 ${num} 和已拼好的前缀 "${cur}" 分别压栈（稍后拼回），然后清空当前段，开始解析括号里面`,
        views: { s: sSnap(i), nums: numSnap(), strs: strSnap() },
        vars: { 重复次数: String(num) },
      });
      num = 0;
      cur = '';
    } else if (ch === ']') {
      const k = numStack.pop();
      const prev = strStack.pop();
      cur = prev + cur.repeat(k);
      __rec.step({
        at: 'cur = prev + cur.repeat(k)',
        msg: `遇到 ']'：取回存档——外层前缀 "${prev}" + 括号内那段重复 ${k} 次，拼成 "${cur}"`,
        views: { s: sSnap(i), nums: numSnap(), strs: strSnap() },
        vars: { 重复: String(k) },
      });
    } else {
      cur += ch;
    }
  }
  __rec.step({
    at: 'return cur',
    msg: `扫描结束——完整的解码结果 "${cur}"`,
    views: { s: sSnap(-1), nums: numSnap(), strs: strSnap() },
    vars: { 答案: cur },
  });
  return cur;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "3[a2[c]]" → "accaccacc"',
    run: function () {
      const r = decodeString('3[a2[c]]');
      if (r !== 'accaccacc') throw new Error('期望 accaccacc，实际 ' + r);
    },
  },
  {
    label: '示例: "abc3[cd]xyz" → "abccdcdcdxyz"',
    run: function () {
      const r = decodeString('abc3[cd]xyz');
      if (r !== 'abccdcdcdxyz') throw new Error('期望 abccdcdcdxyz，实际 ' + r);
    },
  },
  {
    label: '边界: "10[z]" → 10 个 z',
    run: function () {
      const r = decodeString('10[z]');
      if (r !== 'zzzzzzzzzz') throw new Error('期望 10 个 z，实际 ' + r);
    },
  },
]);
