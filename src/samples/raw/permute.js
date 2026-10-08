// 样题「全排列」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：回溯决策树逐枝展开/回退（path + used + res 三数组）（Hot 100 · 回溯）
function permute(nums) {
  const res = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  const pathSnap = () => ({
    kind: 'array',
    values: [...path],
    marks: path.length > 0 ? [{ index: path.length - 1, tone: 'active' }] : [],
    title: '当前排列（高亮 = 刚选入的数）',
  });
  const usedSnap = () => ({
    kind: 'array',
    values: nums.map((v, i) => (used[i] ? '✓' : String(v))),
    marks: used.flatMap((u, i) => (u ? [{ index: i, tone: 'muted' }] : [])),
    title: '候选数字（✓ = 本分支已用过）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((r) => r.join('')),
    title: '已收集的排列',
  });
  const backtrack = () => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }
      used[i] = true;
      path.push(nums[i]);
      __rec.step({
        at: 'path.push(nums[i])',
        msg:
          path.length === nums.length
            ? `选 ${nums[i]} 后凑满 ${nums.length} 位——[${path.join(', ')}] 是一个完整排列，收入结果`
            : `选择 ${nums[i]}（第 ${path.length} 位）。回溯的本质：选一个 → 往下试 → 试完撤销回来，换下一个`,
        views: { path: pathSnap(), used: usedSnap(), res: resSnap() },
        vars: { 当前深度: String(path.length), 已收集: String(res.length) },
      });
      backtrack();
      path.pop();
      used[i] = false;
    }
  };
  __rec.step({
    at: 'const backtrack = () => {',
    msg: `${nums.length} 个数字的全排列 = 一个 ${nums.length} 层的决策树：每一层挑一个"还没用过"的数，选满 ${nums.length} 位就是一种排列`,
    views: { path: pathSnap(), used: usedSnap(), res: resSnap() },
    vars: {},
  });
  backtrack();
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,2,3] → 6 个排列',
    run: function () {
      const r = permute([1, 2, 3]);
      const want = ['123', '132', '213', '231', '312', '321'];
      const got = r.map((a) => a.join(''));
      if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error('期望 ' + want.join(',') + '，实际 ' + got.join(','));
    },
  },
  {
    label: '示例: [0,1] → [01,10]',
    run: function () {
      const r = permute([0, 1]);
      const got = r.map((a) => a.join(''));
      if (JSON.stringify(got) !== JSON.stringify(['01', '10'])) throw new Error('期望 01,10，实际 ' + got.join(','));
    },
  },
  {
    label: '边界: 单元素 [1] → [[1]]',
    run: function () {
      const r = permute([1]);
      if (JSON.stringify(r) !== JSON.stringify([[1]])) throw new Error('期望 [[1]]，实际 ' + JSON.stringify(r));
    },
  },
]);
