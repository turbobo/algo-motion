// 样题「两两交换链表中的节点」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：哑结点 + 三指针重接（单链视图 + 指针标注）（Hot 100 · 链表）
function swapPairs(head) {
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
  let prev = dummy;
  __rec.step({
    at: 'let prev = dummy',
    msg: '两两交换相邻节点。用 prev 指向「已处理部分的尾巴」，每轮盯住它后面的一对：first 和 second，然后三步重接：first.next 跳过 second、second.next 指向 first、prev.next 改指 second',
    views: { list: chainView({ prev: prev }) },
    vars: {},
  });
  while (prev.next !== null && prev.next.next !== null) {
    const first = prev.next;
    const second = first.next;
    __rec.step({
      at: 'const second = first.next',
      msg: `本轮要交换的一对：first = ${first.val}，second = ${second.val}`,
      views: { list: chainView({ prev: prev, first: first, second: second }) },
      vars: { first: String(first.val), second: String(second.val) },
    });
    first.next = second.next;
    second.next = first;
    prev.next = second;
    prev = first;
    __rec.step({
      at: 'prev = first',
      msg: `交换完成：${second.val} → ${first.val}，prev 前进到 ${first.val}（这对的尾巴），准备处理下一对`,
      views: { list: chainView({ prev: prev }) },
      vars: { 已交换: `${second.val} ↔ ${first.val}` },
    });
  }
  __rec.step({
    at: 'return dummy.next',
    msg: '剩余不足两个节点，无法再交换——返回 dummy.next',
    views: { list: chainView({}) },
    vars: { 答案: '两两交换后的链表' },
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
    label: '示例: [1,2,3,4] → [2,1,4,3]',
    run: function () {
      const r = swapPairs(build([1, 2, 3, 4]));
      if (dump(r) !== '2→1→4→3') throw new Error('期望 2→1→4→3，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 奇数个 [1,2,3] → [2,1,3]',
    run: function () {
      const r = swapPairs(build([1, 2, 3]));
      if (dump(r) !== '2→1→3') throw new Error('期望 2→1→3，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 单节点 [1] → [1]',
    run: function () {
      const r = swapPairs(build([1]));
      if (dump(r) !== '1') throw new Error('期望 1，实际 ' + dump(r));
    },
  },
]);
