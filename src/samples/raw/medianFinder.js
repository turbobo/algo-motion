// 样题「数据流的中位数」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：对顶双堆（左半大顶堆 + 右半小顶堆）（Hot 100 · 堆）
class MedianFinder {
  constructor() {
    this.small = [];
    this.large = [];
  }
  addNum(num) {
    this.small.push(-num);
    this.siftUp(this.small);
    const top = -this.small[0];
    this.small[0] = this.small[this.small.length - 1];
    this.small.pop();
    this.siftDown(this.small);
    this.large.push(top);
    this.siftUp(this.large);
    if (this.large.length > this.small.length) {
      const back = this.large[0];
      this.large[0] = this.large[this.large.length - 1];
      this.large.pop();
      this.siftDown(this.large);
      this.small.push(-back);
      this.siftUp(this.small);
    }
    __rec.step({
      at: 'this.small.push(-num)',
      msg: `加入 ${num}：过一遍流程——先进左半、再把左半最大的挪给右半、不平衡再把右半最小的挪回来。结束后左半堆顶 ${this.small.length > 0 ? -this.small[0] : '空'}、右半堆顶 ${this.large.length > 0 ? this.large[0] : '空'}`,
      views: { small: this.smallSnap(), large: this.largeSnap() },
      vars: { 左半数量: String(this.small.length), 右半数量: String(this.large.length) },
    });
  }
  findMedian() {
    if (this.small.length > this.large.length) {
      __rec.step({
        at: 'return -this.small[0]',
        msg: `奇数个：中位数就是左半堆顶（大顶堆的最大 = 中位数）：${-this.small[0]}`,
        views: { small: this.smallSnap(), large: this.largeSnap() },
        vars: { 答案: String(-this.small[0]) },
      });
      return -this.small[0];
    }
    __rec.step({
      at: 'return (-this.small[0] + this.large[0]) / 2',
      msg: `偶数个：中位数 = (左半最大 + 右半最小) / 2 = (${-this.small[0]} + ${this.large[0]}) / 2`,
      views: { small: this.smallSnap(), large: this.largeSnap() },
      vars: { 答案: String((-this.small[0] + this.large[0]) / 2) },
    });
    return (-this.small[0] + this.large[0]) / 2;
  }
  smallSnap() {
    return {
      kind: 'array',
      values: this.small.map((v) => String(-v)),
      marks: this.small.length > 0 ? [{ index: 0, tone: 'ok' }] : [],
      pointers: this.small.length > 0 ? { 堆顶: 0 } : {},
      title: '左半（大顶堆：堆顶 = 左半最大值）',
    };
  }
  largeSnap() {
    return {
      kind: 'array',
      values: this.large.map((v) => String(v)),
      marks: this.large.length > 0 ? [{ index: 0, tone: 'ok' }] : [],
      pointers: this.large.length > 0 ? { 堆顶: 0 } : {},
      title: '右半（小顶堆：堆顶 = 右半最小值）',
    };
  }
  siftUp(heap) {
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) {
        break;
      }
      const t = heap[parent];
      heap[parent] = heap[i];
      heap[i] = t;
      i = parent;
    }
  }
  siftDown(heap) {
    let i = 0;
    while (true) {
      let smallest = i;
      const l = i * 2 + 1;
      const r = i * 2 + 2;
      if (l < heap.length && heap[l] < heap[smallest]) {
        smallest = l;
      }
      if (r < heap.length && heap[r] < heap[smallest]) {
        smallest = r;
      }
      if (smallest === i) {
        break;
      }
      const t = heap[smallest];
      heap[smallest] = heap[i];
      heap[i] = t;
      i = smallest;
    }
  }
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: add 1,2 → 1.5 → add 3 → 2',
    run: function () {
      const mf = new MedianFinder();
      mf.addNum(1);
      mf.addNum(2);
      if (mf.findMedian() !== 1.5) throw new Error('中位数期望 1.5，实际 ' + mf.findMedian());
      mf.addNum(3);
      if (mf.findMedian() !== 2) throw new Error('中位数期望 2，实际 ' + mf.findMedian());
    },
  },
  {
    label: '示例: add 6,10,2,6,5 → 6',
    run: function () {
      const mf = new MedianFinder();
      mf.addNum(6);
      mf.addNum(10);
      mf.addNum(2);
      mf.addNum(6);
      mf.addNum(5);
      if (mf.findMedian() !== 6) throw new Error('中位数期望 6，实际 ' + mf.findMedian());
    },
  },
  {
    label: '边界: 单个数 add 4 → 4',
    run: function () {
      const mf = new MedianFinder();
      mf.addNum(4);
      if (mf.findMedian() !== 4) throw new Error('中位数期望 4，实际 ' + mf.findMedian());
    },
  },
]);
