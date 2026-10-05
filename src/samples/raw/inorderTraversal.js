// 样题「二叉树中序遍历（迭代）」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：tree 视图（自动布局 + 指针）+ stack 视图（显式栈模拟递归）
function inorderTraversal(root) {
  // 给每个节点分配稳定 id（n + val）
  const ids = new Map();
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + node.val);
    number(node.left);
    number(node.right);
  })(root);
  const treeSnap = (marks, pointers) => ({
    kind: 'tree',
    nodes: [...ids.entries()].map(([node, id]) => ({ id: id, value: String(node.val) })),
    edges: [...ids.entries()].flatMap(([node, id]) => {
      const list = [];
      if (node.left) list.push([id, ids.get(node.left), 'left']);
      if (node.right) list.push([id, ids.get(node.right), 'right']);
      return list;
    }),
    marks: marks || [],
    pointers: pointers || {},
    title: '二叉树',
  });
  const stackSnap = (hi) => ({
    kind: 'stack',
    items: stack.map((node) => String(node.val)),
    marks: hi !== undefined ? [{ index: hi, tone: 'active' }] : [],
    title: '显式栈（模拟递归）',
  });
  const visited = [];
  const okMarks = () => visited.map((v) => ({ id: 'n' + v, tone: 'ok' }));
  const res = [];
  const stack = [];
  __rec.step({
    at: 'let curr = root',
    msg: '中序遍历的顺序是「左 → 根 → 右」。策略：curr 一路向左走，沿途把节点压进栈；走不动了就弹栈访问，再转向右子树',
    views: { tree: treeSnap([], { curr: ids.get(root) }), stack: stackSnap() },
    vars: { 结果: '[]' },
  });
  let curr = root;
  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      stack.push(curr);
      __rec.step({
        at: 'stack.push(curr)',
        msg: `把 ${ids.get(curr)}（值 ${curr.val}）压入栈，继续往左走 —— 左边的节点必须先于它被访问`,
        views: {
          tree: treeSnap([...okMarks(), { id: ids.get(curr), tone: 'active' }], { curr: ids.get(curr) }),
          stack: stackSnap(stack.length - 1),
        },
        vars: { 结果: '[' + res.join(', ') + ']' },
      });
      curr = curr.left;
    }
    curr = stack.pop();
    __rec.step({
      at: 'curr = stack.pop()',
      msg: `curr 走到空 → 弹栈：取出 ${ids.get(curr)}（值 ${curr.val}），它的左边已经访问完了，轮到它自己`,
      views: {
        tree: treeSnap([...okMarks(), { id: ids.get(curr), tone: 'warn' }], { curr: ids.get(curr) }),
        stack: stackSnap(stack.length > 0 ? stack.length - 1 : undefined),
      },
      vars: { 结果: '[' + res.join(', ') + ']' },
    });
    res.push(curr.val);
    visited.push(curr.val);
    __rec.step({
      at: 'res.push(curr.val)',
      msg: `把值 ${curr.val} 记入结果：[${res.join(', ')}]`,
      views: { tree: treeSnap(okMarks(), { curr: ids.get(curr) }), stack: stackSnap() },
      vars: { 结果: '[' + res.join(', ') + ']' },
    });
    curr = curr.right;
  }
  __rec.step({
    at: 'return res',
    msg: `栈和 curr 都空了，遍历完成：[${res.join(', ')}]`,
    views: { tree: treeSnap(okMarks(), {}), stack: stackSnap() },
    vars: { 结果: '[' + res.join(', ') + ']' },
  });
  return res;
}

// ===== 测试用例 =====
function buildTree(vals) {
  if (!vals.length) return null;
  const root = { val: vals[0], left: null, right: null };
  const q = [root];
  let i = 1;
  while (i < vals.length) {
    const node = q.shift();
    if (i < vals.length) {
      node.left = { val: vals[i++], left: null, right: null };
      q.push(node.left);
    }
    if (i < vals.length) {
      node.right = { val: vals[i++], left: null, right: null };
      q.push(node.right);
    }
  }
  return root;
}
__rec.tests([
  {
    label: '示例: [4,2,6,1,3,5,7]',
    run: function () {
      const r = inorderTraversal(buildTree([4, 2, 6, 1, 3, 5, 7]));
      if (JSON.stringify(r) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7])) {
        throw new Error('期望 [1,2,3,4,5,6,7]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: 单节点 [1]',
    run: function () {
      const r = inorderTraversal(buildTree([1]));
      if (JSON.stringify(r) !== JSON.stringify([1])) throw new Error('期望 [1]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 空树',
    run: function () {
      const r = inorderTraversal(null);
      if (JSON.stringify(r) !== JSON.stringify([])) throw new Error('期望 []，实际 ' + JSON.stringify(r));
    },
  },
]);
