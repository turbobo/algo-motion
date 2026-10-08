// 样题「随机链表的复制」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：哈希映射原→新，两遍连线（原链/复制链/映射表三视图）（Hot 100 · 链表）
function copyRandomList(head) {
  const origIds = new Map();
  let oi = 0;
  for (let p = head; p !== null; p = p.next) {
    origIds.set(p, 'o' + ++oi);
  }
  const origView = (curP) => {
    const nodes = [...origIds.entries()].map(([p, id]) => ({ id: id, value: String(p.val) }));
    const links = [...origIds.entries()].map(([p, id]) => [id, p.next && origIds.has(p.next) ? origIds.get(p.next) : null]);
    const marks = curP && origIds.has(curP) ? [{ id: origIds.get(curP), tone: 'active' }] : [];
    return { kind: 'linkedlist', nodes: nodes, next: links, marks: marks, title: '原链表' };
  };
  const copyView = () => {
    const values = [...map.values()];
    const idx = new Map();
    let i = 0;
    for (const n of values) idx.set(n, 'c' + i++);
    const nodes = values.map((n) => ({ id: idx.get(n), value: String(n.val) }));
    const links = values.map((n) => [idx.get(n), n.next && idx.has(n.next) ? idx.get(n.next) : null]);
    return { kind: 'linkedlist', nodes: nodes, next: links, title: '复制链（新节点）' };
  };
  const metaView = (hi) => ({
    kind: 'hashmap',
    entries: [...map.entries()].map(([orig, copy]) => [origIds.get(orig), '新节点(' + copy.val + ')']),
    highlightKeys: hi && origIds.has(hi) ? [origIds.get(hi)] : [],
    title: 'map：原节点 → 复制节点',
  });
  const map = new Map();
  __rec.step({
    at: 'const map = new Map()',
    msg: '深拷贝一个带 random 指针的链表，难点是 random 可能指向"还没复制的节点"。技巧：第一遍只创建所有新节点并建立「原节点 → 新节点」的哈希映射；第二遍再统一连 next 和 random（此时所有目标都已存在）',
    views: { orig: origView(null), copy: copyView(), meta: metaView(null) },
    vars: {},
  });
  for (let p = head; p !== null; p = p.next) {
    map.set(p, { val: p.val, next: null, random: null });
  }
  __rec.step({
    at: 'for (let p = head; p !== null; p = p.next)',
    msg: `第一遍完成：${map.size} 个新节点已就位（值一样但全是孤立节点），映射表建好——这是深拷贝安全的关键`,
    views: { orig: origView(null), copy: copyView(), meta: metaView(null) },
    vars: { 节点数: String(map.size) },
  });
  for (let p = head; p !== null; p = p.next) {
    const copy = map.get(p);
    copy.next = p.next ? map.get(p.next) : null;
    copy.random = p.random ? map.get(p.random) : null;
    __rec.step({
      at: 'copy.random = p.random ? map.get(p.random) : null',
      msg: `连好 ${origIds.get(p)} 的两根指针：next → ${p.next ? origIds.get(p.next) : 'null'} 的复制本；random → ${p.random ? origIds.get(p.random) + '（值 ' + p.random.val + '）' : 'null'} 的复制本`,
      views: { orig: origView(p), copy: copyView(), meta: metaView(p) },
      vars: { 当前: origIds.get(p) },
    });
  }
  __rec.step({
    at: 'return head ? map.get(head) : null',
    msg: '第二遍完成，复制链的 next 和 random 全部指向新建的节点（没有共用任何原节点）——返回复制链的头',
    views: { orig: origView(null), copy: copyView(), meta: metaView(null) },
    vars: { 答案: '深拷贝的新链表' },
  });
  return head ? map.get(head) : null;
}

// ===== 测试用例 =====
function buildRandom(vals, randoms) {
  const nodes = vals.map((v) => ({ val: v, next: null, random: null }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  for (let i = 0; i < randoms.length; i++) {
    nodes[i].random = randoms[i] === null || randoms[i] === undefined ? null : nodes[randoms[i]];
  }
  return nodes[0];
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
function randomDump(node) {
  const out = [];
  let guard = 0;
  while (node !== null && guard++ < 30) {
    out.push(node.random ? String(node.random.val) : 'null');
    node = node.next;
  }
  return out.join(',');
}
__rec.tests([
  {
    label: '示例: [7,13,11] random=[null,0,1]',
    run: function () {
      const src = buildRandom([7, 13, 11], [null, 0, 1]);
      const r = copyRandomList(src);
      if (dump(r) !== '7→13→11') throw new Error('值序列期望 7→13→11，实际 ' + dump(r));
      if (randomDump(r) !== randomDump(src)) throw new Error('random 序列期望 ' + randomDump(src) + '，实际 ' + randomDump(r));
      if (r === src || r.next === src.next) throw new Error('必须是全新的节点（深拷贝）');
    },
  },
  {
    label: '边界: random 全为 null',
    run: function () {
      const src = buildRandom([1, 2], [null, null]);
      const r = copyRandomList(src);
      if (dump(r) !== '1→2' || r.random !== null) throw new Error('期望 1→2 且 random 全 null，实际 ' + dump(r) + ' / ' + randomDump(r));
    },
  },
  {
    label: '边界: 空链表',
    run: function () {
      const r = copyRandomList(null);
      if (r !== null) throw new Error('期望 null，实际 ' + r);
    },
  },
]);
