// 样题「二叉树中的最大路径和」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：后序 DP 单边贡献 + 全局最优（tree 视图）（Hot 100 · 二叉树）
function maxPathSum(root) {
  const ids = new Map();
  let cnt = 0;
  (function number(node) {
    if (!node) return;
    ids.set(node, 'n' + ++cnt);
    number(node.left);
    number(node.right);
  })(root);
  const done = new Set();
  const treeSnap = (cur) => {
    const marks = [...done]
      .filter((n) => ids.has(n) && n !== cur)
      .map((n) => ({ id: ids.get(n), tone: 'ok' }));
    if (cur && ids.has(cur)) marks.push({ id: ids.get(cur), tone: 'active' });
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
      title: '二叉树（绿色 = 贡献值已算出）',
    };
  };
  let best = -Infinity;
  const gain = (node) => {
    if (node === null) {
      return 0;
    }
    const left = Math.max(gain(node.left), 0);
    const right = Math.max(gain(node.right), 0);
    const through = node.val + left + right;
    best = Math.max(best, through);
    __rec.step({
      at: 'return node.val + Math.max(left, right)',
      msg: `节点 ${node.val}：左右孩子的最大贡献是 ${left} 和 ${right}（负贡献按 0 处理，不如不带）。① 路径在这里拐弯：和 = ${node.val}+${left}+${right} = ${through}，全局 best 更新为 ${best}；② 向上层只传单边最大贡献：${node.val} + max(${left},${right}) = ${node.val + Math.max(left, right)}`,
      views: { tree: treeSnap(node) },
      vars: { 左贡献: String(left), 右贡献: String(right), 拐弯和: String(through), best: String(best) },
    });
    done.add(node);
    return node.val + Math.max(left, right);
  };
  gain(root);
  __rec.step({
    at: 'return best',
    msg: `全部节点算完——整棵树里的最大路径和为 ${best}`,
    views: { tree: treeSnap(null) },
    vars: { 答案: String(best) },
  });
  return best;
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
    label: '示例: [1,2,3] → 6（2+1+3）',
    run: function () {
      const r = maxPathSum(buildTree([1, 2, 3]));
      if (r !== 6) throw new Error('期望 6，实际 ' + r);
    },
  },
  {
    label: '示例: [-10,9,20,null,null,15,7] → 42（15+20+7）',
    run: function () {
      const r = maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7]));
      if (r !== 42) throw new Error('期望 42，实际 ' + r);
    },
  },
  {
    label: '边界: 全负数 [-3] → -3',
    run: function () {
      const r = maxPathSum(buildTree([-3]));
      if (r !== -3) throw new Error('期望 -3，实际 ' + r);
    },
  },
]);
