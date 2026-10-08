// 样题「N 皇后」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：回溯 + 冲突集合剪枝（grid 棋盘 + 结果计数）（Hot 100 · 回溯）
function solveNQueens(n) {
  const res = [];
  const cols = new Set();
  const diag1 = new Set();
  const diag2 = new Set();
  const board = Array.from({ length: n }, () => new Array(n).fill('.'));
  const boardSnap = (qr, qc) => ({
    kind: 'grid',
    cells: board.map((row) => row.map((v) => String(v))),
    marks:
      qr >= 0 && qr < n && qc >= 0 && qc < n ? [{ row: qr, col: qc, tone: 'active' }] : [],
    title: '棋盘（逐行放皇后：同列 / 同对角线都会冲突）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.length > 0 ? res.map((sol, i) => `解${i + 1}: ${sol[0]} …`) : ['（还没找到解）'],
    title: `已找到的解法（共 ${res.length} 个）`,
  });
  __rec.step({
    at: 'const backtrack = (r) => {',
    msg: 'N 皇后：每行放一个皇后，且任意两个不能同列、同主对角线（r+c 相等）、同副对角线（r−c 相等）。用三个 Set 记录被占用的列与两条对角线——放之前查表，冲突就跳过这一列；放完递归下一行，走死就撤回换列',
    views: { board: boardSnap(-1, -1), res: resSnap() },
    vars: { 棋盘: `${n}×${n}` },
  });
  const backtrack = (r) => {
    if (r === n) {
      res.push(board.map((row) => row.join('')));
      __rec.step({
        at: 'res.push(board.map',
        msg: `最后一行也放下了——第 ${res.length} 个合法摆法诞生！（继续回溯还能找下一个）`,
        views: { board: boardSnap(-1, -1), res: resSnap() },
        vars: { 已找到: String(res.length) },
      });
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag1.has(r + c) || diag2.has(r - c)) {
        continue;
      }
      cols.add(c);
      diag1.add(r + c);
      diag2.add(r - c);
      board[r][c] = 'Q';
      __rec.step({
        at: "board[r][c] = 'Q'",
        msg: `第 ${r} 行的皇后放在第 ${c} 列：列 ${c} 空闲、对角线 ${r}+${c}=${r + c} 与 ${r}−${c}=${r - c} 也没人占——放下！递归去选第 ${r + 1} 行`,
        views: { board: boardSnap(r, c), res: resSnap() },
        vars: { 当前行: String(r), 当前列: String(c) },
      });
      backtrack(r + 1);
      board[r][c] = '.';
      cols.delete(c);
      diag1.delete(r + c);
      diag2.delete(r - c);
    }
  };
  backtrack(0);
  __rec.step({
    at: 'return res',
    msg: res.length > 0 ? `${n} 皇后共有 ${res.length} 种摆法` : `${n} 皇后没有任何合法摆法——返回空`,
    views: { board: boardSnap(-1, -1), res: resSnap() },
    vars: { 答案: `${res.length} 种` },
  });
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: n=4 → 2 种解',
    run: function () {
      const r = solveNQueens(4);
      const want = [
        ['.Q..', '...Q', 'Q...', '..Q.'],
        ['..Q.', 'Q...', '...Q', '.Q..'],
      ];
      if (JSON.stringify(r) !== JSON.stringify(want)) throw new Error('期望 2 种标准解，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: n=1 → [[Q]]',
    run: function () {
      const r = solveNQueens(1);
      if (JSON.stringify(r) !== JSON.stringify([['Q']])) throw new Error('期望 [[Q]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: n=2 → []（无解）',
    run: function () {
      const r = solveNQueens(2);
      if (JSON.stringify(r) !== JSON.stringify([])) throw new Error('期望 []，实际 ' + JSON.stringify(r));
    },
  },
]);
