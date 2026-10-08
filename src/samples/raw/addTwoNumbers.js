// 样题「两数相加」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：逐位相加 + 进位（三链视图 + carry 变量）（Hot 100 · 链表）
function addTwoNumbers(l1, l2) {
  const chainView = (head, prefix, pointers, title) => {
    const nodes = [];
    const links = [];
    const ids = new Map();
    let i = 0;
    for (let p = head; p !== null && i < 15 && !ids.has(p); p = p.next) {
      const id = prefix + i++;
      ids.set(p, id);
      nodes.push({ id: id, value: String(p.val) });
    }
    for (const [p, id] of ids) {
      links.push([id, p.next && ids.has(p.next) ? ids.get(p.next) : null]);
    }
    const ptr = {};
    for (const [label, target] of Object.entries(pointers || {})) {
      ptr[label] = target && ids.has(target) ? ids.get(target) : null;
    }
    return { kind: 'linkedlist', nodes: nodes, next: links, pointers: ptr, title: title };
  };
  const dummy = { val: 0, next: null };
  let cur = dummy;
  let carry = 0;
  const views = () => ({
    la: chainView(l1, 'a', { p1: l1 }, 'l1（个位在头，从低到高）'),
    lb: chainView(l2, 'b', { p2: l2 }, 'l2（个位在头，从低到高）'),
    out: chainView(dummy, 'r', { cur: cur }, `和（进位 carry = ${carry}）`),
  });
  __rec.step({
    at: 'let carry = 0',
    msg: '数字是倒着存的（头节点是个位）。从最低位开始逐位相加：sum = a + b + carry，本位留 sum % 10，进位 = sum / 10 向下取整，传给下一位',
    views: views(),
    vars: { carry: '0' },
  });
  while (l1 !== null || l2 !== null || carry !== 0) {
    const a = l1 !== null ? l1.val : 0;
    const b = l2 !== null ? l2.val : 0;
    const sum = a + b + carry;
    carry = Math.floor(sum / 10);
    cur.next = { val: sum % 10, next: null };
    cur = cur.next;
    if (l1 !== null) l1 = l1.next;
    if (l2 !== null) l2 = l2.next;
    __rec.step({
      at: 'if (l2 !== null) l2 = l2.next',
      msg: `${a} + ${b} + 进位${sum - a - b} = ${sum} → 本位记 ${sum % 10}，进位 ${carry}`,
      views: views(),
      vars: { 本位: String(sum % 10), carry: String(carry) },
    });
  }
  __rec.step({
    at: 'return dummy.next',
    msg: `两链都走完且进位为 0 —— 和链表构造完成（头节点仍是个位）`,
    views: views(),
    vars: { 答案: '和链表' },
  });
  return dummy.next;
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
function dump(node) {
  const out = [];
  let guard = 0;
  while (node !== null && guard++ < 30) {
    out.push(node.val);
    node = node.next;
  }
  return out.join('→');
}
__rec.tests([
  {
    label: '示例: (2→4→3) + (5→6→4) = 342+465 = 807',
    run: function () {
      const r = addTwoNumbers(build([2, 4, 3]), build([5, 6, 4]));
      if (dump(r) !== '7→0→8') throw new Error('期望 7→0→8，实际 ' + dump(r));
    },
  },
  {
    label: '示例: (0) + (0) = 0',
    run: function () {
      const r = addTwoNumbers(build([0]), build([0]));
      if (dump(r) !== '0') throw new Error('期望 0，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 进位链 (9→9→9→9→9→9→9) + (9→9→9→9)',
    run: function () {
      const r = addTwoNumbers(build([9, 9, 9, 9, 9, 9, 9]), build([9, 9, 9, 9]));
      if (dump(r) !== '8→9→9→9→0→0→0→1') throw new Error('期望 8→9→9→9→0→0→0→1，实际 ' + dump(r));
    },
  },
]);
