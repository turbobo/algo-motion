// 样题「搜索二维矩阵 II」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：matrix 从右上角 Z 字逼近（十字参考线 + 当前格）（Hot 100 · 矩阵）
function searchMatrix(matrix, target) {
  const m = matrix.length;
  const n = matrix[0].length;
  const snap = (row, col, tone) => ({
    kind: 'matrix',
    values: matrix.map((r) => r.map((v) => String(v))),
    marks: row >= 0 ? [{ row: row, col: col, tone: tone || 'active' }] : [],
    activeRow: row,
    activeCol: col,
    title: `matrix（目标 target = ${target}）`,
  });
  let row = 0;
  let col = n - 1;
  __rec.step({
    at: 'let col = n - 1',
    msg: `行列都递增的矩阵有个绝妙入口：右上角。它所在行中最小、所在列中最大——和 target 比大小就能排除一整行或一整列，走出 Z 字形逼近路线`,
    views: { m: snap(-1, -1, null) },
    vars: { target: String(target), 起点: '右上角' },
  });
  while (row < m && col >= 0) {
    const cur = matrix[row][col];
    const verdict = cur === target ? '正好命中！' : cur > target ? `比目标大 → 这一列下面的都更大，排除本列，col 左移` : `比目标小 → 这一行右边的都更大，排除本行，row 下移`;
    __rec.step({
      at: 'const cur = matrix[row][col]',
      msg: `站在 (${row}, ${col})：${cur} ${verdict}`,
      views: { m: snap(row, col, cur === target ? 'ok' : 'active') },
      vars: { row: String(row), col: String(col), 当前值: String(cur) },
    });
    if (cur === target) {
      __rec.step({
        at: 'return true',
        msg: `在 (${row}, ${col}) 找到 ${target}——每步都能排除一整行或整列，最多走 m + n 步`,
        views: { m: snap(row, col, 'ok') },
        vars: { 答案: 'true' },
      });
      return true;
    } else if (cur > target) {
      col--;
    } else {
      row++;
    }
  }
  __rec.step({
    at: 'return false',
    msg: `走出了矩阵边界也没找到 ${target}——说明它不存在`,
    views: { m: snap(-1, -1, null) },
    vars: { 答案: 'false' },
  });
  return false;
}
__rec.tests([
  {
    label: '示例: 5×5 矩阵找 5 → true',
    run: function () {
      const grid = [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30],
      ];
      const r = searchMatrix(grid, 5);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: 找 20 → false',
    run: function () {
      const grid = [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30],
      ];
      const r = searchMatrix(grid, 20);
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 单格命中',
    run: function () {
      const r = searchMatrix([[7]], 7);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
]);
