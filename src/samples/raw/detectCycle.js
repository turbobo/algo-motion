// 样题「环形链表 II」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：两次相遇定位环入口（Hot 100 · 链表）
function detectCycle(head) {
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
    msg: '先跑快慢指针找「相遇点」——但相遇点不等于环入口。数学结论：从链表头到环入口的距离 = 从相遇点继续走到环入口的距离，所以下一阶段让一个指针回到头部同速前进，二次相遇处就是入口',
    views: { list: listSnap([], { slow: ids.get(slow) ?? null, fast: ids.get(fast) ?? null }) },
    vars: {},
  });
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    const met = slow === fast
    if (met) {
      break
    }
  }
  if (fast === null || fast.next === null) {
    __rec.step({
      at: 'return null',
      msg: 'fast 走到了链尾——链表无环，直接返回 null',
      views: { list: listSnap([], {}) },
      vars: { 答案: 'null' },
    });
    return null;
  }
  __rec.step({
    at: 'while (slow !== fast)',
    msg: `快慢指针在 ${ids.get(slow) ?? '?'}（值 ${slow.val}）相遇。现在把 slow 拉回链表头、fast 留在相遇点，两者同速前进，再次相遇的地方就是环入口`,
    views: {
      list: listSnap([{ id: ids.get(slow), tone: 'warn' }], { slow: ids.get(slow) ?? null, fast: ids.get(fast) ?? null }),
    },
    vars: { 相遇于: String(slow.val) },
  })
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
    __rec.step({
      at: 'fast = fast.next',
      msg: `同速前进：slow 走到 ${ids.get(slow) ?? '?'}，fast 走到 ${ids.get(fast) ?? '?'}${slow === fast ? ' —— 二次相遇！' : ''}`,
      views: {
        list: listSnap([], { slow: ids.get(slow) ?? null, fast: ids.get(fast) ?? null }),
      },
      vars: { slow: String(slow.val), fast: String(fast.val) },
    });
  }
  __rec.step({
    at: 'return slow',
    msg: `二次相遇点在 ${ids.get(slow)}（值 ${slow.val}）——这就是环的入口，返回它`,
    views: { list: listSnap([{ id: ids.get(slow), tone: 'ok' }], { slow: ids.get(slow) ?? null, fast: ids.get(fast) ?? null }) },
    vars: { 答案: String(slow.val) },
  });
  return slow;
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
    label: '示例: [3,2,0,-4] 回指下标 1 → 入口值 2',
    run: function () {
      const r = detectCycle(makeCycle([3, 2, 0, -4], 1));
      if (!r || r.val !== 2) throw new Error('期望入口值 2，实际 ' + (r ? r.val : 'null'));
    },
  },
  {
    label: '示例: [1,2] 回指下标 0 → 入口值 1',
    run: function () {
      const r = detectCycle(makeCycle([1, 2], 0));
      if (!r || r.val !== 1) throw new Error('期望入口值 1，实际 ' + (r ? r.val : 'null'));
    },
  },
  {
    label: '边界: 无环 [1] → null',
    run: function () {
      const r = detectCycle(makeCycle([1], -1));
      if (r !== null) throw new Error('期望 null，实际 ' + (r ? r.val : 'null'));
    },
  },
]);
