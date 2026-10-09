// 样题「将有序数组转换为二叉搜索树」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：分治取中点 + 树逐步长出（tree + array 区间）（Hot 100 · 二叉树）
function sortedArrayToBST(nums) {
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
    title: '正在构建的 BST（高亮 = 刚创建的节点）',
  });
  const arrSnap = (lo, hi, mid) => ({
    kind: 'array',
    values: [...nums],
    ranges: lo <= hi ? [{ from: lo, to: hi, label: '本子树区间', tone: 'warn' }] : [],
    marks: mid >= 0 && mid < nums.length ? [{ index: mid, tone: 'active' }] : [],
    title: 'nums（有序数组）',
  });
  if (nums.length === 0) {
    __rec.step({
      at: 'return null',
      msg: '空数组建不出树——直接返回 null',
      views: { tree: treeSnap(), arr: arrSnap(0, -1, -1) },
      vars: {},
      stack: ['build(空区间)'],
    });
    return null;
  }
  const __stack = [];
  const build = (lo, hi) => {
    __stack.push(`build([${lo}..${hi}])`);
    if (lo > hi) {
      __stack.pop();
      return null;
    }
    const mid = Math.floor((lo + hi) / 2);
    const node = { val: nums[mid], left: null, right: null };
    built.set(node, 'n' + ++cnt);
    lastId = 'n' + cnt;
    __rec.step({
      at: 'const node = { val: nums[mid], left: null, right: null }',
      msg: `区间 [${lo}, ${hi}] 取中点 mid = ${mid}（值 ${nums[mid]}）作为这棵子树的根——中点保证左右子树高度差不超过 1，天然平衡`,
      views: { tree: treeSnap(), arr: arrSnap(lo, hi, mid) },
      vars: { lo: String(lo), hi: String(hi), mid: String(mid) },
      stack: [...__stack],
    });
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    __stack.pop();
    return node;
  };
  const result = build(0, nums.length - 1);
  __rec.step({
    at: 'return build(0, nums.length - 1)',
    msg: '所有区间都递归完毕——一棵高度平衡的 BST 构建完成',
    views: { tree: treeSnap(), arr: arrSnap(0, nums.length - 1, -1) },
    vars: { 答案: '平衡 BST' },
    stack: [`build([0..${nums.length - 1}])`],
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
function inorder(root, acc) {
  if (!root) return acc;
  inorder(root.left, acc);
  acc.push(root.val);
  inorder(root.right, acc);
  return acc;
}
__rec.tests([
  {
    label: '示例: [-10,-3,0,5,9] → [0,-10,5,null,-3,null,9]',
    run: function () {
      const r = sortedArrayToBST([-10, -3, 0, 5, 9]);
      if (dumpTree(r) !== '[0,-10,5,null,-3,null,9]') throw new Error('期望 [0,-10,5,null,-3,null,9]，实际 ' + dumpTree(r));
      if (JSON.stringify(inorder(r, [])) !== JSON.stringify([-10, -3, 0, 5, 9])) {
        throw new Error('中序应等于原数组，实际 ' + JSON.stringify(inorder(r, [])));
      }
    },
  },
  {
    label: '边界: 单元素 [1]',
    run: function () {
      const r = sortedArrayToBST([1]);
      if (dumpTree(r) !== '[1]') throw new Error('期望 [1]，实际 ' + dumpTree(r));
    },
  },
  {
    label: '边界: 空数组',
    run: function () {
      const r = sortedArrayToBST([]);
      if (r !== null) throw new Error('期望 null，实际 ' + dumpTree(r));
    },
  },
]);
