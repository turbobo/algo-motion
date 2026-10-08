// 样题「实现 Trie（前缀树）」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：字典树插入与查找（节点表 hashmap + 路径 array）（Hot 100 · 图论）
class Trie {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
  insert(word) {
    let node = this;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!node.children.has(ch)) {
        node.children.set(ch, new Trie());
      }
      node = node.children.get(ch);
      __rec.step({
        at: 'node = node.children.get(ch)',
        msg: `插入：沿字符 '${ch}' 往下——没有这条边就现场创建一个新节点，有就走过去。当前停在路径 "${word.slice(0, i + 1)}"`,
        views: { trie: this.trieSnap(word.slice(0, i + 1)), path: this.pathSnap(word, i) },
        vars: { 插入词: word },
      });
    }
    node.isEnd = true;
    __rec.step({
      at: 'node.isEnd = true',
      msg: `"${word}" 全部字符都走过了一遍——把最后一个节点标成词尾（✓），下次查找走到这里才算"认识这个词"`,
      views: { trie: this.trieSnap(word), path: this.pathSnap(word, word.length - 1) },
      vars: { 词尾: word },
    });
  }
  search(word) {
    let node = this;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        __rec.step({
          at: 'return false',
          msg: `查找 "${word}"：走到字符 '${ch}' 时发现没有这条路——词不存在，返回 false`,
          views: { trie: this.trieSnap(null), path: this.pathSnap(word, -1) },
          vars: { 查找: word, 结果: 'false' },
        });
        return false;
      }
      node = node.children.get(ch);
    }
    __rec.step({
      at: 'return node.isEnd',
      msg: node.isEnd
        ? `查找 "${word}"：路径走通，且终点带词尾标记 ✓——是完整的词，返回 true`
        : `查找 "${word}"：路径走通了，但终点没有词尾标记——它只是一个前缀，不是完整的词，返回 false`,
      views: { trie: this.trieSnap(word), path: this.pathSnap(word, word.length - 1) },
      vars: { 查找: word, 结果: String(node.isEnd) },
    });
    return node.isEnd;
  }
  startsWith(prefix) {
    let node = this;
    for (const ch of prefix) {
      if (!node.children.has(ch)) {
        return false;
      }
      node = node.children.get(ch);
    }
    __rec.step({
      at: 'return true',
      msg: `前缀 "${prefix}"：路径走通就是"有人拿它开头"——不管终点有没有词尾标记，都返回 true`,
      views: { trie: this.trieSnap(prefix), path: this.pathSnap(prefix, prefix.length - 1) },
      vars: { 前缀: prefix, 结果: 'true' },
    });
    return true;
  }
  trieSnap(hi) {
    const entries = [];
    (function walk(node, path) {
      entries.push([path === '' ? '(root)' : path, node.isEnd ? '✓ 词尾' : '·']);
      for (const pair of node.children) {
        walk(pair[1], path + pair[0]);
      }
    })(this, '');
    return {
      kind: 'hashmap',
      entries: entries,
      highlightKeys: hi !== null && hi !== undefined && entries.some((e) => e[0] === hi) ? [hi] : [],
      title: '字典树的全部路径（✓ = 词尾）',
    };
  }
  pathSnap(word, idx) {
    return {
      kind: 'array',
      values: word.split(''),
      pointers: idx >= 0 && idx < word.length ? { 这里: idx } : {},
      title: '正在处理的词（逐字符下行）',
    };
  }
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: insert apple → search apple=true / search app=false / startsWith app=true',
    run: function () {
      const trie = new Trie();
      trie.insert('apple');
      if (trie.search('apple') !== true) throw new Error('search(apple) 期望 true');
      if (trie.search('app') !== false) throw new Error('search(app) 期望 false（只是前缀）');
      if (trie.startsWith('app') !== true) throw new Error('startsWith(app) 期望 true');
    },
  },
  {
    label: '示例: insert banana → search banana=true',
    run: function () {
      const trie = new Trie();
      trie.insert('banana');
      if (trie.search('banana') !== true) throw new Error('search(banana) 期望 true');
    },
  },
  {
    label: '边界: 查找不存在的词 search(any)=false',
    run: function () {
      const trie = new Trie();
      if (trie.search('any') !== false) throw new Error('search(any) 期望 false');
    },
  },
]);
