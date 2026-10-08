// 样题「轮转数组」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：三次反转法（区间色带 + 值变化 popIn）（Hot 100 · 普通数组）
function rotate(nums, k) {
  const n = nums.length;
  k = k % n;
  const listSnap = (range, label) => ({
    kind: 'array',
    values: [...nums],
    ranges: range && range[0] <= range[1] ? [{ from: range[0], to: range[1], label: label, tone: 'warn' }] : [],
    title: 'nums',
  });
  const reverse = (l, r) => {
    while (l < r) {
      const tmp = nums[l];
      nums[l] = nums[r];
      nums[r] = tmp;
      l++;
      r--;
    }
  };
  __rec.step({
    at: 'k = k % n',
    msg: `右旋 k = ${k} 位。用「三次反转」技巧：先整体反转，再把前 k 段和后 n−k 段分别反转——效果等价于右旋，但只需 O(1) 额外空间`,
    views: { list: listSnap(null, '') },
    vars: { k: String(k) },
  });
  reverse(0, n - 1);
  __rec.step({
    at: 'reverse(0, n - 1)',
    msg: `第一步：整体反转 [0, ${n - 1}]——原本在后半段的 ${k} 个元素被甩到了前面，但它们的内部顺序也反了`,
    views: { list: listSnap([0, n - 1], '整体反转的区间') },
    vars: { k: String(k), 当前: '整体反转后' },
  });
  reverse(0, k - 1);
  __rec.step({
    at: 'reverse(0, k - 1)',
    msg: `第二步：反转前 k 个 [0, ${k - 1}]——把刚甩到前面的那 ${k} 个元素的内部顺序恢复正确`,
    views: { list: listSnap([0, k - 1], '恢复顺序') },
    vars: { k: String(k), 当前: '前 k 段恢复' },
  });
  reverse(k, n - 1);
  __rec.step({
    at: 'reverse(k, n - 1)',
    msg: `第三步：反转剩余段 [${k}, ${n - 1}]——同样恢复正序。三次反转拼起来 = 数组向右轮转 ${k} 位`,
    views: { list: listSnap([k, n - 1], '恢复顺序') },
    vars: { k: String(k), 当前: '完成' },
  });
  __rec.step({
    at: 'return nums',
    msg: `完成：数组向右轮转 ${k} 位，结果为 [${nums.join(', ')}]`,
    views: { list: listSnap(null, '') },
    vars: { 答案: `[${nums.join(', ')}]` },
  });
  return nums;
}
__rec.tests([
  {
    label: '示例: [1,2,3,4,5,6,7], k=3',
    run: function () {
      const r = rotate([1, 2, 3, 4, 5, 6, 7], 3);
      if (JSON.stringify(r) !== JSON.stringify([5, 6, 7, 1, 2, 3, 4])) {
        throw new Error('期望 [5,6,7,1,2,3,4]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: k 等于长度（原地不动）',
    run: function () {
      const r = rotate([1, 2], 2);
      if (JSON.stringify(r) !== JSON.stringify([1, 2])) throw new Error('期望 [1,2]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: k 大于长度 [1,2], k=3',
    run: function () {
      const r = rotate([1, 2], 3);
      if (JSON.stringify(r) !== JSON.stringify([2, 1])) throw new Error('期望 [2,1]（k%n=1），实际 ' + JSON.stringify(r));
    },
  },
]);
