// 样题「单词搜索」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：网格 DFS 回溯（# 标记 + 路径高亮）（Hot 100 · 回溯）
function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;
  const trail = [];
  const gridSnap = (curR, curC) => {
    const marks = trail.map((p) => ({
      row: p[0],
      col: p[1],
      tone: p[0] === curR && p[1] === curC ? 'active' : 'ok',
    }));
    if (curR !== undefined && !trail.some((p) => p[0] === curR && p[1] === curC)) {
      marks.push({ row: curR, col: curC, tone: 'active' });
    }
    return {
      kind: 'grid',
      cells: board.map((row) => row.map((v) => String(v))),
      marks: marks,
      title: '棋盘（高亮 = 当前匹配路径，# = 本路径已用）',
    };
  };
  const wordSnap = (idx) => ({
    kind: 'array',
    values: word.split(''),
    pointers: idx >= 0 && idx < word.length ? { 进度: idx } : {},
    marks: idx >= 0 && idx < word.length ? [{ index: idx, tone: 'active' }] : [],
    title: '目标单词',
  });
  const __stack = [];
  const dfs = (r, c, idx) => {
    __stack.push(`dfs(第${idx + 1}位@(${r},${c}))`);
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[idx]) {
      __stack.pop();
      return false;
    }
    if (idx === word.length - 1) {
      __rec.step({
        at: 'if (idx === word.length - 1)',
        msg: `最后一个字符 '${word[idx]}' 在 (${r},${c}) 也对上了——整条路径拼出 "${word}"，找到！`,
        views: { grid: gridSnap(r, c), word: wordSnap(idx) },
        vars: { 位置: `(${r},${c})` },
        stack: [...__stack],
      });
      __stack.pop();
      return true;
    }
    const tmp = board[r][c];
    board[r][c] = '#';
    trail.push([r, c]);
    __rec.step({
      at: "board[r][c] = '#'",
      msg: `匹配第 ${idx + 1} 个字符 '${word[idx]}'：落在 (${r},${c})。先把它改成 #（本路径不能走回头路），再向上下左右四个方向继续匹配下一个字符`,
      views: { grid: gridSnap(r, c), word: wordSnap(idx) },
      vars: { 位置: `(${r},${c})`, 进度: `${idx + 1}/${word.length}` },
      stack: [...__stack],
    });
    const found =
      dfs(r + 1, c, idx + 1) ||
      dfs(r - 1, c, idx + 1) ||
      dfs(r, c + 1, idx + 1) ||
      dfs(r, c - 1, idx + 1);
    board[r][c] = tmp;
    trail.pop();
    __stack.pop();
    return found;
  };
  __rec.step({
    at: 'for (let r = 0; r < rows; r++) {',
    msg: `在棋盘里找 "${word}"：从每个格子出发 DFS——字符对上就往四个方向深入，走不通就回溯还原（# 改回原字母），换个方向再试`,
    views: { grid: gridSnap(undefined, undefined), word: wordSnap(0) },
    vars: {},
    stack: ['dfs(第1位@起点)'],
  });
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) {
        return true;
      }
    }
  }
  return false;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: board + "ABCCED" → true',
    run: function () {
      const r = exist(
        [
          ['A', 'B', 'C', 'E'],
          ['S', 'F', 'C', 'S'],
          ['A', 'D', 'E', 'E'],
        ],
        'ABCCED',
      );
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: 同一个 board + "SEE" → true',
    run: function () {
      const r = exist(
        [
          ['A', 'B', 'C', 'E'],
          ['S', 'F', 'C', 'S'],
          ['A', 'D', 'E', 'E'],
        ],
        'SEE',
      );
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '边界: "ABCB" → false（不能走回头路）',
    run: function () {
      const r = exist(
        [
          ['A', 'B', 'C', 'E'],
          ['S', 'F', 'C', 'S'],
          ['A', 'D', 'E', 'E'],
        ],
        'ABCB',
      );
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
]);
