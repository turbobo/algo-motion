// 样题「二叉搜索树中第 K 小的元素」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：栈式迭代中序 + 计数（tree + stack 视图）（Hot 100 · 二叉树）
function kthSmallest(root, k) {
  const ids = new Map();
  let cnt = 0;
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    number(node.left);
    number(node.right);
  })(root);
  const treeSnap = (cur) => ({
    kind: 'tree',
    nodes: [...ids.entries()].map(([n, id]) => ({ id: id, value: String(n.val) })),
    edges: [...ids.entries()].flatMap(([n, id]) => {
      const list = [];
      if (n.left) list.push([id, ids.get(n.left), 'left']);
      if (n.right) list.push([id, ids.get(n.right), 'right']);
      return list;
    }),
    marks: cur && ids.has(cur) ? [{ id: ids.get(cur), tone: 'active' }] : [],
    pointers: cur && ids.has(cur) ? { curr: ids.get(cur) } : {},
    title: 'BST（中序第 k 个访问的节点就是答案）',
  });
  const stackSnap = (stack, hi) => ({
    kind: 'stack',
    items: stack.map((n) => String(n.val)),
    marks: hi !== undefined && hi >= 0 ? [{ index: hi, tone: 'active' }] : [],
    title: '显式栈',
  });
  const stack = [];
  let cur = root;
  let remaining = k;
  __rec.step({
    at: 'let remaining = k',
    msg: `BST 的中序遍历就是升序序列——所以"第 k 小"就是中序访问的第 ${k} 个节点。k 当作倒计时：每访问一个节点减 1，减到 0 就是答案`,
    views: { tree: treeSnap(cur), stack: stackSnap(stack, -1) },
    vars: { k: String(k) },
  });
  while (cur !== null || stack.length > 0) {
    while (cur !== null) {
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();
    remaining--;
    if (remaining === 0) {
      __rec.step({
        at: 'return cur.val',
        msg: `倒计时归零！中序遍历的第 ${k} 个节点是 ${cur.val} —— 这就是第 ${k} 小的元素`,
        views: { tree: treeSnap(cur), stack: stackSnap(stack, stack.length > 0 ? stack.length - 1 : -1) },
        vars: { 答案: String(cur.val) },
      });
      return cur.val;
    }
    __rec.step({
      at: 'if (remaining === 0)',
      msg: `访问 ${cur.val}（BST 升序第 ${k - remaining} 个），倒计时剩 ${remaining}——还不够小，继续中序`,
      views: { tree: treeSnap(cur), stack: stackSnap(stack, stack.length > 0 ? stack.length - 1 : -1) },
      vars: { 剩余: String(remaining) },
    });
    cur = cur.right;
  }
  return -1;
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
    label: '示例: [3,1,4,null,2], k=3 → 3',
    run: function () {
      const r = kthSmallest(buildTree([3, 1, 4, null, 2]), 3);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '示例: [5,3,6,2,4,null,null,1], k=1 → 1',
    run: function () {
      const r = kthSmallest(buildTree([5, 3, 6, 2, 4, null, null, 1]), 1);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '边界: 最大 k [3,1,4,null,2], k=4 → 4',
    run: function () {
      const r = kthSmallest(buildTree([3, 1, 4, null, 2]), 4);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
]);
