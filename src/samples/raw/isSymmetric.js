// 样题「对称二叉树」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：镜像递归比较（tree 视图镜像对高亮）（Hot 100 · 二叉树）
function isSymmetric(root) {
  const ids = new Map();
  let cnt = 0;
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    number(node.left);
    number(node.right);
  })(root);
  const treeSnap = (activeA, activeB, tone) => {
    const marks = [];
    if (activeA && ids.has(activeA)) marks.push({ id: ids.get(activeA), tone: tone || 'active' });
    if (activeB && ids.has(activeB) && activeA !== activeB) marks.push({ id: ids.get(activeB), tone: tone || 'active' });
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
      title: '二叉树（高亮的一对 = 正在比较的镜像位置）',
    };
  };
  if (root === null) {
    __rec.step({
      at: 'return true',
      msg: '空树对称（递归的停机条件之一）',
      views: { tree: treeSnap(null, null, null) },
      vars: {},
    });
    return true;
  }
  const check = (a, b) => {
    if (a === null && b === null) {
      return true;
    }
    if (a === null || b === null || a.val !== b.val) {
      const aText = a === null ? 'null' : String(a.val);
      const bText = b === null ? 'null' : String(b.val);
      __rec.step({
        at: 'return false',
        msg: `镜像位置出现 ${aText} vs ${bText} —— 一边有一边没有，或值不相等 → 不对称，返回 false`,
        views: { tree: treeSnap(a, b, 'danger') },
        vars: { 比较: `${aText} vs ${bText}` },
      });
      return false;
    }
    __rec.step({
      at: 'return check(a.left, b.right) && check(a.right, b.left)',
      msg: `镜像位置 ${a.val} = ${b.val} ✓。继续往下一层：a 的左孩子要对上 b 的右孩子，a 的右孩子要对上 b 的左孩子（交叉比较）`,
      views: { tree: treeSnap(a, b, 'ok') },
      vars: { 对: `${a.val} ↔ ${b.val}` },
    });
    return check(a.left, b.right) && check(a.right, b.left);
  };
  __rec.step({
    at: 'return check(root.left, root.right)',
    msg: '对称 = 根的左右子树互为镜像。定义 check(a, b)：a 和 b 的值相等，且 a.left 与 b.right 镜像、a.right 与 b.left 镜像',
    views: { tree: treeSnap(root, null, null) },
    vars: {},
  });
  return check(root.left, root.right);
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
    label: '示例: [1,2,2,3,4,4,3] → true',
    run: function () {
      const r = isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3]));
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: [1,2,2,null,3,null,3] → false',
    run: function () {
      const r = isSymmetric(buildTree([1, 2, 2, null, 3, null, 3]));
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 单节点 [1] → true',
    run: function () {
      const r = isSymmetric(buildTree([1]));
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
]);
