// 样题「K 个一组翻转链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：分段反转 + 组间重接（单链视图 + 组指针）（Hot 100 · 链表）
function reverseKGroup(head, k) {
  const chainView = (pointers) => {
    const nodes = [];
    const links = [];
    const ids = new Map();
    let i = 0;
    for (let p = dummy; p !== null && i < 20 && !ids.has(p); p = p.next) {
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
  let groupPrev = dummy;
  __rec.step({
    at: 'let groupPrev = dummy',
    msg: `每 ${k} 个节点一组做局部反转。流程：先探路数出 ${k} 个节点（不够就停），然后把这一组内部反转、把组头和组尾与前后正确接上，groupPrev 移向下一组`,
    views: { list: chainView({ groupPrev: groupPrev }) },
    vars: { k: String(k) },
  });
  while (true) {
    let kth = groupPrev;
    for (let i = 0; i < k && kth !== null; i++) {
      kth = kth.next;
    }
    if (kth === null) {
      break;
    }
    __rec.step({
      at: 'if (kth === null)',
      msg: `探路成功：从 ${groupPrev === dummy ? '哑结点' : groupPrev.val} 往后数满 ${k} 个，kth 停在值 ${kth.val}——这一组可以翻转`,
      views: { list: chainView({ groupPrev: groupPrev, kth: kth }) },
      vars: { k: String(k) },
    });
    const groupNext = kth.next;
    let prev = groupNext;
    let cur = groupPrev.next;
    for (let i = 0; i < k; i++) {
      const next = cur.next;
      cur.next = prev;
      prev = cur;
      cur = next;
    }
    const newGroupTail = groupPrev.next;
    groupPrev.next = prev;
    groupPrev = newGroupTail;
    __rec.step({
      at: 'groupPrev = newGroupTail',
      msg: `本组翻转完成并接回主干（组尾的新 next 指向组外的 ${groupNext === null ? 'null' : groupNext.val}）；groupPrev 移到本组尾巴，准备下一组`,
      views: { list: chainView({ groupPrev: groupPrev }) },
      vars: { k: String(k) },
    });
  }
  __rec.step({
    at: 'return dummy.next',
    msg: `剩下的不足 ${k} 个节点，保持原序——全部处理完毕，返回 dummy.next`,
    views: { list: chainView({}) },
    vars: { 答案: 'K 组翻转后的链表' },
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
    label: '示例: [1,2,3,4,5], k=2 → [2,1,4,3,5]',
    run: function () {
      const r = reverseKGroup(build([1, 2, 3, 4, 5]), 2);
      if (dump(r) !== '2→1→4→3→5') throw new Error('期望 2→1→4→3→5，实际 ' + dump(r));
    },
  },
  {
    label: '示例: [1,2,3,4,5], k=3 → [3,2,1,4,5]',
    run: function () {
      const r = reverseKGroup(build([1, 2, 3, 4, 5]), 3);
      if (dump(r) !== '3→2→1→4→5') throw new Error('期望 3→2→1→4→5，实际 ' + dump(r));
    },
  },
  {
    label: '边界: k 大于链长 [1,2], k=3 → 原样',
    run: function () {
      const r = reverseKGroup(build([1, 2]), 3);
      if (dump(r) !== '1→2') throw new Error('期望 1→2，实际 ' + dump(r));
    },
  },
]);
