// 样题「二叉树的直径」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：后序算高度 + 顺路更新全局最大（tree 视图）（Hot 100 · 二叉树）
function diameterOfBinaryTree(root) {
  const ids = new Map();
  let cnt = 0;
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    number(node.left);
    number(node.right);
  })(root);
  const done = new Set();
  const treeSnap = (cur, tone) => {
    const marks = [...done]
      .filter((n) => ids.has(n) && n !== cur)
      .map((n) => ({ id: ids.get(n), tone: 'ok' }));
    if (cur && ids.has(cur)) marks.push({ id: ids.get(cur), tone: tone || 'active' });
    return {
      kind: 'tree',
      nodes: [...ids.entries()].map(([n, id]) => ({ id: id, value: String(n.val) })),
      edges: [...ids.entries()].flatMap(([n, id]) => {
        const list = [];
        if (n.left) list.push([id, ids.get(n.left), 'left']);
        if (n.right) list.push([id, ids.get(n.right), 'right']);
        return list;
      }),
      marks: marks,
      title: '二叉树（绿色 = 高度已算出）',
    };
  };
  let best = 0;
  const depth = (node) => {
    if (node === null) {
      return 0;
    }
    const l = depth(node.left);
    const r = depth(node.right);
    const through = l + r;
    best = Math.max(best, through);
    __rec.step({
      at: 'return Math.max(l, r) + 1',
      msg: `节点 ${ids.get(node)}（值 ${node.val}）：左深 ${l}、右深 ${r}。直径如果从这里拐弯就是 ${l} + ${r} = ${through} → 全局最大更新为 ${best}；向上层返回高度 max(${l}, ${r}) + 1 = ${Math.max(l, r) + 1}`,
      views: { tree: treeSnap(node, best === through && through > 0 ? 'warn' : 'active') },
      vars: { 左深: String(l), 右深: String(r), 当前直径: String(through), best: String(best) },
    });
    done.add(node);
    return Math.max(l, r) + 1;
  };
  depth(root);
  __rec.step({
    at: 'return best',
    msg: `所有节点都算完了——直径（任意两节点间最长路径的边数）为 ${best}`,
    views: { tree: treeSnap(null) },
    vars: { 答案: String(best) },
  });
  return best;
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
__rec.tests([
  {
    label: '示例: [1,2,3,4,5] → 3',
    run: function () {
      const r = diameterOfBinaryTree(buildTree([1, 2, 3, 4, 5]));
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '示例: [1,2] → 1',
    run: function () {
      const r = diameterOfBinaryTree(buildTree([1, 2]));
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '边界: 空树 → 0',
    run: function () {
      const r = diameterOfBinaryTree(null);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
