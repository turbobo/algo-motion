// 样题「旋转图像」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：matrix 原地转置 + 行反转（交换对高亮）（Hot 100 · 矩阵）
function rotate(matrix) {
  const n = matrix.length;
  const snap = (marks) => ({
    kind: 'matrix',
    values: matrix.map((row) => row.map((v) => String(v))),
    marks: marks || [],
    title: 'matrix',
  });
  __rec.step({
    at: 'const n = matrix.length',
    msg: `顺时针旋转 90° 的巧办法：先沿主对角线「转置」（行列互换），再把每一行左右反转。两步都是原地交换，不需要额外矩阵`,
    views: { m: snap([]) },
    vars: { n: String(n) },
  });
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const tmp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = tmp;
      __rec.step({
        at: 'matrix[j][i] = tmp',
        msg: `转置：交换 (${i}, ${j}) ↔ (${j}, ${i})，让 matrix[i][j] 和 matrix[j][i] 互换位置`,
        views: {
          m: snap([
            { row: i, col: j, tone: 'active' },
            { row: j, col: i, tone: 'warn' },
          ]),
        },
        vars: { 交换: `(${i},${j}) ↔ (${j},${i})` },
      });
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < Math.floor(n / 2); j++) {
      const tmp = matrix[i][j];
      matrix[i][j] = matrix[i][n - 1 - j];
      matrix[i][n - 1 - j] = tmp;
      __rec.step({
        at: 'matrix[i][n - 1 - j] = tmp',
        msg: `行反转：第 ${i} 行左右对调 (${i}, ${j}) ↔ (${i}, ${n - 1 - j})——转置 + 行反转 = 顺时针旋转 90°`,
        views: {
          m: snap([
            { row: i, col: j, tone: 'active' },
            { row: i, col: n - 1 - j, tone: 'warn' },
          ]),
        },
        vars: { 反转行: String(i) },
      });
    }
  }
  __rec.step({
    at: 'return matrix',
    msg: '转置 + 行反转全部完成，矩阵原地旋转了 90°',
    views: { m: snap([]) },
    vars: {},
  });
  return matrix;
}
__rec.tests([
  {
    label: '示例: 3×3 顺时针旋转',
    run: function () {
      const r = rotate([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      const expect = [
        [7, 4, 1],
        [8, 5, 2],
        [9, 6, 3],
      ];
      if (JSON.stringify(r) !== JSON.stringify(expect)) throw new Error('期望 ' + JSON.stringify(expect) + '，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: 4×4 顺时针旋转',
    run: function () {
      const r = rotate([
        [5, 1, 9, 11],
        [2, 4, 8, 10],
        [13, 3, 6, 7],
        [15, 14, 12, 16],
      ]);
      const expect = [
        [15, 13, 2, 5],
        [14, 3, 4, 1],
        [12, 6, 8, 9],
        [16, 7, 10, 11],
      ];
      if (JSON.stringify(r) !== JSON.stringify(expect)) throw new Error('期望 ' + JSON.stringify(expect) + '，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 2×2',
    run: function () {
      const r = rotate([
        [1, 2],
        [3, 4],
      ]);
      if (JSON.stringify(r) !== JSON.stringify([[3, 1], [4, 2]])) {
        throw new Error('期望 [[3,1],[4,2]]，实际 ' + JSON.stringify(r));
      }
    },
  },
]);
