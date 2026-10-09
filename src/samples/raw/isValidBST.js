// 样题「验证二叉搜索树」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：中序递增验证（tree 视图 + 已访问累积）（Hot 100 · 二叉树）
function isValidBST(root) {
  const ids = new Map();
  let cnt = 0;
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    number(node.left);
    number(node.right);
  })(root);
  const baseEdges = [...ids.entries()].flatMap(([n, id]) => {
    const list = [];
    if (n.left) list.push([id, ids.get(n.left), 'left']);
    if (n.right) list.push([id, ids.get(n.right), 'right']);
    return list;
  });
  const done = [];
  const treeSnap = (cur, tone) => {
    const marks = done
      .filter((n) => ids.has(n) && n !== cur)
      .map((n) => ({ id: ids.get(n), tone: 'ok' }));
    if (cur && ids.has(cur)) marks.push({ id: ids.get(cur), tone: tone || 'active' });
    return {
      kind: 'tree',
      nodes: [...ids.entries()].map(([n, id]) => ({ id: id, value: String(n.val) })),
      edges: baseEdges,
      marks: marks,
      title: '二叉树（绿色 = 已中序访问）',
    };
  };
  let prev = null;
  let ok = true;
  const __stack = [];
  const inorder = (node) => {
    __stack.push(node === null ? 'inorder(null)' : `inorder(${node.val})`);
    if (node === null || !ok) {
      __stack.pop();
      return;
    }
    inorder(node.left);
    if (prev !== null && prev.val >= node.val) {
      __rec.step({
        at: 'ok = false',
        msg: `中序访问到 ${node.val}，但上一个访问的节点是 ${prev.val} —— 中序序列必须严格递增，这里塌了！不是合法的 BST`,
        views: { tree: treeSnap(node, 'danger') },
        vars: { 上一步: String(prev.val), 当前: String(node.val) },
        stack: [...__stack],
      });
      ok = false;
      __stack.pop();
      return;
    }
    __rec.step({
      at: 'prev = node',
      msg: `中序访问 ${node.val}：比上一个访问的 ${prev === null ? '（还没有）' : prev.val + ' 大 ✓'}。原理：BST 的中序遍历必然严格递增——边遍历边检查邻居即可`,
      views: { tree: treeSnap(node) },
      vars: { prev: prev === null ? 'null' : String(prev.val), 当前: String(node.val) },
      stack: [...__stack],
    });
    done.push(node);
    prev = node;
    inorder(node.right);
    __stack.pop();
  };
  __rec.step({
    at: 'inorder(root)',
    msg: '验证 BST 最优雅的方法：跑一次中序遍历，检查生成的值序列是否严格递增——不用传上下界，也不用管每棵子树的范围',
    views: { tree: treeSnap(root, null) },
    vars: {},
    stack: [`inorder(${root === null ? 'null' : root.val})`],
  });
  inorder(root);
  __rec.step({
    at: 'return ok',
    msg: ok ? '中序遍历全程严格递增——是合法的二叉搜索树' : '过程中发现了不递增的相邻节点——不是合法的 BST',
    views: { tree: treeSnap(null, null) },
    vars: { 答案: String(ok) },
    stack: [`inorder(${root === null ? 'null' : root.val})`],
  });
  return ok;
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
    label: '示例: [2,1,3] → true',
    run: function () {
      const r = isValidBST(buildTree([2, 1, 3]));
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: [5,1,4,null,null,3,6] → false',
    run: function () {
      const r = isValidBST(buildTree([5, 1, 4, null, null, 3, 6]));
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 相等值 [2,2,2] → false',
    run: function () {
      const r = isValidBST(buildTree([2, 2, 2]));
      if (r !== false) throw new Error('期望 false（严格递增不允许相等），实际 ' + r);
    },
  },
]);
