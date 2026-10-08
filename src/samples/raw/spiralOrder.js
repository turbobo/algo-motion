// 样题「螺旋矩阵」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：matrix 逐格收集 + 已访问灰化（Hot 100 · 矩阵）
function spiralOrder(matrix) {
  const visited = [];
  const res = [];
  const mSnap = () => {
    const marks = visited.slice(0, -1).map(([r, c]) => ({ row: r, col: c, tone: 'muted' }));
    const last = visited[visited.length - 1];
    if (last) marks.push({ row: last[0], col: last[1], tone: 'active' });
    return {
      kind: 'matrix',
      values: matrix.map((row) => row.map((v) => String(v))),
      marks: marks,
      title: 'matrix（灰 = 已收集，高亮 = 刚收集）',
    };
  };
  const resSnap = () => ({ kind: 'array', values: [...res], title: '收集结果' });
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  __rec.step({
    at: 'let right = matrix[0].length - 1',
    msg: '螺旋遍历 = 四条边轮流收割：上边 → 右边 → 下边 → 左边，每收完一条边就把对应的边界往里缩一格，直到上下、左右边界相遇',
    views: { m: mSnap(), res: resSnap() },
    vars: { top: '0', left: '0' },
  });
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) {
      res.push(matrix[top][j]);
      visited.push([top, j]);
      __rec.step({
        at: 'res.push(matrix[top][j])',
        msg: `→ 向右：收集 matrix[${top}][${j}] = ${matrix[top][j]}`,
        views: { m: mSnap(), res: resSnap() },
        vars: { 方向: '→' },
      });
    }
    top++;
    for (let i = top; i <= bottom; i++) {
      res.push(matrix[i][right]);
      visited.push([i, right]);
      __rec.step({
        at: 'res.push(matrix[i][right])',
        msg: `↓ 向下：收集 matrix[${i}][${right}] = ${matrix[i][right]}`,
        views: { m: mSnap(), res: resSnap() },
        vars: { 方向: '↓' },
      });
    }
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) {
        res.push(matrix[bottom][j]);
        visited.push([bottom, j]);
        __rec.step({
          at: 'res.push(matrix[bottom][j])',
          msg: `← 向左：收集 matrix[${bottom}][${j}] = ${matrix[bottom][j]}`,
          views: { m: mSnap(), res: resSnap() },
          vars: { 方向: '←' },
        });
      }
    }
    bottom--;
    if (left <= right) {
      for (let i = bottom; i >= top; i--) {
        res.push(matrix[i][left]);
        visited.push([i, left]);
        __rec.step({
          at: 'res.push(matrix[i][left])',
          msg: `↑ 向上：收集 matrix[${i}][${left}] = ${matrix[i][left]}`,
          views: { m: mSnap(), res: resSnap() },
          vars: { 方向: '↑' },
        });
      }
    }
    left++;
  }
  __rec.step({
    at: 'return res',
    msg: `四条边界相遇，螺旋遍历完成：[${res.join(', ')}]`,
    views: { m: mSnap(), res: resSnap() },
    vars: { 答案: `[${res.join(', ')}]` },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: 3×3 [[1,2,3],[4,5,6],[7,8,9]]',
    run: function () {
      const r = spiralOrder([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      if (JSON.stringify(r) !== JSON.stringify([1, 2, 3, 6, 9, 8, 7, 4, 5])) {
        throw new Error('期望 [1,2,3,6,9,8,7,4,5]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '示例: 3×4 [[1,2,3,4],[5,6,7,8],[9,10,11,12]]',
    run: function () {
      const r = spiralOrder([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ]);
      if (JSON.stringify(r) !== JSON.stringify([1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7])) {
        throw new Error('期望 [1,2,3,4,8,12,11,10,9,5,6,7]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: 单格 [[7]]',
    run: function () {
      const r = spiralOrder([[7]]);
      if (JSON.stringify(r) !== JSON.stringify([7])) throw new Error('期望 [7]，实际 ' + JSON.stringify(r));
    },
  },
]);
