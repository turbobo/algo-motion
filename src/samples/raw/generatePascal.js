// 样题「杨辉三角」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：逐行递推填表（matrix 三角 + 行高亮）（Hot 100 · 动态规划）
function generate(numRows) {
  const tris = [];
  const mSnap = () => ({
    kind: 'matrix',
    values: tris.map((row) => row.map((v) => String(v))),
    rowLabels: tris.map((row, i) => '第' + i + '行'),
    title: '杨辉三角（每格 = 肩上的两个数之和）',
  });
  __rec.step({
    at: 'const tris = [];',
    msg: '杨辉三角的规律：每行首尾都是 1，中间的每个数 = 上一行肩并肩的两个数之和。逐行往下推出来',
    views: { m: mSnap() },
    vars: { 行数: String(numRows) },
  });
  for (let i = 0; i < numRows; i++) {
    const row = new Array(i + 1).fill(1);
    for (let j = 1; j < i; j++) {
      row[j] = tris[i - 1][j - 1] + tris[i - 1][j];
    }
    tris.push(row);
    __rec.step({
      at: 'tris.push(row)',
      msg:
        i === 0
          ? '第 0 行只有一个 1——地基就位'
          : `第 ${i} 行：首尾是 1，中间的 [${row.slice(1, -1).join(', ') || '（无）'}] 由上一行相邻两数相加而来`,
      views: { m: mSnap() },
      vars: { 当前行: String(i) },
    });
  }
  __rec.step({
    at: 'return tris',
    msg: `推完 ${numRows} 行——每一层都从上层的肩膀上长出来`,
    views: { m: mSnap() },
    vars: { 答案: numRows + ' 行' },
  });
  return tris;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: 5 行',
    run: function () {
      const r = generate(5);
      const want = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]];
      if (JSON.stringify(r) !== JSON.stringify(want)) throw new Error('期望 5 行杨辉三角，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: 1 行 → [[1]]',
    run: function () {
      const r = generate(1);
      if (JSON.stringify(r) !== JSON.stringify([[1]])) throw new Error('期望 [[1]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 2 行',
    run: function () {
      const r = generate(2);
      if (JSON.stringify(r) !== JSON.stringify([[1], [1, 1]])) throw new Error('期望 [[1],[1,1]]，实际 ' + JSON.stringify(r));
    },
  },
]);
