// 样题「合并两个有序链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：哑结点 + 三链视图（两个输入 + 结果）（Hot 100 · 链表）
function mergeTwoLists(list1, list2) {
  // 通用链视图：每次快照实时收集（链在合并过程中不断变化）
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
  const views = () => ({
    l1: chainView(list1, 'a', { p1: list1 }, 'list1（剩余部分）'),
    l2: chainView(list2, 'b', { p2: list2 }, 'list2（剩余部分）'),
    out: chainView(dummy, 'r', { cur: cur }, '结果链（从哑结点 dummy(0) 起步，结束取 next）'),
  });
  __rec.step({
    at: 'let cur = dummy',
    msg: '两条链已经有序。用一个「哑结点」dummy 当结果链的假头部，避免处理"第一个节点"的特例；cur 始终指向结果链尾部。每轮比较两链的头：谁小就把谁的节点接过来',
    views: views(),
    vars: {},
  });
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      cur.next = list1;
      list1 = list1.next;
    } else {
      cur.next = list2;
      list2 = list2.next;
    }
    cur = cur.next;
    __rec.step({
      at: 'cur = cur.next',
      msg: `刚才接走的是更小的那个节点，cur 前进到队尾；现在比较 ${list1 === null ? 'null' : list1.val} 和 ${list2 === null ? 'null' : list2.val}`,
      views: views(),
      vars: { 结果链尾: String(cur.val) },
    });
  }
  cur.next = list1 !== null ? list1 : list2;
  __rec.step({
    at: 'cur.next = list1 !== null ? list1 : list2',
    msg: `一条链先走完了 —— 另一条剩下的部分整体已经不乱了，直接整段接到结果链尾部`,
    views: views(),
    vars: {},
  });
  __rec.step({
    at: 'return dummy.next',
    msg: '合并完成！返回 dummy.next（真头部，避开哑结点）',
    views: views(),
    vars: { 答案: '合并后的有序链' },
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
    label: '示例: [1,2,4] + [1,3,4]',
    run: function () {
      const r = mergeTwoLists(build([1, 2, 4]), build([1, 3, 4]));
      if (dump(r) !== '1→1→2→3→4→4') throw new Error('期望 1→1→2→3→4→4，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 有一条为空',
    run: function () {
      const r = mergeTwoLists(null, build([0]));
      if (dump(r) !== '0') throw new Error('期望 0，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 都为空',
    run: function () {
      const r = mergeTwoLists(null, null);
      if (r !== null) throw new Error('期望 null，实际 ' + dump(r));
    },
  },
]);
