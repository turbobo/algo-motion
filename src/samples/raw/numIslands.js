// 样题「岛屿数量」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：grid 视图（地图色 + 扩散标记）+ array 视图（BFS 队列）
function numIslands(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const gridSnap = (marks) => ({
    kind: 'grid',
    cells: grid.map((row) => [...row]),
    marks: marks || [],
    title: `${m} × ${n} 地图（1 = 陆地，0 = 水/已探索）`,
  });
  const queueSnap = (q, hi) => ({
    kind: 'array',
    values: q.map(([r, c]) => `${r},${c}`),
    marks: hi !== undefined ? [{ index: hi, tone: 'active' }] : [],
    title: 'BFS 队列（等待扩散的陆地坐标）',
  });
  let count = 0;
  __rec.step({
    at: 'let count = 0',
    msg: `数一数 ${m} × ${n} 的地图上有几座岛屿：扫描每个格子，遇到陆地就把整座岛用 BFS 探索完（标记成水），岛屿数 +1`,
    views: { grid: gridSnap([]), queue: queueSnap([]) },
    vars: { count: '0' },
  });
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '1') {
        count++;
        __rec.step({
          at: 'count++',
          msg: `发现陆地 (${i}, ${j}) —— 这是一座新岛屿（第 ${count} 座）！立刻开始 BFS 把它整座探索完`,
          views: { grid: gridSnap([{ row: i, col: j, tone: 'ok' }]), queue: queueSnap([]) },
          vars: { count: String(count) },
        });
        grid[i][j] = '0';
        const queue = [[i, j]];
        while (queue.length > 0) {
          const [r, c] = queue.shift();
          __rec.step({
            at: 'const [r, c] = queue.shift()',
            msg: `出队 (${r}, ${c})，检查它的上下左右四个邻居有没有还没探索的陆地`,
            views: { grid: gridSnap([{ row: r, col: c, tone: 'active' }]), queue: queueSnap(queue) },
            vars: { count: String(count), 当前: `(${r}, ${c})` },
          });
          const dirs = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === '1') {
              grid[nr][nc] = '0';
              queue.push([nr, nc]);
              __rec.step({
                at: 'queue.push([nr, nc])',
                msg: `邻居 (${nr}, ${nc}) 是陆地 → 吃掉并入队（入队后就是新的扩散前沿）`,
                views: {
                  grid: gridSnap([{ row: nr, col: nc, tone: 'warn' }]),
                  queue: queueSnap(queue, queue.length - 1),
                },
                vars: { count: String(count), 当前: `(${nr}, ${nc})` },
              });
            }
          }
        }
      }
    }
  }
  __rec.step({
    at: 'return count',
    msg: `扫描结束，所有陆地都被探索并标成了水。这座地图上共有 ${count} 座岛屿`,
    views: { grid: gridSnap([]), queue: queueSnap([]) },
    vars: { 答案: String(count) },
  });
  return count;
}
__rec.tests([
  {
    label: '示例: 2 座岛',
    run: function () {
      const r = numIslands([
        ['1', '1', '0', '0'],
        ['1', '0', '1', '0'],
        ['0', '0', '1', '1'],
        ['0', '0', '0', '0'],
      ]);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '全水: 0 座岛',
    run: function () {
      const r = numIslands([
        ['0', '0'],
        ['0', '0'],
      ]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
  {
    label: '全陆: 1 座岛',
    run: function () {
      const r = numIslands([
        ['1', '1'],
        ['1', '1'],
      ]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
