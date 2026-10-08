// 样题「LRU 缓存」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：类方法内插桩 + array（使用顺序）+ hashmap（键值表）（Hot 100 · 链表）
// 说明：教学直观版用数组维护使用顺序（模拟双向链表）；工业实现用哈希表 + 双向链表做到 O(1)
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.order = [];
    __rec.step({
      at: 'this.order = []',
      msg: `LRU = 最近最少使用。两个结构配合：map 存 key → value 实现 O(1) 查找；order 记录使用顺序（右端 = 最近使用）。容量满了就淘汰左端（最久没用过的）`,
      views: {
        order: this.orderView(),
        table: this.mapView(undefined),
      },
      vars: { capacity: String(capacity) },
    });
  }
  orderView() {
    return {
      kind: 'array',
      values: this.order.map((k) => k + ':' + this.map.get(k)),
      marks: this.order.length > 0 ? [{ index: this.order.length - 1, tone: 'ok' }] : [],
      title: '使用顺序（右端 = 最近使用；左端最旧，优先淘汰）',
    };
  }
  mapView(hi) {
    return {
      kind: 'hashmap',
      entries: [...this.map.entries()].map(([k, v]) => [String(k), String(v)]),
      highlightKeys: hi !== undefined && this.map.has(hi) ? [String(hi)] : [],
      title: 'map：key → value',
    };
  }
  touch(key) {
    const idx = this.order.indexOf(key);
    if (idx >= 0) {
      this.order.splice(idx, 1);
    }
    this.order.push(key);
  }
  get(key) {
    if (!this.map.has(key)) {
      __rec.step({
        at: 'return -1',
        msg: `get(${key})：map 里没有 → 未命中，返回 -1（淘汰与否都不变）`,
        views: { order: this.orderView(), table: this.mapView(key) },
        vars: { get: String(key), 结果: '-1' },
      });
      return -1;
    }
    this.touch(key);
    __rec.step({
      at: 'this.touch(key)',
      msg: `get(${key}) 命中值 ${this.map.get(key)}！把它挪到使用顺序的最右端——刚用过，离被淘汰最远`,
      views: { order: this.orderView(), table: this.mapView(key) },
      vars: { get: String(key), 结果: String(this.map.get(key)) },
    });
    return this.map.get(key);
  }
  put(key, value) {
    if (!this.map.has(key) && this.order.length >= this.capacity) {
      const evict = this.order.shift();
      this.map.delete(evict);
      __rec.step({
        at: 'this.map.delete(evict)',
        msg: `put(${key}, ${value})：容量已满，先淘汰最久未使用的 key = ${evict}（使用顺序的最左端）`,
        views: { order: this.orderView(), table: this.mapView(key) },
        vars: { 淘汰: String(evict) },
      });
    }
    this.map.set(key, value);
    const idx = this.order.indexOf(key);
    if (idx >= 0) {
      this.order.splice(idx, 1);
    }
    this.order.push(key);
    __rec.step({
      at: 'this.order.push(key)',
      msg: `put(${key}, ${value}) 完成：值写入 map，key 挪到使用顺序最右端成为"最近使用"`,
      views: { order: this.orderView(), table: this.mapView(key) },
      vars: { put: `${key} → ${value}` },
    });
  }
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: 容量 2 的完整操作序列',
    run: function () {
      const c = new LRUCache(2);
      c.put(1, 1);
      c.put(2, 2);
      if (c.get(1) !== 1) throw new Error('get(1) 期望 1');
      c.put(3, 3);
      if (c.get(2) !== -1) throw new Error('get(2) 应被淘汰返回 -1');
      c.put(4, 4);
      if (c.get(1) !== -1) throw new Error('get(1) 应被淘汰返回 -1');
      if (c.get(3) !== 3) throw new Error('get(3) 期望 3');
      if (c.get(4) !== 4) throw new Error('get(4) 期望 4');
    },
  },
  {
    label: '边界: 容量 1 反复覆盖',
    run: function () {
      const c = new LRUCache(1);
      c.put(2, 1);
      if (c.get(2) !== 1) throw new Error('get(2) 期望 1');
      c.put(3, 2);
      if (c.get(2) !== -1) throw new Error('get(2) 应被淘汰');
      if (c.get(3) !== 2) throw new Error('get(3) 期望 2');
    },
  },
  {
    label: '边界: 更新已有 key 不触发淘汰',
    run: function () {
      const c = new LRUCache(2);
      c.put(1, 1);
      c.put(2, 2);
      c.put(1, 10);
      if (c.get(1) !== 10) throw new Error('get(1) 期望 10（已更新且变为最近使用）');
      if (c.get(2) !== 2) throw new Error('get(2) 期望 2');
    },
  },
]);
