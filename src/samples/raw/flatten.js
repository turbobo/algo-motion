// 样题「二叉树展开为链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：先序收集 + 逐节点重接（tree 形态实时变形 + array 序列）（Hot 100 · 二叉树）
function flatten(root) {
  const stableId = new Map();
  const preNodes = [];
  (function collect(node) {
    if (!node) return;
    stableId.set(node, 'n' + (preNodes.length + 1));
    preNodes.push(node);
    collect(node.left);
    collect(node.right);
  })(root);
  const treeSnap = (cur) => {
    // BFS 防环收集（重接过程中形态在变）
    const seen = new Set();
    const queue = root ? [root] : [];
    const nodes = [];
    while (queue.length > 0) {
      const n = queue.shift();
      if (!n || seen.has(n)) continue;
      seen.add(n);
      if (stableId.has(n)) {
        nodes.push(n);
        if (n.left) queue.push(n.left);
        if (n.right) queue.push(n.right);
      }
    }
    const inView = new Set(nodes);
    return {
      kind: 'tree',
      nodes: nodes.map((n) => ({ id: stableId.get(n), value: String(n.val) })),
      edges: nodes.flatMap((n) => {
        const list = [];
        if (n.left && inView.has(n.left)) list.push([stableId.get(n), stableId.get(n.left), 'left']);
        if (n.right && inView.has(n.right)) list.push([stableId.get(n), stableId.get(n.right), 'right']);
        return list;
      }),
      marks: cur && inView.has(cur) ? [{ id: stableId.get(cur), tone: 'ok' }] : [],
      title: '树形态（左孩子会被清空，右指针串成一条链）',
    };
  };
  const arrSnap = () => ({
    kind: 'array',
    values: preNodes.map((n) => String(n.val)),
    title: '先序遍历的节点顺序（= 展开后的链表顺序）',
  });
  if (root === null) {
    __rec.step({
      at: 'return root',
      msg: '空树无需展开——直接返回',
      views: { tree: treeSnap(null), seq: arrSnap() },
      vars: {},
    });
    return root;
  }
  __rec.step({
    at: 'const nodes = []',
    msg: '展开规则：把所有节点按「先序」顺序串成一条只走 right 的链（left 全部置空）。于是分两步：先序收集节点，然后依次把每个节点的 left 清空、right 指向下一个',
    views: { tree: treeSnap(null), seq: arrSnap() },
    vars: {},
  });
  const nodes = [];
  const preorder = (node) => {
    if (node === null) {
      return;
    }
    nodes.push(node);
    preorder(node.left);
    preorder(node.right);
  };
  preorder(root);
  __rec.step({
    at: 'preorder(root)',
    msg: `先序收集完成，共 ${nodes.length} 个节点：[${nodes.map((n) => n.val).join(', ')}]——这个顺序就是最终链表的顺序`,
    views: { tree: treeSnap(null), seq: arrSnap() },
    vars: { 节点数: String(nodes.length) },
  });
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].left = null;
    nodes[i].right = nodes[i + 1];
    __rec.step({
      at: 'nodes[i].right = nodes[i + 1]',
      msg: `重接第 ${i + 1} 个节点（值 ${nodes[i].val}）：left 清空，right 指向 ${nodes[i + 1].val}——它原来的子链表已经由先序序列的其他节点接力`,
      views: { tree: treeSnap(nodes[i]), seq: arrSnap() },
      vars: { 位置: String(i + 1) },
    });
  }
  if (nodes.length > 0) {
    nodes[nodes.length - 1].left = null;
    nodes[nodes.length - 1].right = null;
  }
  __rec.step({
    at: 'return root',
    msg: '最后一个节点也清空了左右指针——整棵树原地变形为一条右斜链',
    views: { tree: treeSnap(null), seq: arrSnap() },
    vars: { 答案: '展开后的右链' },
  });
  return root;
}

// ===== 测试用例 =====
function buildTree(vals) {
  if (!vals.length || vals[0] === null) return null;
  const root = { val: vals[0], left: null, right: null };
  const q = [root];
  let i = 1;
  while (i < vals.length) {
    const node = q.shift();
    if (i < vals.length && vals[i] !== null) {
      node.left = { val: vals[i], left: null, right: null };
      q.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] !== null) {
      node.right = { val: vals[i], left: null, right: null };
      q.push(node.right);
    }
    i++;
  }
  return root;
}
function chainDump(root) {
  const out = [];
  let p = root;
  let guard = 0;
  while (p !== null && guard++ < 30) {
    if (p.left !== null) return 'LEFT_NOT_NULL@' + p.val;
    out.push(p.val);
    p = p.right;
  }
  return out.join('→');
}
__rec.tests([
  {
    label: '示例: [1,2,5,3,4,null,6] → 1→2→3→4→5→6',
    run: function () {
      const r = flatten(buildTree([1, 2, 5, 3, 4, null, 6]));
      if (chainDump(r) !== '1→2→3→4→5→6') throw new Error('期望 1→2→3→4→5→6，实际 ' + chainDump(r));
    },
  },
  {
    label: '边界: 单节点 [1]',
    run: function () {
      const r = flatten(buildTree([1]));
      if (chainDump(r) !== '1') throw new Error('期望 1，实际 ' + chainDump(r));
    },
  },
  {
    label: '边界: 空树',
    run: function () {
      const r = flatten(null);
      if (r !== null) throw new Error('期望 null，实际 ' + chainDump(r));
    },
  },
]);
