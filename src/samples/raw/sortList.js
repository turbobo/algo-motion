// 样题「排序链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：取值排序回填（array 排序结果 + linkedlist 重填）（Hot 100 · 链表）
// 说明：这是直观解法（O(n) 额外空间）；面试更优解是自底向上归并，动画实现将复杂得多
function sortList(head) {
  const chainView = (upto, pointers) => {
    const nodes = [];
    const links = [];
    const ids = new Map();
    let i = 0;
    for (let p = head; p !== null && i < 20 && !ids.has(p); p = p.next) {
      const id = 'n' + i++;
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
    return { kind: 'linkedlist', nodes: nodes, next: links, pointers: ptr, title: '链表' };
  };
  const arrView = (upto) => ({
    kind: 'array',
    values: [...vals],
    marks: upto >= 0 ? [{ index: Math.min(upto, vals.length - 1), tone: 'active' }] : [],
    title: '值序列（排序后）',
  });
  const vals = [];
  if (head === null) {
    __rec.step({
      at: 'return null',
      msg: '空链表没有可排序的内容，直接返回 null',
      views: { list: chainView(), arr: arrView(-1) },
      vars: {},
    });
    return null;
  }
  __rec.step({
    at: 'const vals = []',
    msg: '直观解法：链表本身不好随机访问，先把所有值取出来放进数组，用数组排序，再把排好序的值依次填回链表的节点里（节点的连接结构完全不用动）',
    views: { list: chainView(), arr: arrView(-1) },
    vars: {},
  });
  for (let p = head; p !== null; p = p.next) {
    vals.push(p.val);
  }
  vals.sort((a, b) => a - b);
  __rec.step({
    at: 'vals.sort((a, b) => a - b)',
    msg: `取出 ${vals.length} 个值并排好序：[${vals.join(', ')}]——接下来按顺序填回去`,
    views: { list: chainView(), arr: arrView(-1) },
    vars: { 排序后: `[${vals.join(', ')}]` },
  });
  let p = head;
  for (let i = 0; i < vals.length; i++) {
    p.val = vals[i];
    p = p.next;
    __rec.step({
      at: 'p = p.next',
      msg: `把 ${vals[i]} 填进第 ${i} 个节点（链表顺序不变，值按升序归位）`,
      views: { list: chainView(0, {}), arr: arrView(i) },
      vars: { i: String(i) },
    });
  }
  __rec.step({
    at: 'return head',
    msg: '所有值回填完成——链表在原节点结构上完成了升序排序',
    views: { list: chainView(), arr: arrView(-1) },
    vars: { 答案: '升序链表' },
  });
  return head;
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
    label: '示例: [4,2,1,3] → [1,2,3,4]',
    run: function () {
      const r = sortList(build([4, 2, 1, 3]));
      if (dump(r) !== '1→2→3→4') throw new Error('期望 1→2→3→4，实际 ' + dump(r));
    },
  },
  {
    label: '示例: [-1,5,3,4,0] → [-1,0,3,4,5]',
    run: function () {
      const r = sortList(build([-1, 5, 3, 4, 0]));
      if (dump(r) !== '-1→0→3→4→5') throw new Error('期望 -1→0→3→4→5，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 空链表',
    run: function () {
      const r = sortList(null);
      if (r !== null) throw new Error('期望 null，实际 ' + dump(r));
    },
  },
]);
