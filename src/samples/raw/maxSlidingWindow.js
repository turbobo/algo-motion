// 样题「滑动窗口最大值」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：单调队列（双 array：窗口区间色带 + 队列值列表）（Hot 100 · 子串）
function maxSlidingWindow(nums, k) {
  const listSnap = (i) => ({
    kind: 'array',
    values: [...nums],
    pointers: i >= 0 ? { i: i } : {},
    marks: i >= 0 ? [{ index: i, tone: 'active' }] : [],
    ranges: i >= k - 1 ? [{ from: i - k + 1, to: i, label: `窗口 ${k}`, tone: 'warn' }] : [],
    title: 'nums',
  });
  const dequeSnap = (deque) => ({
    kind: 'array',
    values: deque.map((idx) => `${nums[idx]}`),
    marks: deque.map((_, j) => ({ index: j, tone: j === 0 ? 'ok' : 'muted' })),
    title: '单调队列（队首 = 当前窗口最大值；值递减）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: [...res],
    title: '答案（每个窗口的最大值）',
  });
  const res = [];
  const deque = [];
  __rec.step({
    at: 'const deque = []',
    msg: '暴力每窗求 max 是 O(n·k)。单调队列技巧：队列里只留"还有资格当最大值"的下标，值从队首到队尾递减——队首永远是这个窗口的最大值。新元素入队前，把队尾比它小的全部弹掉',
    views: { list: listSnap(-1), deque: dequeSnap(deque), result: resSnap() },
    vars: { k: String(k) },
  });
  for (let i = 0; i < nums.length; i++) {
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);
    if (deque[0] <= i - k) {
      deque.shift();
    }
    if (i >= k - 1) {
      res.push(nums[deque[0]]);
      __rec.step({
        at: 'res.push(nums[deque[0]])',
        msg: `${nums[i]} 入队并弹掉了队尾更小的数；窗口 [${i - k + 1}, ${i}] 已满，队首下标 ${deque[0]}（值 ${nums[deque[0]]}）就是最大值 → 记入答案`,
        views: { list: listSnap(i), deque: dequeSnap(deque), result: resSnap() },
        vars: { 窗口: `[${i - k + 1}, ${i}]`, 最大值: String(nums[deque[0]]) },
      });
    }
  }
  __rec.step({
    at: 'return res',
    msg: `所有窗口都滑过了，每个窗口的最大值依次是 [${res.join(', ')}]`,
    views: { list: listSnap(-1), deque: dequeSnap([]), result: resSnap() },
    vars: { 答案: JSON.stringify(res) },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: [1,3,-1,-3,5,3,6,7], k=3',
    run: function () {
      const r = maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3);
      if (JSON.stringify(r) !== JSON.stringify([3, 3, 5, 5, 6, 7])) {
        throw new Error('期望 [3,3,5,5,6,7]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: k=1（每个元素自己）',
    run: function () {
      const r = maxSlidingWindow([4, 2, 9], 1);
      if (JSON.stringify(r) !== JSON.stringify([4, 2, 9])) throw new Error('期望 [4,2,9]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 递减数组 [9,8,7], k=2',
    run: function () {
      const r = maxSlidingWindow([9, 8, 7], 2);
      if (JSON.stringify(r) !== JSON.stringify([9, 8])) throw new Error('期望 [9,8]，实际 ' + JSON.stringify(r));
    },
  },
]);
