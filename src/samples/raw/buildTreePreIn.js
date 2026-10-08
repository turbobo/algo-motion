// 样题「从前序与中序序列构造二叉树」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：分治定位根 + 树逐步长出（tree + preorder/inorder 区间）（Hot 100 · 二叉树）
function buildTree(preorder, inorder) {
  const built = new Map();
  let cnt = 0;
  let lastId = '';
  const treeSnap = () => ({
    kind: 'tree',
    nodes: [...built.entries()].map(([n, id]) => ({ id: id, value: String(n.val) })),
    edges: [...built.entries()].flatMap(([n, id]) => {
      const list = [];
      if (n.left && built.has(n.left)) list.push([id, built.get(n.left), 'left']);
      if (n.right && built.has(n.right)) list.push([id, built.get(n.right), 'right']);
      return list;
    }),
    marks: lastId ? [{ id: lastId, tone: 'active' }] : [],
    title: '正在构建的树（高亮 = 刚创建的根）',
  });
  const preSnap = (lo, hi) => ({
    kind: 'array',
    values: [...preorder],
    ranges: lo <= hi ? [{ from: lo, to: hi, label: '本子树的前序段', tone: 'warn' }] : [],
    marks: lo <= hi && lo < preorder.length ? [{ index: lo, tone: 'active' }] : [],
    title: 'preorder：每段的第一个 = 子树的根',
  });
  const inSnap = (lo, hi, mid) => ({
    kind: 'array',
    values: [...inorder],
    ranges: lo <= hi ? [{ from: lo, to: hi, label: '本子树的中序段', tone: 'warn' }] : [],
    marks: mid >= 0 && mid < inorder.length ? [{ index: mid, tone: 'ok' }] : [],
    title: 'inorder：根左边是左子树、右边是右子树',
  });
  if (preorder.length === 0) {
    __rec.step({
      at: 'return null',
      msg: '空序列构造不出树——返回 null',
      views: { tree: treeSnap(), pre: preSnap(0, -1), ino: inSnap(0, -1, -1) },
      vars: {},
    });
    return null;
  }
  const indexOf = new Map();
  for (let i = 0; i < inorder.length; i++) {
    indexOf.set(inorder[i], i);
  }
  const build = (preLo, preHi, inLo, inHi) => {
    if (preLo > preHi) {
      return null;
    }
    const rootVal = preorder[preLo];
    const node = { val: rootVal, left: null, right: null };
    built.set(node, 'n' + ++cnt);
    lastId = 'n' + cnt;
    const inRoot = indexOf.get(rootVal);
    const leftSize = inRoot - inLo;
    __rec.step({
      at: 'const leftSize = inRoot - inLo',
      msg: `前序段的第一个 ${rootVal} 就是根；在中序里找到它的位置 ${inRoot}：左边 ${leftSize} 个是左子树（中序 [${inLo}..${inRoot - 1}]），右边是右子树——两段长度又在 preorder 里切出对应的子段`,
      views: { tree: treeSnap(), pre: preSnap(preLo, preHi), ino: inSnap(inLo, inHi, inRoot) },
      vars: { 根: String(rootVal), 左子树大小: String(leftSize) },
    });
    node.left = build(preLo + 1, preLo + leftSize, inLo, inRoot - 1);
    node.right = build(preLo + leftSize + 1, preHi, inRoot + 1, inHi);
    return node;
  };
  const result = build(0, preorder.length - 1, 0, inorder.length - 1);
  __rec.step({
    at: 'return build(0, preorder.length - 1, 0, inorder.length - 1)',
    msg: '所有区间切片都递归完毕——唯一的一棵树构建完成',
    views: { tree: treeSnap(), pre: preSnap(0, -1), ino: inSnap(0, -1, -1) },
    vars: { 答案: '按前序+中序重建的树' },
  });
  return result;
}

// ===== 测试用例 =====
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
    label: '示例: pre=[3,9,20,15,7], in=[9,3,15,20,7]',
    run: function () {
      const r = buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]);
      if (dumpTree(r) !== '[3,9,20,null,null,15,7]') throw new Error('期望 [3,9,20,null,null,15,7]，实际 ' + dumpTree(r));
    },
  },
  {
    label: '边界: 单节点',
    run: function () {
      const r = buildTree([1], [1]);
      if (dumpTree(r) !== '[1]') throw new Error('期望 [1]，实际 ' + dumpTree(r));
    },
  },
  {
    label: '边界: 空序列',
    run: function () {
      const r = buildTree([], []);
      if (r !== null) throw new Error('期望 null，实际 ' + dumpTree(r));
    },
  },
]);
