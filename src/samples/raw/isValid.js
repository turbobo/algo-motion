// 样题「有效的括号」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：栈配对（array 输入 + stack 视图）（Hot 100 · 栈）
function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  const sSnap = (idx) => ({
    kind: 'array',
    values: s.split(''),
    pointers: idx >= 0 && idx < s.length ? { 当前: idx } : {},
    marks: idx >= 0 && idx < s.length ? [{ index: idx, tone: 'active' }] : [],
    title: '输入字符串（高亮 = 当前字符）',
  });
  const stackSnap = () => ({
    kind: 'stack',
    items: [...stack],
    marks: stack.length > 0 ? [{ index: stack.length - 1, tone: 'ok' }] : [],
    title: '栈（左括号排队等配对）',
  });
  __rec.step({
    at: 'for (let i = 0; i < s.length; i++) {',
    msg: '括号合法性 = 栈的经典舞台：遇到左括号就压栈，遇到右括号就要求"栈顶正好是它的左括号"——是就弹栈继续，不是（或栈空）就立刻失败',
    views: { s: sSnap(-1), stack: stackSnap() },
    vars: {},
  });
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
      __rec.step({
        at: 'stack.push(ch)',
        msg: `'${ch}' 是左括号——压入栈，等后面的人来配对`,
        views: { s: sSnap(i), stack: stackSnap() },
        vars: { 进度: `${i + 1}/${s.length}` },
      });
    } else {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch]) {
        __rec.step({
          at: 'return false',
          msg: `右括号 '${ch}' 找不到配对的 '${pairs[ch]}'（${stack.length === 0 ? '栈已空' : '栈顶是 ' + stack[stack.length - 1]}）——非法，返回 false`,
          views: { s: sSnap(i), stack: stackSnap() },
          vars: { 当前: ch },
        });
        return false;
      }
      stack.pop();
      __rec.step({
        at: 'stack.pop()',
        msg: `'${ch}' 和栈顶 '${pairs[ch]}' 配对成功——弹掉它，继续看下一个`,
        views: { s: sSnap(i), stack: stackSnap() },
        vars: { 配对: pairs[ch] + ch },
      });
    }
  }
  __rec.step({
    at: 'return stack.length === 0',
    msg:
      stack.length === 0
        ? '扫完了，栈也正好清空——所有括号都成对闭合，合法！'
        : `扫完了但栈里还剩 ${stack.length} 个左括号没人配——非法`,
    views: { s: sSnap(-1), stack: stackSnap() },
    vars: { 答案: String(stack.length === 0) },
  });
  return stack.length === 0;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "()[]{}" → true',
    run: function () {
      const r = isValid('()[]{}');
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: "(]" → false',
    run: function () {
      const r = isValid('(]');
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: "([)]" → false（配对顺序错了）',
    run: function () {
      const r = isValid('([)]');
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
]);
