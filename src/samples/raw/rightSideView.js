// 样题「二叉树的右视图」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：BFS 每层最右节点（tree + 队列 + 结果）（Hot 100 · 二叉树）
function rightSideView(root) {
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
  const treeSnap = (cur) =>
    ({
      kind: 'tree',
      nodes: [...ids.entries()].map(([n, id]) => ({ id: id, value: String(n.val) })),
      edges: [...ids.entries()].flatMap(([n, id]) => {
        const list = [];
        if (n.left) list.push([id, ids.get(n.left), 'left']);
        if (n.right) list.push([id, ids.get(n.right), 'right']);
        return list;
      }),
      marks: cur && ids.has(cur) ? [{ id: ids.get(cur), tone: 'ok' }] : [],
      title: '二叉树（绿色 = 每层最右边的节点）',
    });
  const queueSnap = (queue) => ({
    kind: 'array',
    values: queue.map((n) => String(n.val)),
    pointers: queue.length > 0 ? { 队首: 0 } : {},
    title: 'BFS 队列',
  });
  const resSnap = () => ({ kind: 'array', values: [...res], title: '右视图（每层最右的值）' });
  const res = [];
  if (root === null) {
    __rec.step({
      at: 'return []',
      msg: '空树没有右视图——返回空',
      views: { tree: treeSnap(null), res: resSnap() },
      vars: {},
    });
    return [];
  }
  const queue = [root];
  __rec.step({
    at: 'const queue = [root]',
    msg: '站在树的右侧看，每一层只能看见最右边的那个节点。层序遍历时记住每层的节点数，当处理到"本层最后一个"时，它就是这一层的右视图',
    views: { tree: treeSnap(null), queue: queueSnap(queue), res: resSnap() },
    vars: {},
  });
  while (queue.length > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (i === levelSize - 1) {
        res.push(node.val);
        __rec.step({
          at: 'res.push(node.val)',
          msg: `本层处理到最后一个节点 ${node.val} —— 从右侧看它就是这一层唯一可见的，收入右视图`,
          views: { tree: treeSnap(node), queue: queueSnap(queue), res: resSnap() },
          vars: { 当前层: `第 ${res.length - 1} 层` },
        });
      }
      if (node.left !== null) {
        queue.push(node.left);
      }
      if (node.right !== null) {
        queue.push(node.right);
      }
    }
  }
  __rec.step({
    at: 'return res',
    msg: `所有层处理完毕——右视图为 [${res.join(', ')}]`,
    views: { tree: treeSnap(null), queue: queueSnap([]), res: resSnap() },
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
    label: '示例: [1,2,3,null,5,null,4] → [1,3,4]',
    run: function () {
      const r = rightSideView(buildTree([1, 2, 3, null, 5, null, 4]));
      if (JSON.stringify(r) !== JSON.stringify([1, 3, 4])) throw new Error('期望 [1,3,4]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: [1,null,3] → [1,3]',
    run: function () {
      const r = rightSideView(buildTree([1, null, 3]));
      if (JSON.stringify(r) !== JSON.stringify([1, 3])) throw new Error('期望 [1,3]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 左偏树 [1,2,null,3] → [1,2,3]',
    run: function () {
      const r = rightSideView(buildTree([1, 2, null, 3]));
      if (JSON.stringify(r) !== JSON.stringify([1, 2, 3])) throw new Error('期望 [1,2,3]，实际 ' + JSON.stringify(r));
    },
  },
]);
