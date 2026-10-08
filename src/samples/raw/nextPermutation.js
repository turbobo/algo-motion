// 样题「下一个排列」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：找转折点 + 交换 + 后缀反转（array 指针 + 区间色带）（Hot 100 · 技巧）
function nextPermutation(nums) {
  const n = nums.length;
  const listSnap = (marks, range) => ({
    kind: 'array',
    values: [...nums],
    marks: marks || [],
    ranges: range ? [{ from: range[0], to: range[1], label: range[2], tone: 'warn' }] : [],
    title: 'nums',
  });
  let i = nums.length - 2;
  __rec.step({
    at: 'while (i >= 0 && nums[i] >= nums[i + 1])',
    msg: '目标：找出字典序中「下一个更大的排列」。三步走：① 从右往左找第一处升序对（转折点 i）② 在它右侧找「比 nums[i] 大的最小数」并交换 ③ 把 i 后面的降序段整体反转成升序',
    views: { list: listSnap([]) },
    vars: { 起点: `从右往左扫描，i 从 ${i} 开始` },
  });
  while (i >= 0 && nums[i] >= nums[i + 1]) {
    i--;
  }
  if (i >= 0) {
    __rec.step({
      at: 'if (i >= 0)',
      msg: `从右往左找到第一个「升序对」：nums[${i}] = ${nums[i]} < nums[${i + 1}] = ${nums[i + 1]}。它右边的部分全是降序（已经是那段的"最大排列"），所以必须从这里动手`,
      views: { list: listSnap([{ index: i, tone: 'active' }, { index: i + 1, tone: 'warn' }]) },
      vars: { 转折点: String(i) },
    });
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) {
      j--;
    }
    const tmp = nums[i];
    nums[i] = nums[j];
    nums[j] = tmp;
    __rec.step({
      at: 'nums[j] = tmp',
      msg: `在右侧降序段里找到「比 nums[${i}] = ${nums[j]} 大的最小数」（从右往左第一个更大的），交换两者——${nums[j]} 和 ${nums[i]} 互换，这一步只让排列变大最少`,
      views: {
        list: listSnap([
          { index: i, tone: 'ok' },
          { index: j, tone: 'ok' },
        ]),
      },
      vars: { 交换: `位置 ${i} ↔ ${j}` },
    });
  } else {
    __rec.step({
      at: 'if (i >= 0)',
      msg: '整个数组是降序的（已经是字典序最大）→ 不存在更大的排列，直接进入反转阶段变成最小排列',
      views: { list: listSnap([]) },
      vars: { 转折点: '无（全降序）' },
    });
  }
  let l = i + 1;
  let r = nums.length - 1;
  while (l < r) {
    const tmp = nums[l];
    nums[l] = nums[r];
    nums[r] = tmp;
    l++;
    r--;
  }
  __rec.step({
    at: 'return nums',
    msg: `交换后右侧仍是降序 → 把它整体反转成升序，就得到「只比原排列大一点点的下一个排列」：[${nums.join(', ')}]`,
    views: { list: listSnap([], i + 1 < n ? [i + 1, n - 1, '反转成升序'] : null) },
    vars: { 答案: `[${nums.join(', ')}]` },
  });
  return nums;
}
__rec.tests([
  {
    label: '示例: [1,2,3] → [1,3,2]',
    run: function () {
      const r = nextPermutation([1, 2, 3]);
      if (JSON.stringify(r) !== JSON.stringify([1, 3, 2])) throw new Error('期望 [1,3,2]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: [3,2,1] → [1,2,3]',
    run: function () {
      const r = nextPermutation([3, 2, 1]);
      if (JSON.stringify(r) !== JSON.stringify([1, 2, 3])) throw new Error('期望 [1,2,3]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: [1,1,5] → [1,5,1]',
    run: function () {
      const r = nextPermutation([1, 1, 5]);
      if (JSON.stringify(r) !== JSON.stringify([1, 5, 1])) throw new Error('期望 [1,5,1]，实际 ' + JSON.stringify(r));
    },
  },
]);
