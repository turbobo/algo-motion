// 样题「二叉树的层序遍历」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：BFS 队列 + 逐层收割（tree + 队列 array + 结果 array）（Hot 100 · 二叉树）
function levelOrder(root) {
  const ids = new Map();
  const depthOf = new Map();
  let cnt = 0;
  (function walk(node, d) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    depthOf.set(node, d);
    walk(node.left, d + 1);
    walk(node.right, d + 1);
  })(root, 0);
  const treeSnap = (levelDone) => ({
    kind: 'tree',
    nodes: [...ids.entries()].map(([n, id]) => ({ id: id, value: String(n.val) })),
    edges: [...ids.entries()].flatMap(([n, id]) => {
      const list = [];
      if (n.left) list.push([id, ids.get(n.left), 'left']);
      if (n.right) list.push([id, ids.get(n.right), 'right']);
      return list;
    }),
    marks:
      levelDone >= 0
        ? [...ids.entries()]
            .filter(([n]) => depthOf.get(n) === levelDone)
            .map(([, id]) => ({ id: id, tone: 'ok' }))
        : [],
    title: '二叉树（绿色 = 刚处理完的这一层）',
  });
  const queueSnap = (queue) => ({
    kind: 'array',
    values: queue.map((n) => String(n.val)),
    pointers: queue.length > 0 ? { 队首: 0 } : {},
    title: 'BFS 队列（下一层的节点排队中）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((l) => l.join(',')),
    title: '结果（每层一行）',
  });
  const res = [];
  if (root === null) {
    __rec.step({
      at: 'return []',
      msg: '空树没有层——直接返回空结果',
      views: { tree: treeSnap(-1), res: resSnap() },
      vars: {},
    });
    return [];
  }
  const queue = [root];
  __rec.step({
    at: 'const queue = [root]',
    msg: '层序遍历 = BFS：用队列把根先排上，每一轮先记下"当前队列长度"（= 这一层的节点数），然后连续处理这么多节点——处理时把它们的左右孩子排到队尾，正好凑成下一层',
    views: { tree: treeSnap(-1), queue: queueSnap(queue), res: resSnap() },
    vars: {},
  });
  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left !== null) {
        queue.push(node.left);
      }
      if (node.right !== null) {
        queue.push(node.right);
      }
    }
    res.push(level);
    __rec.step({
      at: 'res.push(level)',
      msg: `第 ${res.length - 1} 层收割完成：[${level.join(', ')}]——这一层的孩子已经全部排进队列，等着下一轮`,
      views: { tree: treeSnap(res.length - 1), queue: queueSnap(queue), res: resSnap() },
      vars: { 当前层: `第 ${res.length - 1} 层`, 队内待处理: String(queue.length) },
    });
  }
  __rec.step({
    at: 'return res',
    msg: `队列空了——所有层收割完毕，共 ${res.length} 层`,
    views: { tree: treeSnap(-1), queue: queueSnap([]), res: resSnap() },
    vars: { 答案: JSON.stringify(res) },
  });
  return res;
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
    label: '示例: [3,9,20,null,null,15,7]',
    run: function () {
      const r = levelOrder(buildTree([3, 9, 20, null, null, 15, 7]));
      if (JSON.stringify(r) !== JSON.stringify([[3], [9, 20], [15, 7]])) {
        throw new Error('期望 [[3],[9,20],[15,7]]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '示例: 单节点 [1]',
    run: function () {
      const r = levelOrder(buildTree([1]));
      if (JSON.stringify(r) !== JSON.stringify([[1]])) throw new Error('期望 [[1]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 空树',
    run: function () {
      const r = levelOrder(null);
      if (JSON.stringify(r) !== JSON.stringify([])) throw new Error('期望 []，实际 ' + JSON.stringify(r));
    },
  },
]);
