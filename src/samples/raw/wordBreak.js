// 样题「单词拆分」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：一维 bool DP 切分点枚举（array dp + 字典 hashmap）（Hot 100 · 动态规划）
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  const n = s.length;
  const sSnap = (i, j) => {
    const pointers = {};
    if (i >= 0 && i < n) pointers.前缀 = i;
    if (j >= 0 && j < i) pointers.切点 = j;
    return {
      kind: 'array',
      values: s.split(''),
      ranges: j >= 0 && j < i ? [{ from: j, to: i - 1, label: '正在查的词', tone: 'warn' }] : [],
      pointers: pointers,
      title: '字符串 s（高亮 = 当前切出来查字典的一段）',
    };
  };
  const dpSnap = (i) => ({
    kind: 'array',
    values: dp.map((v) => (v ? '✓' : '·')),
    marks: i >= 0 && i <= n ? [{ index: i, tone: 'active' }] : [],
    title: 'dp[i]：前 i 个字符能不能拆成字典里的词',
  });
  const dictSnap = () => ({
    kind: 'hashmap',
    entries: [...words].map((w) => [w, '在字典里']),
    highlightKeys: [],
    title: '字典',
  });
  dp[0] = true;
  __rec.step({
    at: 'dp[0] = true',
    msg: 'dp[i] 表示"前 i 个字符能不能被字典拆开"。空串天然可拆（dp[0] = true）。对每个位置 i，枚举切点 j：如果 dp[j] 为真、且 s[j..i) 本身是字典里的词 → dp[i] 也为真',
    views: { s: sSnap(-1, -1), dp: dpSnap(0), dict: dictSnap() },
    vars: {},
  });
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        __rec.step({
          at: 'dp[i] = true',
          msg: `前 ${j} 个字符可拆 ✓，且第 ${j}~${i - 1} 个字符 "${s.slice(j, i)}" 在字典里 → 前 ${i} 个字符也可以拆！`,
          views: { s: sSnap(i, j), dp: dpSnap(i), dict: dictSnap() },
          vars: { 用词: s.slice(j, i) },
        });
        break;
      }
    }
  }
  __rec.step({
    at: 'return dp[s.length]',
    msg: dp[s.length]
      ? `dp[${s.length}] = true——整个字符串都能被字典拆开`
      : `dp[${s.length}] = false——整串拆不出来`,
    views: { s: sSnap(-1, -1), dp: dpSnap(s.length), dict: dictSnap() },
    vars: { 答案: String(dp[s.length]) },
  });
  return dp[s.length];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: "leetcode" + [leet,code] → true',
    run: function () {
      const r = wordBreak('leetcode', ['leet', 'code']);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: "applepenapple" + [apple,pen] → true',
    run: function () {
      const r = wordBreak('applepenapple', ['apple', 'pen']);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '边界: "catsandog" + [cats,dog,sand,and,cat] → false',
    run: function () {
      const r = wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']);
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
]);
