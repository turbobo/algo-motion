// 样题「环形链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：linkedlist 回头箭头表达环 + 快慢指针相遇（Hot 100 · 链表）
function hasCycle(head) {
  // 收集节点并编号（限 20 个防环死循环；回头箭头即环）
  const ids = new Map();
  let cnt = 0;
  for (let p = head; p !== null && cnt < 20 && !ids.has(p); p = p.next) {
    ids.set(p, 'n' + ++cnt);
  }
  const listSnap = (marks, pointers) => ({
    kind: 'linkedlist',
    nodes: [...ids.entries()].map(([p, id]) => ({ id: id, value: String(p.val) })),
    next: [...ids.entries()].map(([p, id]) => [id, p.next && ids.has(p.next) ? ids.get(p.next) : null]),
    marks: marks || [],
    pointers: pointers || {},
    title: '链表（回头箭头 = 环）',
  });
  let slow = head;
  let fast = head;
  __rec.step({
    at: 'let fast = head',
    msg: '检测环用快慢指针：慢指针走一步、快指针走两步。无环时快指针先到终点；有环时快指针会先绕进环里，最终必定从后面追上慢指针（相对速度 1）',
    views: { list: listSnap([], { slow: ids.get(slow) ?? null, fast: ids.get(fast) ?? null }) },
    vars: {},
  });
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    __rec.step({
      at: 'fast = fast.next.next',
      msg: `slow 走到 ${ids.get(slow) ?? '?'}，fast 走到 ${ids.get(fast) ?? '?'}${slow === fast ? ' —— 相遇了！' : '，还没追上，继续'}`,
      views: {
        list: listSnap(
          slow === fast && ids.has(slow) ? [{ id: ids.get(slow), tone: 'ok' }] : [],
          { slow: ids.get(slow) ?? null, fast: ids.get(fast) ?? null },
        ),
      },
      vars: { slow: slow === null ? 'null' : String(slow.val), fast: fast === null ? 'null' : String(fast.val) },
    });
    if (slow === fast) {
      return true;
    }
  }
  __rec.step({
    at: 'return false',
    msg: 'fast 走到了链尾（或尾节点的下一个为空）——说明指针们一路都没追上，链表无环',
    views: { list: listSnap([], {}) },
    vars: { 答案: 'false' },
  });
  return false;
}

// ===== 测试用例 =====
function makeCycle(vals, pos) {
  const nodes = vals.map((v) => ({ val: v, next: null }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos];
  return nodes[0];
}
__rec.tests([
  {
    label: '示例: [3,2,0,-4] 尾部回指第 1 位 → 有环',
    run: function () {
      const r = hasCycle(makeCycle([3, 2, 0, -4], 1));
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: [1,2] 无环',
    run: function () {
      const r = hasCycle(makeCycle([1, 2], -1));
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 空链表',
    run: function () {
      const r = hasCycle(null);
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
]);
