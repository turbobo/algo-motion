// 样题「腐烂的橘子」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：多源 BFS 逐分钟扩散（grid 视图 + 腐烂/新增标记）（Hot 100 · 图论）
function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const gridSnap = (newly) => ({
    kind: 'grid',
    cells: grid.map((row) => row.map((v) => String(v))),
    marks: grid.flatMap((row, r) =>
      row.flatMap((v, c) =>
        v === 2
          ? [{ row: r, col: c, tone: newly.has(r + ':' + c) ? 'ok' : 'danger' }]
          : [],
      ),
    ),
    title: '网格（沙色 = 新鲜橘子 1，红色 2 = 腐烂，绿 = 本轮新烂）',
  });
  const queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) {
        queue.push([r, c]);
      } else if (grid[r][c] === 1) {
        fresh++;
      }
    }
  }
  __rec.step({
    at: 'if (fresh === 0)',
    msg: `先跑一遍全场：所有腐烂橘子（${queue.length} 个）入队，统计新鲜橘子共 ${fresh} 个——这些腐烂橘子是"多源 BFS"的多个起点`,
    views: { grid: gridSnap(new Set()) },
    vars: { 新鲜: String(fresh), 腐烂源: String(queue.length) },
  });
  if (fresh === 0) {
    return 0;
  }
  let minutes = 0;
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  while (queue.length > 0 && fresh > 0) {
    const levelSize = queue.length;
    minutes++;
    const newly = new Set();
    for (let i = 0; i < levelSize; i++) {
      const cell = queue.shift();
      const r = cell[0];
      const c = cell[1];
      for (const d of dirs) {
        const nr = r + d[0];
        const nc = c + d[1];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          newly.add(nr + ':' + nc);
          queue.push([nr, nc]);
        }
      }
    }
    __rec.step({
      at: 'if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1)',
      msg: `第 ${minutes} 分钟：这一轮 ${newly.size} 个新鲜橘子被邻居感染（绿色格子）——同一分钟里所有腐烂橘子同时向外扩一圈，这就是 BFS 的"层"`,
      views: { grid: gridSnap(newly) },
      vars: { 分钟: String(minutes), 剩余新鲜: String(fresh) },
    });
  }
  __rec.step({
    at: 'return fresh > 0 ? -1 : minutes',
    msg: fresh > 0 ? `扩散停下来了，但还有 ${fresh} 个新鲜橘子够不着——返回 -1（永远不会全烂）` : `全部腐烂——总共用了 ${minutes} 分钟`,
    views: { grid: gridSnap(new Set()) },
    vars: { 答案: fresh > 0 ? '-1' : String(minutes) },
  });
  return fresh > 0 ? -1 : minutes;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [[2,1,1],[1,1,0],[0,1,1]] → 4',
    run: function () {
      const r = orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '边界: 没有新鲜橘子 [[0,2]] → 0',
    run: function () {
      const r = orangesRotting([[0, 2]]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
  {
    label: '示例: 够不着 [[2,1,1],[0,1,1],[1,0,1]] → -1',
    run: function () {
      const r = orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]);
      if (r !== -1) throw new Error('期望 -1，实际 ' + r);
    },
  },
]);
