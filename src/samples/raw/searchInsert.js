// 样题「搜索插入位置」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：二分查找 + 左边界即插入位（array 窗口 + 指针）（Hot 100 · 二分查找）
function searchInsert(nums, target) {
  const n = nums.length;
  const numsSnap = (lo, hi, mid, hit) => {
    const pointers = {};
    if (lo >= 0 && lo < n) pointers.lo = lo;
    if (hi >= 0 && hi < n) pointers.hi = hi;
    if (mid >= 0 && mid < n) pointers.mid = mid;
    return {
      kind: 'array',
      values: nums.map((v) => String(v)),
      ranges: lo <= hi && lo < n ? [{ from: lo, to: Math.min(hi, n - 1), label: '搜索窗口', tone: 'warn' }] : [],
      pointers: pointers,
      marks: mid >= 0 && mid < n ? [{ index: mid, tone: hit ? 'ok' : 'active' }] : [],
      title: 'nums（窗口收缩到空时，lo 就是插入位置）',
    };
  };
  let lo = 0;
  let hi = nums.length - 1;
  __rec.step({
    at: 'let lo = 0',
    msg: `在有序数组里找 ${target}：找到就返回它的下标；找不到时，"第一个大于 ${target} 的位置"就是要插入的地方——巧了，二分结束时 lo 正好停在这个位置`,
    views: { nums: numsSnap(lo, hi, -1, false) },
    vars: { 目标: String(target) },
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    __rec.step({
      at: 'const mid = Math.floor((lo + hi) / 2)',
      msg:
        nums[mid] === target
          ? `mid = ${mid} 正好是 ${target}——直接返回下标 ${mid}`
          : nums[mid] < target
            ? `mid = ${mid}（值 ${nums[mid]} < ${target}）：答案在右半，lo 右移到 ${mid + 1}`
            : `mid = ${mid}（值 ${nums[mid]} > ${target}）：答案在左半，hi 左移到 ${mid - 1}`,
      views: { nums: numsSnap(lo, hi, mid, nums[mid] === target) },
      vars: { 目标: String(target) },
    });
    if (nums[mid] === target) {
      __rec.step({
        at: 'return mid',
        msg: `命中！nums[${mid}] 正好是 ${target}——直接返回下标 ${mid}（找到就不用管插入位了）`,
        views: { nums: numsSnap(lo, hi, mid, true) },
        vars: { 答案: String(mid) },
      });
      return mid;
    }
    if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  __rec.step({
    at: 'return lo',
    msg: `窗口空了——lo = ${lo} 就是 ${target} 该插入的位置（插这里，左边全比它小、右边全比它大）`,
    views: { nums: numsSnap(lo, hi, -1, false) },
    vars: { 答案: String(lo) },
  });
  return lo;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [1,3,5,6], 5 → 2（命中）',
    run: function () {
      const r = searchInsert([1, 3, 5, 6], 5);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '示例: [1,3,5,6], 2 → 1（插入中间）',
    run: function () {
      const r = searchInsert([1, 3, 5, 6], 2);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
  {
    label: '边界: [1,3,5,6], 7 → 4（插到末尾）',
    run: function () {
      const r = searchInsert([1, 3, 5, 6], 7);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
]);
