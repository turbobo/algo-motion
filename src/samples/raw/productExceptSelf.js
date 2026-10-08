// 样题「除自身以外数组的乘积」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：前后缀积两趟扫描（双 array：nums + 结果）（Hot 100 · 普通数组）
function productExceptSelf(nums) {
  const n = nums.length;
  const listSnap = (i) => ({
    kind: 'array',
    values: [...nums],
    pointers: i >= 0 ? { i: i } : {},
    marks: i >= 0 ? [{ index: i, tone: 'active' }] : [],
    title: 'nums',
  });
  const resSnap = (i) => ({
    kind: 'array',
    values: [...res],
    marks: i >= 0 ? [{ index: i, tone: 'ok' }] : [],
    title: 'res：每个位置 = 左侧所有数之积 × 右侧所有数之积',
  });
  const res = new Array(n).fill(1);
  let prefix = 1;
  __rec.step({
    at: 'let prefix = 1',
    msg: '要求 O(n) 且不能用除法。思路：答案 = 左边所有数的积 × 右边所有数的积。第一趟从左往右算「左侧积」填进 res，第二趟从右往左再乘上「右侧积」',
    views: { list: listSnap(-1), res: resSnap(-1) },
    vars: { prefix: '1' },
  });
  for (let i = 0; i < n; i++) {
    res[i] = prefix;
    prefix *= nums[i];
    __rec.step({
      at: 'prefix *= nums[i]',
      msg: `第一趟：res[${i}] 先填上左侧积 ${res[i]}；然后 prefix 乘上 nums[${i}] = ${nums[i]} → ${prefix}，传给右边的位置`,
      views: { list: listSnap(i), res: resSnap(i) },
      vars: { i: String(i), prefix: String(prefix) },
    });
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= suffix;
    suffix *= nums[i];
    __rec.step({
      at: 'suffix *= nums[i]',
      msg: `第二趟：res[${i}] 乘上右侧积后 = ${res[i]}（右侧积 = nums[${i}] 右边所有数的积）；suffix 更新为 ${suffix} 继续向左传`,
      views: { list: listSnap(i), res: resSnap(i) },
      vars: { i: String(i), suffix: String(suffix) },
    });
  }
  __rec.step({
    at: 'return res',
    msg: `两趟扫描完成，res = [${res.join(', ')}]——每个位置都不包含自己`,
    views: { list: listSnap(-1), res: resSnap(-1) },
    vars: { 答案: `[${res.join(', ')}]` },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: [1,2,3,4]',
    run: function () {
      const r = productExceptSelf([1, 2, 3, 4]);
      if (JSON.stringify(r) !== JSON.stringify([24, 12, 8, 6])) {
        throw new Error('期望 [24,12,8,6]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '含零: [-1,1,0,-3,3]',
    run: function () {
      const r = productExceptSelf([-1, 1, 0, -3, 3]);
      if (JSON.stringify(r) !== JSON.stringify([0, 0, 9, 0, 0])) {
        throw new Error('期望 [0,0,9,0,0]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: 两个元素 [2,3]',
    run: function () {
      const r = productExceptSelf([2, 3]);
      if (JSON.stringify(r) !== JSON.stringify([3, 2])) throw new Error('期望 [3,2]，实际 ' + JSON.stringify(r));
    },
  },
]);
