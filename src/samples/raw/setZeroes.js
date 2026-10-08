// 样题「矩阵置零」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：matrix 视图原地标记与置零（Hot 100 · 矩阵）
function setZeroes(matrix) {
  const m = matrix.length;
  const n = matrix[0].length;
  const snap = (marks) => ({
    kind: 'matrix',
    values: matrix.map((row) => row.map((v) => String(v))),
    marks: marks || [],
    title: 'matrix（0 格会让它所在的整行整列都清零）',
  });
  let firstRowZero = false;
  let firstColZero = false;
  for (let j = 0; j < n; j++) {
    if (matrix[0][j] === 0) firstRowZero = true;
  }
  for (let i = 0; i < m; i++) {
    if (matrix[i][0] === 0) firstColZero = true;
  }
  __rec.step({
    at: 'let firstColZero = false',
    msg: `不能一边扫一边清零（新造的 0 会污染后面的判断）。技巧：用第 0 行和第 0 列当「标记位」——某格是 0，就把它的行头列头标成 0；首行/首列自己是否有 0 单独记两个布尔`,
    views: { m: snap([]) },
    vars: { firstRowZero: String(firstRowZero), firstColZero: String(firstColZero) },
  });
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][0] = 0;
        matrix[0][j] = 0;
        __rec.step({
          at: 'matrix[0][j] = 0',
          msg: `发现 0 在 (${i}, ${j}) → 把它的行头 matrix[${i}][0] 和列头 matrix[0][${j}] 都标成 0，作为"这一行/列要清零"的记号`,
          views: {
            m: snap([
              { row: i, col: j, tone: 'danger' },
              { row: i, col: 0, tone: 'warn' },
              { row: 0, col: j, tone: 'warn' },
            ]),
          },
          vars: { 发现: `(${i}, ${j})` },
        });
      }
    }
  }
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][0] === 0 || matrix[0][j] === 0) {
        matrix[i][j] = 0;
        __rec.step({
          at: 'matrix[i][j] = 0',
          msg: `(${i}, ${j}) 的行头或列头有标记 → 清零（当行头列头都是标记位时，第二遍扫描不会读到被污染的 0）`,
          views: { m: snap([{ row: i, col: j, tone: 'muted' }]) },
          vars: { 当前: `(${i}, ${j})` },
        });
      }
    }
  }
  if (firstRowZero) {
    for (let j = 0; j < n; j++) {
      matrix[0][j] = 0;
    }
  }
  if (firstColZero) {
    for (let i = 0; i < m; i++) {
      matrix[i][0] = 0;
    }
  }
  __rec.step({
    at: 'return matrix',
    msg: `中间区域处理完了，最后按两个布尔收尾：首行${firstRowZero ? '有' : '没有'} 0 → ${firstRowZero ? '整行清零' : '不动'}；首列${firstColZero ? '有' : '没有'} 0 → ${firstColZero ? '整列清零' : '不动'}。大功告成`,
    views: { m: snap([]) },
    vars: { firstRowZero: String(firstRowZero), firstColZero: String(firstColZero) },
  });
  return matrix;
}
__rec.tests([
  {
    label: '示例: [[0,1,2],[3,4,5],[1,2,0]]',
    run: function () {
      const r = setZeroes([
        [0, 1, 2],
        [3, 4, 5],
        [1, 2, 0],
      ]);
      const expect = [
        [0, 0, 0],
        [0, 4, 0],
        [0, 0, 0],
      ];
      if (JSON.stringify(r) !== JSON.stringify(expect)) throw new Error('期望 ' + JSON.stringify(expect) + '，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: [[1,1,1],[1,0,1],[1,1,1]]',
    run: function () {
      const r = setZeroes([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ]);
      const expect = [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1],
      ];
      if (JSON.stringify(r) !== JSON.stringify(expect)) throw new Error('期望 ' + JSON.stringify(expect) + '，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 没有 0',
    run: function () {
      const r = setZeroes([
        [1, 2],
        [3, 4],
      ]);
      if (JSON.stringify(r) !== JSON.stringify([[1, 2], [3, 4]])) throw new Error('期望不变，实际 ' + JSON.stringify(r));
    },
  },
]);
