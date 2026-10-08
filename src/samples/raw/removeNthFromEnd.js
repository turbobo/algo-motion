// 样题「删除链表的倒数第 N 个结点」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：快慢指针保持 N+1 间距（单链视图 + 双指针）（Hot 100 · 链表）
function removeNthFromEnd(head, n) {
  const chainView = (pointers) => {
    const nodes = [];
    const links = [];
    const ids = new Map();
    let i = 0;
    for (let p = dummy; p !== null && i < 15 && !ids.has(p); p = p.next) {
      const id = 'n' + i++;
      ids.set(p, id);
      nodes.push({ id: id, value: p === dummy ? '哑' : String(p.val) });
    }
    for (const [p, id] of ids) {
      links.push([id, p.next && ids.has(p.next) ? ids.get(p.next) : null]);
    }
    const ptr = {};
    for (const [label, target] of Object.entries(pointers || {})) {
      ptr[label] = target && ids.has(target) ? ids.get(target) : null;
    }
    return { kind: 'linkedlist', nodes: nodes, next: links, pointers: ptr, title: '链表（含哑结点）' };
  };
  const dummy = { val: 0, next: head };
  let fast = dummy;
  let slow = dummy;
  __rec.step({
    at: 'let slow = dummy',
    msg: `删倒数第 ${n} 个，但链表数不到头。技巧：让 fast 先走 ${n + 1} 步，slow 再出发——两者之间隔着 ${n + 1} 个身位（含哑结点），当 fast 走到 null 时，slow 恰好停在「倒数第 ${n} 个」的前一个位置`,
    views: { list: chainView({ fast: fast, slow: slow }) },
    vars: { n: String(n) },
  });
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }
  __rec.step({
    at: 'for (let i = 0; i <= n; i++)',
    msg: `fast 已先走 ${n + 1} 步，停在值 ${fast === null ? 'null' : fast.val}；现在 slow 从哑结点出发，两指针同速前进`,
    views: { list: chainView({ fast: fast, slow: slow }) },
    vars: { n: String(n) },
  });
  while (fast !== null) {
    fast = fast.next;
    slow = slow.next;
    __rec.step({
      at: 'slow = slow.next',
      msg: `fast 走到 ${fast === null ? 'null' : fast.val}，slow 走到 ${slow.val} —— 保持 ${n + 1} 个身位同步前进`,
      views: { list: chainView({ fast: fast, slow: slow }) },
      vars: {},
    });
  }
  const removed = slow.next;
  slow.next = slow.next.next;
  __rec.step({
    at: 'slow.next = slow.next.next',
    msg: `fast 到尽头了！slow 正好停在倒数第 ${n} 个的前一个（值 ${slow.val}）——把它的 next 跳过被删节点（值 ${removed.val}）`,
    views: { list: chainView({ slow: slow }) },
    vars: { 被删: String(removed.val) },
  });
  __rec.step({
    at: 'return dummy.next',
    msg: '返回 dummy.next（哑结点是为了兼容"删头节点"的场景）',
    views: { list: chainView({}) },
    vars: { 答案: '处理后的链表' },
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
    label: '示例: [1,2,3,4,5] 删倒数第 2 → [1,2,3,5]',
    run: function () {
      const r = removeNthFromEnd(build([1, 2, 3, 4, 5]), 2);
      if (dump(r) !== '1→2→3→5') throw new Error('期望 1→2→3→5，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 删头节点 [1] n=1 → null',
    run: function () {
      const r = removeNthFromEnd(build([1]), 1);
      if (r !== null) throw new Error('期望 null，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 删尾节点 [1,2] n=1 → [1]',
    run: function () {
      const r = removeNthFromEnd(build([1, 2]), 1);
      if (dump(r) !== '1') throw new Error('期望 1，实际 ' + dump(r));
    },
  },
]);
