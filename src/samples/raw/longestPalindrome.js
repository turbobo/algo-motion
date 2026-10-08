// 样题「最长回文子串」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：区间 DP 按长度递推（matrix 布尔表）（Hot 100 · 多维动态规划）
function longestPalindrome(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  const mSnap = (cells) => {
    const marks = (cells || []).map((cell) => ({ row: cell[0], col: cell[1], tone: 'ok' }));
    return {
      kind: 'matrix',
      values: dp.map((row) => row.map((v) => (v ? '✓' : '·'))),
      colLabels: s.split(''),
      rowLabels: s.split(''),
      marks: marks,
      title: 'dp[i][j]：s[i..j] 是不是回文（✓ = 是）',
    };
  };
  let bestL = 0;
  let bestR = 0;
  for (let r = 0; r < n; r++) {
    dp[r][r] = true;
  }
  __rec.step({
    at: 'dp[r][r] = true',
    msg: 'dp[i][j] 表示 s[i..j] 是不是回文。单字符天然回文——对角线上先全点亮。递推：s[i] === s[j] 且 s[i+1..j-1] 是回文 → s[i..j] 也是回文（所以按"长度"从小到大填）',
    views: { m: mSnap() },
    vars: { 当前最长: s.slice(bestL, bestR + 1) },
  });
  for (let len = 2; len <= n; len++) {
    const roundCells = [];
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      if (s[i] === s[j] && (len === 2 || dp[i + 1][j - 1])) {
        dp[i][j] = true;
        roundCells.push([i, j]);
        if (len > bestR - bestL + 1) {
          bestL = i;
          bestR = j;
        }
      }
    }
    __rec.step({
      at: 'for (let i = 0; i + len - 1 < n; i++) {',
      msg:
        roundCells.length > 0
          ? `长度 ${len} 的一轮：头尾相等的有 ${roundCells.length} 对上了（绿色格）——它们要么是长度 2、要么里面那层已是回文。当前最长 "${s.slice(bestL, bestR + 1)}"`
          : `长度 ${len} 的一轮：没有任何一对头尾相等又内层回文——这轮没发现新回文`,
      views: { m: mSnap(roundCells) },
      vars: { 本轮长度: String(len), 当前最长: s.slice(bestL, bestR + 1) },
    });
  }
  __rec.step({
    at: 'return s.slice(bestL, bestR + 1)',
    msg: `所有长度都推完——最长回文子串是 "${s.slice(bestL, bestR + 1)}"`,
    views: { m: mSnap(bestR >= bestL ? [[bestL, bestR]] : []) },
    vars: { 答案: s.slice(bestL, bestR + 1) },
  });
  return s.slice(bestL, bestR + 1);
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "babad" → "bab"',
    run: function () {
      const r = longestPalindrome('babad');
      if (r !== 'bab') throw new Error('期望 bab，实际 ' + r);
    },
  },
  {
    label: '示例: "cbbd" → "bb"',
    run: function () {
      const r = longestPalindrome('cbbd');
      if (r !== 'bb') throw new Error('期望 bb，实际 ' + r);
    },
  },
  {
    label: '边界: 单字符 "a" → "a"',
    run: function () {
      const r = longestPalindrome('a');
      if (r !== 'a') throw new Error('期望 a，实际 ' + r);
    },
  },
]);
