// 样题「寻找两个正序数组的中位数」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：双数组二分划分（两个 array 视图 + 切割指针）（Hot 100 · 二分查找）
function findMedianSortedArrays(a, b) {
  if (a.length > b.length) {
    const t = a;
    a = b;
    b = t;
  }
  const m = a.length;
  const n = b.length;
  const half = Math.floor((m + n + 1) / 2);
  const aSnap = (i) => ({
    kind: 'array',
    values: [...a],
    ranges: i >= 0 && i <= a.length ? (i > 0 ? [{ from: 0, to: i - 1, label: '左半', tone: 'ok' }] : []) : [],
    pointers: i >= 0 && i < a.length ? { 切在这里: i } : {},
    marks: i >= 0 && i < a.length ? [{ index: i, tone: 'active' }] : [],
    title: `a（切 i 个进左半；i = ${i}）`,
  });
  const bSnap = (i) => {
    const j = half - i;
    return {
      kind: 'array',
      values: [...b],
      ranges: j >= 0 && j <= b.length ? (j > 0 ? [{ from: 0, to: j - 1, label: '左半', tone: 'ok' }] : []) : [],
      pointers: j >= 0 && j < b.length ? { 切在这里: j } : {},
      marks: j >= 0 && j < b.length ? [{ index: j, tone: 'active' }] : [],
      title: `b（自动配 j = ${j} 个进左半，凑满 ${half} 个）`,
    };
  };
  let lo = 0;
  let hi = m;
  __rec.step({
    at: 'let lo = 0;',
    msg: `不动两个数组，只“想象”一条切割线：从 a 里切 i 个、从 b 里切 j 个放进左半，让左半边共 ${half} 个。i 定了 j 就定了（j = ${half} − i）——对 i 做二分即可`,
    views: { a: aSnap(0), b: bSnap(0) },
    vars: { 左半总数: String(half) },
  });
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2);
    const j = Math.floor((m + n + 1) / 2) - i;
    const aLeft = i === 0 ? -Infinity : a[i - 1];
    const aRight = i === m ? Infinity : a[i];
    const bLeft = j === 0 ? -Infinity : b[j - 1];
    const bRight = j === n ? Infinity : b[j];
    if (aLeft <= bRight && bLeft <= aRight) {
      __rec.step({
        at: 'if (aLeft <= bRight && bLeft <= aRight)',
        msg: `i = ${i}, j = ${j}：左侧最大 ${Math.max(aLeft, bLeft)} ≤ 右侧最小 ${Math.min(aRight, bRight)}——切割合法！`,
        views: { a: aSnap(i), b: bSnap(i) },
        vars: { i: String(i), j: String(j) },
      });
      if ((m + n) % 2 === 1) {
        __rec.step({
          at: 'return Math.max(aLeft, bLeft)',
          msg: `总长度是奇数——中位数就是左半边的最大值：max(${aLeft}, ${bLeft}) = ${Math.max(aLeft, bLeft)}`,
          views: { a: aSnap(i), b: bSnap(i) },
          vars: { 答案: String(Math.max(aLeft, bLeft)) },
        });
        return Math.max(aLeft, bLeft);
      }
      __rec.step({
        at: 'return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2',
        msg: `总长度是偶数——中位数取中间两个的平均：(max(${aLeft}, ${bLeft}) + min(${aRight}, ${bRight})) / 2 = ${(Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2}`,
        views: { a: aSnap(i), b: bSnap(i) },
        vars: { 答案: String((Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2) },
      });
      return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2;
    }
    if (aLeft > bRight) {
      hi = i - 1;
    } else {
      lo = i + 1;
    }
    __rec.step({
      at: 'if (aLeft > bRight)',
      msg:
        aLeft > bRight
          ? `i = ${i} 切多了：a 左侧的 ${aLeft} 比 b 右侧的 ${bRight} 还大——切割线要往左挪`
          : `i = ${i} 切少了：b 左侧的 ${bLeft} 比 a 右侧的 ${aRight} 还大——切割线要往右挪`,
      views: { a: aSnap(i), b: bSnap(i) },
      vars: { i: String(i), j: String(j) },
    });
  }
  return 0;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,3] + [2] → 2',
    run: function () {
      const r = findMedianSortedArrays([1, 3], [2]);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '示例: [1,2] + [3,4] → 2.5',
    run: function () {
      const r = findMedianSortedArrays([1, 2], [3, 4]);
      if (r !== 2.5) throw new Error('期望 2.5，实际 ' + r);
    },
  },
  {
    label: '边界: 空数组 [ ] + [1] → 1',
    run: function () {
      const r = findMedianSortedArrays([], [1]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
