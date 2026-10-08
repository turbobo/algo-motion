// 样题「最长有效括号」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：栈底哨兵 + 下标差（array 字符 + stack 下标）（Hot 100 · 栈 / 动态规划）
function longestValidParentheses(s) {
  const stack = [-1];
  let best = 0;
  const n = s.length;
  const sSnap = (i) => {
    const pointers = {};
    if (i >= 0 && i < n) pointers.当前 = i;
    return {
      kind: 'array',
      values: s.split(''),
      pointers: pointers,
      marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
      title: '输入串',
    };
  };
  const stackSnap = () => ({
    kind: 'stack',
    items: stack.map((k) => (k === -1 ? '哨兵 -1' : `${k} '${s[k]}'`)),
    marks: stack.length > 0 ? [{ index: stack.length - 1, tone: 'ok' }] : [],
    title: '栈（存“还没配对的左括号下标”；栈底哨兵标记上一段断点）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: [`最长 ${best}`],
    title: '当前最长有效括号长度',
  });
  __rec.step({
    at: 'const stack = [-1]',
    msg: '一个经典技巧：栈里存"还没配对的左括号下标"，并在**栈底放一个哨兵 -1**（表示"上一段的断点"）。遇到 "(" 压下标；遇到 ")" 弹一个——弹完如果栈空说明多的右括号，把当前下标当新哨兵压进去；否则 i - 栈顶 就是当前有效长度',
    views: { s: sSnap(-1), stack: stackSnap(), res: resSnap() },
    vars: { 最长: String(best) },
  });
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);
      } else {
        best = Math.max(best, i - stack[stack.length - 1]);
      }
    }
    __rec.step({
      at: 'for (let i = 0; i < s.length; i++) {',
      msg:
        s[i] === '('
          ? `读到 '('：压入它的下标 ${i}，等一个 ')' 来配对`
          : stack[stack.length - 1] === i
            ? `读到 ')'：没有左括号可配——把 ${i} 作为新哨兵（上一段到此为止）`
            : `读到 ')'：弹栈配对成功！当前有效长度 = ${i} − ${stack[stack.length - 1]} = ${i - stack[stack.length - 1]}，最长更新为 ${best}`,
      views: { s: sSnap(i), stack: stackSnap(), res: resSnap() },
      vars: { 最长: String(best) },
    });
  }
  __rec.step({
    at: 'return best',
    msg: `扫完了——最长有效括号长度是 ${best}`,
    views: { s: sSnap(-1), stack: stackSnap(), res: resSnap() },
    vars: { 答案: String(best) },
  });
  return best;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "(()" → 2',
    run: function () {
      const r = longestValidParentheses('(()');
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '示例: ")()())" → 4',
    run: function () {
      const r = longestValidParentheses(')()())');
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '边界: 空串 → 0',
    run: function () {
      const r = longestValidParentheses('');
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
