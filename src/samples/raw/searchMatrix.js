// 样题「搜索二维矩阵」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：把矩阵拉直成一维做二分（matrix 十字高亮）（Hot 100 · 二分查找）
function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const mSnap = (r, c, lo, hi) => {
    const view = {
      kind: 'matrix',
      values: matrix.map((row) => [...row]),
      marks: r >= 0 && r < rows && c >= 0 && c < cols ? [{ row: r, col: c, tone: 'active' }] : [],
      title: `二维矩阵（下标 = 拉直数组的 [${lo}, ${hi}] 窗口）`,
    };
    if (r >= 0 && r < rows) view.activeRow = r;
    if (c >= 0 && c < cols) view.activeCol = c;
    return view;
  };
  let lo = 0;
  let hi = rows * cols - 1;
  __rec.step({
    at: 'let lo = 0;',
    msg: '矩阵每行递增、且每行第一个又大于上一行最后一个——干脆把它当一条拉直的长数组：下标 k 对应的格子是 [⌊k / 列数⌋][k % 列数]。然后就是普通二分',
    views: { m: mSnap(-1, -1, lo, hi) },
    vars: { 窗口: `[${lo}, ${hi}]` },
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const r = Math.floor(mid / cols);
    const c = mid % cols;
    if (matrix[r][c] === target) {
      __rec.step({
        at: 'if (matrix[r][c] === target)',
        msg: `下标 ${mid} 展开成 (${r}, ${c})，值 ${matrix[r][c]} 就是 ${target}——命中！`,
        views: { m: mSnap(r, c, lo, hi) },
        vars: { 答案: 'true' },
      });
      return true;
    }
    if (matrix[r][c] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
    __rec.step({
      at: 'const r = Math.floor(mid / cols)',
      msg: `mid = ${mid} 展开成 (${r}, ${c})：值 ${matrix[r][c]} ${matrix[r][c] < target ? '< ' + target + ' → 窗口收缩到右半' : '> ' + target + ' → 窗口收缩到左半'}，窗口 [${lo}, ${hi}]`,
      views: { m: mSnap(r, c, lo, hi) },
      vars: { 窗口: `[${lo}, ${hi}]` },
    });
  }
  __rec.step({
    at: 'return false',
    msg: `窗口为空也没找到 ${target}——返回 false`,
    views: { m: mSnap(-1, -1, lo, hi) },
    vars: { 答案: 'false' },
  });
  return false;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: 3×4 矩阵找 3 → true',
    run: function () {
      const r = searchMatrix(
        [
          [1, 3, 5, 7],
          [10, 11, 16, 20],
          [23, 30, 34, 60],
        ],
        3,
      );
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: 同一个矩阵找 13 → false',
    run: function () {
      const r = searchMatrix(
        [
          [1, 3, 5, 7],
          [10, 11, 16, 20],
          [23, 30, 34, 60],
        ],
        13,
      );
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素矩阵找 1 → true',
    run: function () {
      const r = searchMatrix([[1]], 1);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
]);
