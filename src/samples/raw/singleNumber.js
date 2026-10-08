// 样题「只出现一次的数字」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：异或运算逐步抵消（array 指针 + 变量面板）（Hot 100 · 技巧）
function singleNumber(nums) {
  const listSnap = (i, marks) => ({
    kind: 'array',
    values: [...nums],
    pointers: i >= 0 ? { i: i } : {},
    marks: marks || [],
    title: 'nums',
  });
  let res = 0;
  __rec.step({
    at: 'let res = 0',
    msg: '要求线性时间 + 常数空间。异或（^）的三个性质是钥匙：x ^ x = 0（相同抵消）、x ^ 0 = x、异或满足交换律。把所有数异或起来，成对的全变 0，只剩落单的那个',
    views: { list: listSnap(-1, []) },
    vars: { res: '0' },
  });
  for (let i = 0; i < nums.length; i++) {
    res ^= nums[i];
    __rec.step({
      at: 'res ^= nums[i]',
      msg: `res ^= ${nums[i]} → ${res}；到目前为止累计异或值是 ${res}（成对的数会在后续步骤里互相抵消）`,
      views: { list: listSnap(i, [{ index: i, tone: 'active' }]) },
      vars: { i: String(i), res: String(res) },
    });
  }
  __rec.step({
    at: 'return res',
    msg: `全部异或完成，所有成对的数都抵消成 0，答案就是落单的那个：${res}`,
    views: { list: listSnap(-1, []) },
    vars: { 答案: String(res) },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: [4,1,2,1,2] → 4',
    run: function () {
      const r = singleNumber([4, 1, 2, 1, 2]);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '示例: [2,2,1] → 1',
    run: function () {
      const r = singleNumber([2, 2, 1]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素 [7]',
    run: function () {
      const r = singleNumber([7]);
      if (r !== 7) throw new Error('期望 7，实际 ' + r);
    },
  },
]);
