// 样题「翻转二叉树」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：递归交换左右子树（tree 视图形态实时镜像）（Hot 100 · 二叉树）
// 注意：插桩状态必须放外层（函数体内声明会在自递归的每一层被重置）；递归体用内部函数 __impl
function invertTree(root) {
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
    title: '二叉树（绿色 = 左右子树已交换）',
  });
  const __stack = [];
  const __impl = (node) => {
    __stack.push(node === null ? 'invertTree(null)' : `invertTree(${node.val})`);
    if (node === null) {
      __stack.pop();
      return null;
    }
    const tmp = node.left;
    node.left = node.right;
    node.right = tmp;
    __rec.step({
      at: 'root.right = tmp',
      msg: `交换节点 ${ids.get(node)}（值 ${node.val}）的左右子树——看图中这两个分支换边了`,
      views: { tree: treeSnap(node) },
      vars: { 当前节点: String(node.val) },
      stack: [...__stack],
    });
    done.add(node);
    __impl(node.left);
    __impl(node.right);
    __stack.pop();
    return node;
  };
  if (root === null) {
    __rec.step({
      at: 'return null',
      msg: '空树无需翻转——直接返回 null',
      views: { tree: treeSnap(null) },
      vars: {},
      stack: ['invertTree(null)'],
    });
    return null;
  }
  __rec.step({
    at: 'const tmp = root.left',
    msg: '翻转 = 每个节点的左右子树互换位置。对每个节点：交换它的 left 和 right，然后递归进两个子树——注意交换后"左"已经是原来的右子树了',
    views: { tree: treeSnap(root) },
    vars: {},
    stack: [`invertTree(${root.val})`],
  });
  __impl(root);
  __rec.step({
    at: 'return root',
    msg: '所有节点都交换完毕——整棵树完成了左右镜像翻转',
    views: { tree: treeSnap(null) },
    vars: { 答案: '镜像翻转后的树' },
    stack: [`invertTree(${root.val})`],
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
function dumpTree(root) {
  if (!root) return '[]';
  const out = [];
  const q = [root];
  while (q.length) {
    const n = q.shift();
    if (n) {
      out.push(n.val);
      q.push(n.left, n.right);
    } else {
      out.push(null);
    }
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop();
  return JSON.stringify(out);
}
__rec.tests([
  {
    label: '示例: [4,2,7,1,3,6,9] → [4,7,2,9,6,3,1]',
    run: function () {
      const r = invertTree(buildTree([4, 2, 7, 1, 3, 6, 9]));
      if (dumpTree(r) !== '[4,7,2,9,6,3,1]') throw new Error('期望 [4,7,2,9,6,3,1]，实际 ' + dumpTree(r));
    },
  },
  {
    label: '示例: [2,1,3] → [2,3,1]',
    run: function () {
      const r = invertTree(buildTree([2, 1, 3]));
      if (dumpTree(r) !== '[2,3,1]') throw new Error('期望 [2,3,1]，实际 ' + dumpTree(r));
    },
  },
  {
    label: '边界: 空树',
    run: function () {
      const r = invertTree(null);
      if (r !== null) throw new Error('期望 null，实际 ' + dumpTree(r));
    },
  },
]);
