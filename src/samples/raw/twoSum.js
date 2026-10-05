// 样题「两数之和」的插桩版代码（模拟 LLM 插桩产物）
// 约定：__rec.step 独立成行、at 为展示代码锚点、视图为完整快照、末尾 __rec.tests 注册用例
function twoSum(nums, target) {
  const seen = new Map();
  __rec.step({
    at: 'const seen = new Map()',
    msg: `准备一个哈希表 seen，记住"见过的数和它的下标"。目标 target = ${target}`,
    views: {
      nums: { kind: 'array', values: [...nums], title: 'nums' },
      seen: { kind: 'hashmap', entries: [], title: 'seen：值 → 下标' },
    },
    vars: { target: String(target) },
  });
  for (let i = 0; i < nums.length; i++) {
    __rec.step({
      at: 'for (let i = 0; i < nums.length; i++)',
      msg: `轮到第 ${i} 个元素：nums[${i}] = ${nums[i]}`,
      views: {
        nums: { kind: 'array', values: [...nums], pointers: { i: i }, marks: [{ index: i, tone: 'active' }], title: 'nums' },
        seen: { kind: 'hashmap', entries: [...seen.entries()].map(([k, v]) => [String(k), String(v)]), title: 'seen：值 → 下标' },
      },
      vars: { i: String(i), target: String(target) },
    });
    const need = target - nums[i];
    __rec.step({
      at: 'const need = target - nums[i]',
      msg: `要找的另一半：need = ${target} − ${nums[i]} = ${need}`,
      views: {
        nums: { kind: 'array', values: [...nums], pointers: { i: i }, marks: [{ index: i, tone: 'active' }], title: 'nums' },
        seen: { kind: 'hashmap', entries: [...seen.entries()].map(([k, v]) => [String(k), String(v)]), title: 'seen：值 → 下标' },
      },
      vars: { i: String(i), need: String(need) },
    });
    if (seen.has(need)) {
      __rec.step({
        at: 'if (seen.has(need))',
        msg: `查哈希表：${need} 在里面吗？——在！它在下标 ${seen.get(need)} 的位置，答案就是 [${seen.get(need)}, ${i}]`,
        views: {
          nums: {
            kind: 'array',
            values: [...nums],
            pointers: { i: i },
            marks: [
              { index: seen.get(need), tone: 'ok' },
              { index: i, tone: 'ok' },
            ],
            title: 'nums',
          },
          seen: {
            kind: 'hashmap',
            entries: [...seen.entries()].map(([k, v]) => [String(k), String(v)]),
            highlightKeys: [String(need)],
            title: 'seen：值 → 下标',
          },
        },
        vars: { i: String(i), need: String(need), 命中: `[${seen.get(need)}, ${i}]` },
      });
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
    __rec.step({
      at: 'seen.set(nums[i], i)',
      msg: `${need} 不在表里。把当前的 ${nums[i]}（下标 ${i}）记下来，等待后面的数和它配对`,
      views: {
        nums: { kind: 'array', values: [...nums], pointers: { i: i }, marks: [{ index: i, tone: 'warn' }], title: 'nums' },
        seen: {
          kind: 'hashmap',
          entries: [...seen.entries()].map(([k, v]) => [String(k), String(v)]),
          highlightKeys: [String(nums[i])],
          title: 'seen：值 → 下标',
        },
      },
      vars: { i: String(i), need: String(need) },
    });
  }
  return [];
}
__rec.tests([
  {
    label: '示例1: nums=[2,7,11,15], target=9',
    run: function () {
      const r = twoSum([2, 7, 11, 15], 9);
      if (JSON.stringify(r) !== JSON.stringify([0, 1])) throw new Error('期望 [0,1]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例2: nums=[3,2,4], target=6',
    run: function () {
      const r = twoSum([3, 2, 4], 6);
      if (JSON.stringify(r) !== JSON.stringify([1, 2])) throw new Error('期望 [1,2]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: nums=[3,3], target=6（两个相同值）',
    run: function () {
      const r = twoSum([3, 3], 6);
      if (JSON.stringify(r) !== JSON.stringify([0, 1])) throw new Error('期望 [0,1]，实际 ' + JSON.stringify(r));
    },
  },
]);
