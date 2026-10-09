// 样题「二叉树的最大深度」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：后序递归 + 自底向上标深度（tree 视图）（Hot 100 · 二叉树）
// 注意：插桩状态必须放外层（函数体内声明会在自递归的每一层被重置）；递归体用内部函数 __impl
function maxDepth(root) {
  const ids = new Map();
  let cnt = 0;
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    number(node.left);
    number(node.right);
  })(root);
  const done = new Set();
  const treeSnap = (cur) => ({
    kind: 'tree',
    nodes: [...ids.entries()].map(([n, id]) => ({ id: id, value: String(n.val) })),
    edges: [...ids.entries()].flatMap(([n, id]) => {
      const list = [];
      if (n.left) list.push([id, ids.get(n.left), 'left']);
      if (n.right) list.push([id, ids.get(n.right), 'right']);
      return list;
    }),
    marks: [...done]
      .filter((n) => ids.has(n) && n !== cur)
      .map((n) => ({ id: ids.get(n), tone: 'ok' }))
      .concat(cur && ids.has(cur) ? [{ id: ids.get(cur), tone: 'active' }] : []),
    title: '二叉树（绿色 = 深度已算出）',
  });
  const __stack = [];
  const __impl = (node) => {
    __stack.push(node === null ? 'maxDepth(null)' : `maxDepth(${node.val})`);
    if (node === null) {
      __stack.pop();
      return 0;
    }
    const left = __impl(node.left);
    const right = __impl(node.right);
    __rec.step({
      at: 'return Math.max(left, right) + 1',
      msg: `节点 ${ids.get(node)}（值 ${node.val}）收到子树结果：左 ${left}、右 ${right} → max(${left}, ${right}) + 1 = ${Math.max(left, right) + 1}`,
      views: { tree: treeSnap(node) },
      vars: { 左深度: String(left), 右深度: String(right), 返回: String(Math.max(left, right) + 1) },
      stack: [...__stack],
    });
    done.add(node);
    __stack.pop();
    return Math.max(left, right) + 1;
  };
  if (root === null) {
    __rec.step({
      at: 'return 0',
      msg: '空节点（null）的深度定义为 0——递归的停机条件',
      views: { tree: treeSnap(null) },
      vars: { 深度: '0' },
      stack: ['maxDepth(null)'],
    });
    return 0;
  }
  __rec.step({
    at: 'const left = maxDepth(root.left)',
    msg: '树的最大深度 = 左右子树深度的最大值 + 1。用后序遍历：先递归算出两棵子树的深度，再往上合并——绿色节点表示它的深度已经算出来了',
    views: { tree: treeSnap(root) },
    vars: {},
    stack: [`maxDepth(${root.val})`],
  });
  const result = __impl(root);
  return result;
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
    label: '示例: [3,9,20,null,null,15,7] → 3',
    run: function () {
      const r = maxDepth(buildTree([3, 9, 20, null, null, 15, 7]));
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '边界: 单节点 [1] → 1',
    run: function () {
      const r = maxDepth(buildTree([1]));
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '边界: 空树 → 0',
    run: function () {
      const r = maxDepth(null);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
