// 样题「编辑距离」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：二维 DP 增删改三选一（matrix 表 + 行列字符头）（Hot 100 · 多维动态规划）
function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const mSnap = (r) => {
    const view = {
      kind: 'matrix',
      values: dp.map((row) => row.map((v) => String(v))),
      rowLabels: ['∅'].concat(word1.split('')),
      colLabels: ['∅'].concat(word2.split('')),
      title: 'dp[i][j]：word1 前 i 个字符 → word2 前 j 个字符的最少操作数',
    };
    if (r >= 0 && r <= m) view.activeRow = r;
    return view;
  };
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  __rec.step({
    at: 'dp[i][0] = i',
    msg: 'dp[i][j] = 把 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数。第一行/第一列是地基：变成空串就是把字符全删掉（或全插入）。对每个格子只有三种来路：删一个、插一个、改一个，取最小',
    views: { m: mSnap(-1) },
    vars: { 长度: `${m} → ${n}` },
  });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    __rec.step({
      at: 'dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])',
      msg: `第 ${i} 行填完（word1 的字符 '${word1[i - 1]}'）：逐格比较——相同就"继承左上"，不同就在"删/插/改"三个邻居里挑最小 + 1`,
      views: { m: mSnap(i) },
      vars: { 当前行: `${i}（'${word1[i - 1]}'）` },
    });
  }
  __rec.step({
    at: 'return dp[m][n]',
    msg: `右下角就是答案——把 "${word1}" 变成 "${word2}" 最少需要 ${dp[m][n]} 次操作`,
    views: { m: mSnap(m) },
    vars: { 答案: String(dp[m][n]) },
  });
  return dp[m][n];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "horse" → "ros" → 3',
    run: function () {
      const r = minDistance('horse', 'ros');
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '示例: "intention" → "execution" → 5',
    run: function () {
      const r = minDistance('intention', 'execution');
      if (r !== 5) throw new Error('期望 5，实际 ' + r);
    },
  },
  {
    label: '边界: 空串 → 空串 → 0',
    run: function () {
      const r = minDistance('', '');
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
]);
