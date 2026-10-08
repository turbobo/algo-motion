// 样题「寻找旋转排序数组中的最小值」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：二分收敛到旋转点（array 窗口 + 指针）（Hot 100 · 二分查找）
function findMin(nums) {
  const n = nums.length;
  const numsSnap = (lo, hi, mid) => {
    const pointers = {};
    if (lo >= 0 && lo < n) pointers.lo = lo;
    if (hi >= 0 && hi < n) pointers.hi = hi;
    if (mid >= 0 && mid < n) pointers.mid = mid;
    return {
      kind: 'array',
      values: [...nums],
      ranges: lo <= hi && lo < n ? [{ from: lo, to: Math.min(hi, n - 1), label: '搜索窗口', tone: 'warn' }] : [],
      pointers: pointers,
      marks: mid >= 0 && mid < n ? [{ index: mid, tone: 'active' }] : [],
      title: 'nums（旋转点 = 最小值所在处）',
    };
  };
  let lo = 0;
  let hi = nums.length - 1;
  __rec.step({
    at: 'let lo = 0;',
    msg: '找旋转数组的最小值 = 找"断崖"在哪。关键比较：nums[mid] 和 nums[hi]——如果 nums[mid] 更大，说明断崖在右半（最小值在右边）；否则（含等于）断崖在左半或就是 mid（右端收回来）',
    views: { nums: numsSnap(lo, hi, -1) },
    vars: {},
  });
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
    __rec.step({
      at: 'if (nums[mid] > nums[hi])',
      msg:
        nums[mid] > nums[hi]
          ? `mid = ${mid}（值 ${nums[mid]}）比最右 ${nums[hi]} 大——mid 还爬在"高的那一坡"上，断崖在右半，窗口收缩到 [${lo}, ${hi}]`
          : `mid = ${mid}（值 ${nums[mid]} ≤ 最右 ${nums[hi]}）——mid 已在低谷一侧（或就是最小值），把右端收回到 mid：[${lo}, ${hi}]`,
      views: { nums: numsSnap(lo, hi, mid) },
      vars: { 窗口: `[${lo}, ${hi}]` },
    });
  }
  __rec.step({
    at: 'return nums[lo]',
    msg: `lo 和 hi 相遇在 ${lo}——它就是断崖底部、整个数组的最小值 ${nums[lo]}`,
    views: { nums: numsSnap(lo, hi, lo) },
    vars: { 答案: String(nums[lo]) },
  });
  return nums[lo];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [3,4,5,1,2] → 1',
    run: function () {
      const r = findMin([3, 4, 5, 1, 2]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '示例: [4,5,6,7,0,1,2] → 0',
    run: function () {
      const r = findMin([4, 5, 6, 7, 0, 1, 2]);
      if (r !== 0) throw new Error('期望 0，实际 ' + r);
    },
  },
  {
    label: '边界: 未旋转 [1,2,3] → 1',
    run: function () {
      const r = findMin([1, 2, 3]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
