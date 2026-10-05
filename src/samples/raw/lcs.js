// 样题「最长公共子序列」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：二维 DP 填表（matrix 视图：行列头 + 十字参考线 + 已填/未填区分）
function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const rowLabels = ['', ...text1.split('')];
  const colLabels = ['', ...text2.split('')];
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  // 快照：展示「填到 (fi, fj) 为止」的表；fi < 0 时只显示第 0 行/列
  const snap = (fi, fj, tone) => ({
    kind: 'matrix',
    values: dp.map((row, r) =>
      row.map((v, c) => {
        const filled = r === 0 || c === 0 || r < fi || (r === fi && c <= fj);
        return filled ? String(v) : null;
      }),
    ),
    rowLabels: rowLabels,
    colLabels: colLabels,
    marks: fi >= 0 ? [{ row: fi, col: fj, tone: tone }] : [],
    activeRow: fi,
    activeCol: fj,
    title: `dp[${m + 1}][${n + 1}]：每格 = 两个前缀的最长公共子序列长度`,
  });
  __rec.step({
    at: 'const dp = Array.from',
    msg: `求 "${text1}" 与 "${text2}" 的最长公共子序列。dp 表先铺好第 0 行/列（空串对任何串的结果都是 0），从 (1,1) 开始一格一格填`,
    views: { dp: snap(-1, -1) },
    vars: { m: String(m), n: String(n) },
  });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        __rec.step({
          at: 'dp[i][j] = dp[i - 1][j - 1] + 1',
          msg: `text1[${i - 1}] = '${text1[i - 1]}' 与 text2[${j - 1}] = '${text2[j - 1]}' 相同 → 匹配！dp[${i}][${j}] = 左上 dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
          views: { dp: snap(i, j, 'ok') },
          vars: { i: String(i), j: String(j), 当前字符: `'${text1[i - 1]}'` },
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        __rec.step({
          at: 'dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])',
          msg: `'${text1[i - 1]}' ≠ '${text2[j - 1]}' → 这对字符配不上，继承一边：max(上面 ${dp[i - 1][j]}, 左边 ${dp[i][j - 1]}) = ${dp[i][j]}`,
          views: { dp: snap(i, j, 'warn') },
          vars: { i: String(i), j: String(j), 当前字符: `'${text1[i - 1]}'` },
        });
      }
    }
  }
  __rec.step({
    at: 'return dp[m][n]',
    msg: `填表完成。右下角 dp[${m}][${n}] = ${dp[m][n]} 就是两个字符串的最长公共子序列长度`,
    views: { dp: snap(m, n, 'ok') },
    vars: { 答案: String(dp[m][n]) },
  });
  return dp[m][n];
}
__rec.tests([
  {
    label: '示例: "abcde" 与 "ace"',
    run: function () {
      const r = longestCommonSubsequence('abcde', 'ace');
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '无公共子序列: "abc" 与 "def"',
    run: function () {
      const r = longestCommonSubsequence('abc', 'def');
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
  {
    label: '边界: 空串与 "abc"',
    run: function () {
      const r = longestCommonSubsequence('', 'abc');
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
