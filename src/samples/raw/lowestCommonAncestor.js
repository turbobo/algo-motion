// 样题「二叉树的最近公共祖先」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：后序递归 + 返回值传播（tree 视图 p/q 固定标记）（Hot 100 · 二叉树）
function lowestCommonAncestor(root, p, q) {
  const ids = new Map();
  let cnt = 0;
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    number(node.left);
    number(node.right);
  })(root);
  const valOf = (n) => (n === null ? 'null' : String(n.val));
  const treeSnap = (cur) => {
    const marks = [];
    if (p && ids.has(p)) marks.push({ id: ids.get(p), tone: 'ok' });
    if (q && ids.has(q) && q !== p) marks.push({ id: ids.get(q), tone: 'warn' });
    if (cur && ids.has(cur) && cur !== p && cur !== q) marks.push({ id: ids.get(cur), tone: 'active' });
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
      title: '二叉树（绿/黄 = 要找的两个节点 p、q）',
    };
  };
  __rec.step({
    at: 'const left = dfs(node.left)',
    msg: '定义 dfs(node)：如果 subtree 里找到了 p 或 q 就把它往上传；如果左右两边各传回来一个（p 和 q 分处两侧）——那 node 就是最近公共祖先；否则把找到的那个继续上传',
    views: { tree: treeSnap(root) },
    vars: {},
  });
  const dfs = (node) => {
    if (node === null || node === p || node === q) {
      return node;
    }
    const left = dfs(node.left);
    const right = dfs(node.right);
    const isLCA = left !== null && right !== null;
    __rec.step({
      at: 'if (left !== null && right !== null)',
      msg: isLCA
        ? `节点 ${node.val}：左子树返回 ${valOf(left)}、右子树返回 ${valOf(right)} —— p 和 q 在两侧各找到一个，说明它们在此分叉 → 当前节点就是最近公共祖先！`
        : `节点 ${node.val}：左返回 ${valOf(left)}、右返回 ${valOf(right)} —— ${left !== null || right !== null ? '只有一边找到了' : '两边都没找到'}，把 ${valOf(left !== null ? left : right)} 继续向上传`,
      views: { tree: treeSnap(node) },
      vars: { 左返回: valOf(left), 右返回: valOf(right) },
    });
    if (isLCA) {
      return node;
    }
    return left !== null ? left : right;
  };
  __rec.step({
    at: 'return dfs(root)',
    msg: '全网搜索完成——最终返回的节点就是最近公共祖先',
    views: { tree: treeSnap(null) },
    vars: {},
  });
  return dfs(root);
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
function findByVal(root, val) {
  if (!root) return null;
  if (root.val === val) return root;
  return findByVal(root.left, val) || findByVal(root.right, val);
}
__rec.tests([
  {
    label: '示例: [3,5,1,6,2,0,8,null,null,7,4], p=5, q=4 → 5',
    run: function () {
      const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const r = lowestCommonAncestor(root, findByVal(root, 5), findByVal(root, 4));
      if (!r || r.val !== 5) throw new Error('期望 LCA = 5，实际 ' + (r ? r.val : 'null'));
    },
  },
  {
    label: '示例: 同上 p=5, q=1 → 3',
    run: function () {
      const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const r = lowestCommonAncestor(root, findByVal(root, 5), findByVal(root, 1));
      if (!r || r.val !== 3) throw new Error('期望 LCA = 3，实际 ' + (r ? r.val : 'null'));
    },
  },
  {
    label: '边界: p 是 q 的祖先 [1,2], p=1, q=2 → 1',
    run: function () {
      const root = buildTree([1, 2]);
      const r = lowestCommonAncestor(root, findByVal(root, 1), findByVal(root, 2));
      if (!r || r.val !== 1) throw new Error('期望 LCA = 1，实际 ' + (r ? r.val : 'null'));
    },
  },
]);
