// 样题「路径总和 III」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：前缀和 DFS + 回溯（tree + hashmap 前缀计数）（Hot 100 · 二叉树）
function pathSum(root, targetSum) {
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
    title: '二叉树（高亮 = 当前所在节点）',
  });
  const prefixSnap = (hi) => ({
    kind: 'hashmap',
    entries: [...prefix.entries()].map(([k, v]) => [String(k), `${v} 次`]),
    highlightKeys: hi !== null && hi !== undefined && prefix.has(hi) && prefix.get(hi) > 0 ? [String(hi)] : [],
    title: `prefix：当前根路径上的前缀和 → 出现次数（目标 ${targetSum}）`,
  });
  let count = 0;
  const prefix = new Map();
  prefix.set(0, 1);
  const dfs = (node, sum) => {
    if (node === null) {
      return;
    }
    sum += node.val;
    if (prefix.has(sum - targetSum)) {
      count += prefix.get(sum - targetSum);
    }
    const hits = prefix.get(sum - targetSum) || 0;
    prefix.set(sum, (prefix.get(sum) || 0) + 1);
    __rec.step({
      at: 'prefix.set(sum, (prefix.get(sum) || 0) + 1)',
      msg: `走到 ${node.val}：根到它的路径和 sum = ${sum}；查 sum − target = ${sum - targetSum} 在祖先路径上出现过 ${hits} 次 → ${hits > 0 ? `新增 ${hits} 条合法路径，count = ${count}` : '本轮没有以它为终点的路径'}。把 ${sum} 记进 prefix 继续往下`,
      views: { tree: treeSnap(node), prefix: prefixSnap(sum - targetSum) },
      vars: { 当前: String(node.val), sum: String(sum), count: String(count) },
    });
    dfs(node.left, sum);
    dfs(node.right, sum);
    prefix.set(sum, prefix.get(sum) - 1);
  };
  dfs(root, 0);
  __rec.step({
    at: 'return count',
    msg: `DFS 全部回溯完毕——和为 ${targetSum} 的向下路径共有 ${count} 条。注意 prefix 在每层回溯时"减回去"，保证它始终只反映当前根路径`,
    views: { tree: treeSnap(null), prefix: prefixSnap(null) },
    vars: { 答案: String(count) },
  });
  return count;
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
    label: '示例: [10,5,-3,3,2,null,11,3,-2,null,1], target=8 → 3',
    run: function () {
      const r = pathSum(buildTree([10, 5, -3, 3, 2, null, 11, 3, -2, null, 1]), 8);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '示例: [5,4,8,11,null,13,4,7,2,null,null,5,1], target=22 → 3',
    run: function () {
      const r = pathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]), 22);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '边界: 空树 → 0',
    run: function () {
      const r = pathSum(null, 1);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
