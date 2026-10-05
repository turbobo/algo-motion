// 样题「最大子数组和」的插桩版代码（模拟 LLM 插桩产物，用于测试与内置体验）
// 覆盖场景：DP 状态转移（cur/best 两个变量）+ 单数组视图
function maxSubArray(nums) {
  let best = nums[0];
  __rec.step({
    at: 'let best = nums[0]',
    msg: `Kadane 算法起点：cur 和 best 都先取第一个数 ${nums[0]}（子数组至少要有一个元素）`,
    views: {
      nums: { kind: 'array', values: [...nums], pointers: { i: 0 }, marks: [{ index: 0, tone: 'active' }], title: 'nums' },
    },
    vars: { cur: String(nums[0]), best: String(best) },
  });
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    __rec.step({
      at: 'for (let i = 1; i < nums.length; i++)',
      msg: `看第 ${i} 个数 ${nums[i]}：要把它接在之前的累积后面（cur + ${nums[i]} = ${cur + nums[i]}），还是从它重新开始（${nums[i]}）？`,
      views: {
        nums: { kind: 'array', values: [...nums], pointers: { i: i }, marks: [{ index: i, tone: 'active' }], title: 'nums' },
      },
      vars: { i: String(i), cur: String(cur), best: String(best) },
    });
    __rec.step({
      at: 'cur = Math.max(nums[i], cur + nums[i])',
      msg: `两个选择比大小：接着累积得 ${cur + nums[i]}，重新开始得 ${nums[i]} —— 选大的那个`,
      views: {
        nums: { kind: 'array', values: [...nums], pointers: { i: i }, marks: [{ index: i, tone: 'warn' }], title: 'nums' },
      },
      vars: { i: String(i), cur: String(cur), best: String(best) },
    });
    cur = Math.max(nums[i], cur + nums[i]);
    const prevBest = best;
    best = Math.max(best, cur);
    __rec.step({
      at: 'best = Math.max(best, cur)',
      msg: best > prevBest
        ? `刷新纪录！best 从 ${prevBest} 更新为 ${best}：以第 ${i} 个数结尾的片段是目前的最大和`
        : `best 保持 ${best}：cur = ${cur} 没有超过历史纪录`,
      views: {
        nums: {
          kind: 'array',
          values: [...nums],
          pointers: { i: i },
          marks: [{ index: i, tone: best > prevBest ? 'ok' : 'muted' }],
          title: 'nums',
        },
      },
      vars: { i: String(i), cur: String(cur), best: String(best) },
    });
  }
  __rec.step({
    at: 'return best',
    msg: `扫描结束，历史最大子数组和就是 ${best}`,
    views: {
      nums: { kind: 'array', values: [...nums], title: 'nums' },
    },
    vars: { best: String(best) },
  });
  return best;
}
__rec.tests([
  {
    label: '示例: [-2,1,-3,4,-1,2,1,-5,4]',
    run: function () {
      const r = maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
      if (r !== 6) throw new Error('期望 6，实际 ' + r);
    },
  },
  {
    label: '全负数: [-3,-1,-2]',
    run: function () {
      const r = maxSubArray([-3, -1, -2]);
      if (r !== -1) throw new Error('期望 -1，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素 [5]',
    run: function () {
      const r = maxSubArray([5]);
      if (r !== 5) throw new Error('期望 5，实际 ' + r);
    },
  },
]);
