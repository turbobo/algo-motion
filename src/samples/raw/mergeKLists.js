// 样题「合并 K 个升序链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：逐个归并（复用两两合并）（Hot 100 · 链表）
function mergeKLists(lists) {
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
  const mergeTwo = (a, b) => {
    const dummy = { val: 0, next: null };
    let cur = dummy;
    while (a !== null && b !== null) {
      if (a.val <= b.val) {
        cur.next = a;
        a = a.next;
      } else {
        cur.next = b;
        b = b.next;
      }
      cur = cur.next;
    }
    cur.next = a !== null ? a : b;
    return dummy.next;
  };
  let result = lists[0] || null;
  __rec.step({
    at: 'let result = lists[0] || null',
    msg: `K 条有序链的合并可以拆成"两两归并"：先拿第 0 条当结果，然后依次把每条链归并进来——每次归并都复用同一个 mergeTwo 函数`,
    views: {
      result: chainView(result, 'r', {}, '当前结果链'),
      incoming: chainView(lists[1] || null, 'i', {}, '下一条待归并（lists[1]）'),
    },
    vars: { K: String(lists.length) },
  });
  for (let i = 1; i < lists.length; i++) {
    const incoming = lists[i];
    result = mergeTwo(result, incoming);
    __rec.step({
      at: 'result = mergeTwo(result, lists[i])',
      msg: `第 ${i} 轮：把 lists[${i}] 归并进结果链——归并过程是标准的双指针接力（谁小接谁），归并后结果链更长、依然有序`,
      views: {
        result: chainView(result, 'r', {}, '当前结果链（已归并 ' + (i + 1) + ' 条）'),
        incoming: chainView(lists[i + 1] || null, 'i', {}, i + 1 < lists.length ? '下一条待归并（lists[' + (i + 1) + ']）' : '（没有更多链了）'),
      },
      vars: { 轮次: `${i + 1}/${lists.length}` },
    });
  }
  __rec.step({
    at: 'return result',
    msg: `所有链都归并完成——K 条有序链合并为一条`,
    views: { result: chainView(result, 'r', {}, '最终结果链') },
    vars: { 答案: '合并后的有序链' },
  });
  return result;
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
  while (node !== null && guard++ < 40) {
    out.push(node.val);
    node = node.next;
  }
  return out.join('→');
}
__rec.tests([
  {
    label: '示例: [[1,4,5],[1,3,4],[2,6]]',
    run: function () {
      const r = mergeKLists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])]);
      if (dump(r) !== '1→1→2→3→4→4→5→6') throw new Error('期望 1→1→2→3→4→4→5→6，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 空数组',
    run: function () {
      const r = mergeKLists([]);
      if (r !== null) throw new Error('期望 null，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 含空链 [[1],[],[2]]',
    run: function () {
      const r = mergeKLists([build([1]), null, build([2])]);
      if (dump(r) !== '1→2') throw new Error('期望 1→2，实际 ' + dump(r));
    },
  },
]);
