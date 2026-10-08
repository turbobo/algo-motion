// 样题「字母异位词分组」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：hashmap 分组聚合 + array 当前扫描位置（Hot 100 · 哈希）
function groupAnagrams(strs) {
  const groups = new Map();
  const listSnap = (cur) => ({
    kind: 'array',
    values: [...strs],
    marks: cur >= 0 ? [{ index: cur, tone: 'active' }] : [],
    pointers: cur >= 0 ? { i: cur } : {},
    title: 'strs',
  });
  const groupSnap = (hi) => ({
    kind: 'hashmap',
    entries: [...groups.entries()].map(([k, v]) => [k, v.join(', ')]),
    highlightKeys: hi ? [hi] : [],
    title: 'groups：排序后的字母 → 同组单词',
  });
  __rec.step({
    at: 'const groups = new Map()',
    msg: '异位词就是指字母组成相同、顺序不同的单词（如 eat / tea / ate）。技巧：把每个单词的字母排序后当"分组键"——同一组异位词排序后必然相同',
    views: { list: listSnap(-1), groups: groupSnap() },
    vars: {},
  });
  for (let i = 0; i < strs.length; i++) {
    const word = strs[i];
    const key = word.split('').sort().join('');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(word);
    __rec.step({
      at: 'groups.get(key).push(word)',
      msg: `"${word}" 排序后得到键 "${key}" → ${groups.get(key).length > 1 ? `并入已有分组 [${groups.get(key).join(', ')}]` : '开一个新分组'}`,
      views: { list: listSnap(i), groups: groupSnap(key) },
      vars: { 当前: `"${word}"`, 键: `"${key}"`, 分组数: String(groups.size) },
    });
  }
  __rec.step({
    at: 'return [...groups.values()]',
    msg: `扫描完成，共分出 ${groups.size} 组异位词`,
    views: { list: listSnap(-1), groups: groupSnap() },
    vars: { 答案: `${groups.size} 组` },
  });
  return [...groups.values()];
}
__rec.tests([
  {
    label: '示例: eat/tea/tan/ate/nat/bat',
    run: function () {
      const r = groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
      const norm = r.map((g) => [...g].sort().join(',')).sort();
      const expect = ['ate,eat,tea', 'nat,tan', 'bat'].sort();
      if (JSON.stringify(norm) !== JSON.stringify(expect)) {
        throw new Error('期望 ' + JSON.stringify(expect) + '，实际 ' + JSON.stringify(norm));
      }
    },
  },
  {
    label: '单组: 三个同组词',
    run: function () {
      const r = groupAnagrams(['abc', 'bca', 'cab']);
      if (r.length !== 1 || r[0].length !== 3) throw new Error('期望 1 组 3 词，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 空数组',
    run: function () {
      const r = groupAnagrams([]);
      if (r.length !== 0) throw new Error('期望 0 组，实际 ' + JSON.stringify(r));
    },
  },
]);
