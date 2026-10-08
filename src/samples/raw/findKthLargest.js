// 样题「数组中的第 K 个最大元素」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：大小为 k 的最小堆（堆数组 + 堆顶标记）（Hot 100 · 堆）
function findKthLargest(nums, k) {
  const heap = [];
  const heapSnap = () => ({
    kind: 'array',
    values: heap.map((v) => String(v)),
    marks: heap.length > 0 ? [{ index: 0, tone: 'ok' }] : [],
    pointers: heap.length > 0 ? { 堆顶: 0 } : {},
    title: `最小堆（堆顶 = 目前 k 个数里最小的 = 第 ${k} 大的候选）`,
  });
  const siftUp = (i) => {
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
  };
  const siftDown = (i) => {
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
  };
  __rec.step({
    at: 'const heap = [];',
    msg: `找第 ${k} 大：不用全排序，只需要一个"大小为 ${k} 的擂台"。用一个最小堆：新数放进来后，如果堆超过 ${k} 个就把堆顶（最小的）踢出去——扫完后堆里留着最大的 ${k} 个，堆顶就是第 ${k} 大`,
    views: { heap: heapSnap() },
    vars: { k: String(k) },
  });
  for (let idx = 0; idx < nums.length; idx++) {
    const x = nums[idx];
    heap.push(x);
    siftUp(heap.length - 1);
    if (heap.length > k) {
      heap[0] = heap[heap.length - 1];
      heap.pop();
      siftDown(0);
    }
    __rec.step({
      at: 'heap.push(x)',
      msg:
        heap.length >= k
          ? `放入 ${x}：${heap.length > k ? '堆超员，踢掉堆顶——' : ''}堆里现在是最大的 ${Math.min(heap.length, k)} 个数，堆顶 ${heap[0]} 是其中最小的`
          : `放入 ${x}：还没攒够 ${k} 个（当前 ${heap.length} 个），先都留着`,
      views: { heap: heapSnap() },
      vars: { 当前数: String(x), 堆大小: String(heap.length) },
    });
  }
  __rec.step({
    at: 'return heap[0]',
    msg: `扫完全部数字——堆里一直守着最大的 ${k} 个，堆顶 ${heap[0]} 就是第 ${k} 大`,
    views: { heap: heapSnap() },
    vars: { 答案: String(heap[0]) },
  });
  return heap[0];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [3,2,1,5,6,4], k=2 → 5',
    run: function () {
      const r = findKthLargest([3, 2, 1, 5, 6, 4], 2);
      if (r !== 5) throw new Error('期望 5，实际 ' + r);
    },
  },
  {
    label: '示例: [3,2,3,1,2,4,5,5,6], k=4 → 4',
    run: function () {
      const r = findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '边界: k=1 [2,1] → 2',
    run: function () {
      const r = findKthLargest([2, 1], 1);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
]);
