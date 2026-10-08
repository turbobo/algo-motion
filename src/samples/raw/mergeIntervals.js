// 样题「合并区间」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：排序 + 区间合并（双 array：原区间列表 + 结果列表）（Hot 100 · 普通数组）
function merge(intervals) {
  const listSnap = (cur) => ({
    kind: 'array',
    values: intervals.map((iv) => `[${iv[0]},${iv[1]}]`),
    marks: cur >= 0 ? [{ index: cur, tone: 'active' }] : [],
    pointers: cur >= 0 ? { cur: cur } : {},
    title: 'intervals（按起点排序）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((iv) => `[${iv[0]},${iv[1]}]`),
    marks: res.length > 0 ? [{ index: res.length - 1, tone: 'warn' }] : [],
    title: '已合并结果（最后一项 = 当前待延伸区间）',
  });
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [];
  __rec.step({
    at: 'intervals.sort((a, b) => a[0] - b[0])',
    msg: '先把区间按起点排序——只有这样，可能重叠的区间才会挨在一起。然后逐个处理：能和结果里最后一个区间接上就合并（延伸右端），接不上就作为新区间放进去',
    views: { list: listSnap(-1), res: resSnap() },
    vars: { 区间数: String(intervals.length) },
  });
  for (const interval of intervals) {
    const idx = intervals.indexOf(interval);
    if (res.length > 0 && res[res.length - 1][1] >= interval[0]) {
      res[res.length - 1][1] = Math.max(res[res.length - 1][1], interval[1]);
      __rec.step({
        at: 'res[res.length - 1][1] = Math.max(res[res.length - 1][1], interval[1])',
        msg: `[${interval[0]},${interval[1]}] 的起点 ${interval[0]} ≤ 当前区间右端 → 它们重叠！把右端延伸到 max(旧右端, ${interval[1]}) = ${res[res.length - 1][1]}`,
        views: { list: listSnap(idx), res: resSnap() },
        vars: { 当前: `[${interval[0]},${interval[1]}]`, 动作: '合并' },
      });
    } else {
      res.push([...interval]);
      __rec.step({
        at: 'res.push([...interval])',
        msg: `[${interval[0]},${interval[1]}] 的起点大于当前区间右端（或结果还是空的）→ 接不上，作为一个全新的区间放进结果`,
        views: { list: listSnap(idx), res: resSnap() },
        vars: { 当前: `[${interval[0]},${interval[1]}]`, 动作: '开新区间' },
      });
    }
  }
  __rec.step({
    at: 'return res',
    msg: `处理完毕，合并后共 ${res.length} 个区间：${res.map((iv) => `[${iv[0]},${iv[1]}]`).join(' ')}`,
    views: { list: listSnap(-1), res: resSnap() },
    vars: { 答案: res.map((iv) => `[${iv[0]},${iv[1]}]`).join(' ') },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: 有重叠 [[1,3],[2,6],[8,10],[15,18]]',
    run: function () {
      const r = merge([[1, 3], [2, 6], [8, 10], [15, 18]]);
      if (JSON.stringify(r) !== JSON.stringify([[1, 6], [8, 10], [15, 18]])) {
        throw new Error('期望 [[1,6],[8,10],[15,18]]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '示例: 全相邻 [[1,4],[4,5]]',
    run: function () {
      const r = merge([[1, 4], [4, 5]]);
      if (JSON.stringify(r) !== JSON.stringify([[1, 5]])) throw new Error('期望 [[1,5]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 单个区间 [[1,4]]',
    run: function () {
      const r = merge([[1, 4]]);
      if (JSON.stringify(r) !== JSON.stringify([[1, 4]])) throw new Error('期望 [[1,4]]，实际 ' + JSON.stringify(r));
    },
  },
]);
