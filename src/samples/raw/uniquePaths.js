// 样题「不同路径」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：二维 DP 逐行填表（matrix 表）（Hot 100 · 多维动态规划）
function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  const mSnap = (r, c) => {
    const view = {
      kind: 'matrix',
      values: dp.map((row) => row.map((v) => String(v))),
      title: 'dp[r][c]：走到格子 (r, c) 的路径数',
    };
    if (r >= 0 && r < m) view.activeRow = r;
    if (c >= 0 && c < n) view.activeCol = c;
    return view;
  };
  __rec.step({
    at: 'const dp = Array.from({ length: m }',
    msg: `机器人从左上角走到右下角，每步只能向右或向下。第一行和第一列全填 1（只有一条直路）；其余格子 = 从上面来的路径数 + 从左边来的路径数`,
    views: { m: mSnap(-1, -1) },
    vars: { 行数: String(m), 列数: String(n) },
  });
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
    }
    __rec.step({
      at: 'dp[r][c] = dp[r - 1][c] + dp[r][c - 1]',
      msg: `第 ${r} 行填完：每格 = 上方格子 + 左方格子（两条来路）——右下角（${m - 1}, ${n - 1}）目前是 ${dp[m - 1][n - 1]}`,
      views: { m: mSnap(r, -1) },
      vars: { 当前行: String(r) },
    });
  }
  __rec.step({
    at: 'return dp[m - 1][n - 1]',
    msg: `填到右下角——一共 ${dp[m - 1][n - 1]} 条不同路径`,
    views: { m: mSnap(m - 1, n - 1) },
    vars: { 答案: String(dp[m - 1][n - 1]) },
  });
  return dp[m - 1][n - 1];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: 3×7 网格 → 28',
    run: function () {
      const r = uniquePaths(3, 7);
      if (r !== 28) throw new Error('期望 28，实际 ' + r);
    },
  },
  {
    label: '示例: 3×2 网格 → 3',
    run: function () {
      const r = uniquePaths(3, 2);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '边界: 1×1 网格 → 1（原地不动）',
    run: function () {
      const r = uniquePaths(1, 1);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
