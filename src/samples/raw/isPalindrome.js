// 样题「回文链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：双 array（链表取值 + 左右指针收拢）（Hot 100 · 链表）
function isPalindrome(head) {
  const vals = [];
  const listSnap = () => ({
    kind: 'linkedlist',
    nodes: vals.map((v, i) => ({ id: 'n' + i, value: String(v) })),
    next: vals.map((_, i) => ['n' + i, i + 1 < vals.length ? 'n' + (i + 1) : null]),
    title: '链表',
  });
  const arrSnap = (l, r, tone) => {
    const valid = l >= 0 && r >= l;
    const marks = !valid
      ? []
      : l === r
        ? [{ index: l, tone: tone || 'active' }]
        : [
            { index: l, tone: tone || 'active' },
            { index: r, tone: tone || 'active' },
          ];
    return {
      kind: 'array',
      values: [...vals],
      pointers: valid ? { l: l, r: r } : {},
      marks: marks,
      title: '链表的值序列',
    };
  };
  __rec.step({
    at: 'const vals = []',
    msg: '回文 = 正着读和反着读一样。把链表的值依次取出来（链表只能单向走，取值后就能两头向中间对碰了）',
    views: { list: listSnap(), arr: arrSnap(-1, -1, null) },
    vars: {},
  });
  for (let p = head; p !== null; p = p.next) {
    vals.push(p.val);
  }
  let l = 0;
  let r = vals.length - 1;
  while (l < r) {
    if (vals[l] !== vals[r]) {
      __rec.step({
        at: 'return false',
        msg: `vals[${l}] = ${vals[l]} ≠ vals[r] = ${vals[r]} —— 两头对不上，不是回文`,
        views: { list: listSnap(), arr: arrSnap(l, r, 'danger') },
        vars: { 答案: 'false' },
      });
      return false;
    }
    l++;
    r--;
    __rec.step({
      at: 'l++',
      msg: `vals[${l - 1}] = vals[${r + 1}] 相等 ✓，左右指针向中间收拢（${l} ↔ ${r}）`,
      views: { list: listSnap(), arr: arrSnap(l, r, 'ok') },
      vars: { l: String(l), r: String(r) },
    });
  }
  __rec.step({
    at: 'return true',
    msg: '两指针相遇或交错，所有对称位置都相等——是回文链表',
    views: { list: listSnap(), arr: arrSnap(-1, -1, null) },
    vars: { 答案: 'true' },
  });
  return true;
}

// ===== 测试用例 =====
function build(vals) {
  const dummy = { val: 0, next: null };
  let p = dummy;
  for (const v of vals) {
    p.next = { val: v, next: null };
    p = p.next;
  }
  return dummy.next;
}
__rec.tests([
  {
    label: '示例: [1,2,2,1] → true',
    run: function () {
      const r = isPalindrome(build([1, 2, 2, 1]));
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: [1,2] → false',
    run: function () {
      const r = isPalindrome(build([1, 2]));
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 单节点 [1] → true',
    run: function () {
      const r = isPalindrome(build([1]));
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
]);
