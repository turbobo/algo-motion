// 样题「最小路径和」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：二维 DP 就地填表（matrix + 边界先行）（Hot 100 · 多维动态规划）
function minPathSum(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const dp = grid.map((row) => [...row]);
  const mSnap = (r, c) => {
    const view = {
      kind: 'matrix',
      values: dp.map((row) => row.map((v) => String(v))),
      title: 'dp[r][c]：走到格子 (r, c) 的最小路径和',
    };
    if (r >= 0 && r < m) view.activeRow = r;
    if (c >= 0 && c < n) view.activeCol = c;
    return view;
  };
  for (let r = 1; r < m; r++) {
    dp[r][0] += dp[r - 1][0];
  }
  for (let c = 1; c < n; c++) {
    dp[0][c] += dp[0][c - 1];
  }
  __rec.step({
    at: 'for (let c = 1; c < n; c++) {',
    msg: '第一行只能一路从左边来、第一列只能一路从上面来——先就地累加好。其余格子 = min(从上来, 从左来) + 本格代价',
    views: { m: mSnap(-1, -1) },
    vars: {},
  });
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] += Math.min(dp[r - 1][c], dp[r][c - 1]);
      __rec.step({
        at: 'dp[r][c] += Math.min(dp[r - 1][c], dp[r][c - 1])',
        msg: `格子 (${r}, ${c})：从上面来要花 ${dp[r - 1][c]}、从左边来要花 ${dp[r][c - 1]}——走省的那条，本格累计最小和 ${dp[r][c]}`,
        views: { m: mSnap(r, c) },
        vars: { 位置: `(${r},${c})`, 最小和: String(dp[r][c]) },
      });
    }
  }
  __rec.step({
    at: 'return dp[m - 1][n - 1]',
    msg: `走到右下角——最小路径和为 ${dp[m - 1][n - 1]}`,
    views: { m: mSnap(m - 1, n - 1) },
    vars: { 答案: String(dp[m - 1][n - 1]) },
  });
  return dp[m - 1][n - 1];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [[1,3,1],[1,5,1],[4,2,1]] → 7',
    run: function () {
      const r = minPathSum([
        [1, 3, 1],
        [1, 5, 1],
        [4, 2, 1],
      ]);
      if (r !== 7) throw new Error('期望 7，实际 ' + r);
    },
  },
  {
    label: '示例: [[1,2,3],[4,5,6]] → 12',
    run: function () {
      const r = minPathSum([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      if (r !== 12) throw new Error('期望 12，实际 ' + r);
    },
  },
  {
    label: '边界: 单格 [[5]] → 5',
    run: function () {
      const r = minPathSum([[5]]);
      if (r !== 5) throw new Error('期望 5，实际 ' + r);
    },
  },
]);
