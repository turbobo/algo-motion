// 样题「子集」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：回溯枚举决策树所有节点（path + res）（Hot 100 · 回溯）
function subsets(nums) {
  const res = [];
  const path = [];
  const pathSnap = () => ({
    kind: 'array',
    values: path.length > 0 ? [...path] : ['(空集)'],
    marks: path.length > 0 ? [{ index: path.length - 1, tone: 'active' }] : [],
    title: '当前子集',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((r) => (r.length > 0 ? r.join(',') : '∅')),
    title: `已收集的子集（共 ${res.length} 个）`,
  });
  const __stack = [];
  const backtrack = (start) => {
    __stack.push(`subsets(${start})`);
    res.push([...path]);
    __rec.step({
      at: 'res.push([...path])',
      msg:
        path.length === 0
          ? '空集 ∅ 是第一个子集——回溯法把"走过的每个节点"都当作一个答案，而不是只收叶子'
          : `当前路径 [${path.join(', ')}] 本身就是一个子集，收入结果。注意：每进入一个节点先收割，再决定"还要不要加下一个数"`,
      views: { path: pathSnap(), res: resSnap() },
      vars: { 已收集: String(res.length) },
      stack: [...__stack],
    });
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
    __stack.pop();
  };
  __rec.step({
    at: 'backtrack(0)',
    msg: `nums = [${nums.join(', ')}] 的每个数都有"选 / 不选"两种命运 → 一共 2^${nums.length} 个子集。用 start 参数保证只往右选，避免 [1,2] 和 [2,1] 这样的重复`,
    views: { path: pathSnap(), res: resSnap() },
    vars: {},
    stack: ['subsets(0)'],
  });
  backtrack(0);
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,2,3] → 8 个子集',
    run: function () {
      const r = subsets([1, 2, 3]);
      const want = ['', '1', '12', '123', '13', '2', '23', '3'];
      const got = r.map((a) => a.join(''));
      if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error('期望 ' + want.join('|') + '，实际 ' + got.join('|'));
    },
  },
  {
    label: '示例: [0] → [∅,[0]]',
    run: function () {
      const r = subsets([0]);
      if (JSON.stringify(r) !== JSON.stringify([[], [0]])) throw new Error('期望 [[],[0]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 空数组 → [∅]',
    run: function () {
      const r = subsets([]);
      if (JSON.stringify(r) !== JSON.stringify([[]])) throw new Error('期望 [[]]，实际 ' + JSON.stringify(r));
    },
  },
]);
