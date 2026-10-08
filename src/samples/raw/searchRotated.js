// 样题「搜索旋转排序数组」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：二分 + 有序半边判别（array 窗口 + 指针）（Hot 100 · 二分查找）
function search(nums, target) {
  const n = nums.length;
  const numsSnap = (lo, hi, mid, sortedSide) => {
    const pointers = {};
    if (lo >= 0 && lo < n) pointers.lo = lo;
    if (hi >= 0 && hi < n) pointers.hi = hi;
    if (mid >= 0 && mid < n) pointers.mid = mid;
    return {
      kind: 'array',
      values: [...nums],
      ranges:
        sortedSide !== null && lo <= hi && lo < n
          ? [
              {
                from: sortedSide === 'left' ? lo : mid,
                to: sortedSide === 'left' ? mid : Math.min(hi, n - 1),
                label: sortedSide === 'left' ? '左半有序' : '右半有序',
                tone: 'warn',
              },
            ]
          : [],
      pointers: pointers,
      marks: mid >= 0 && mid < n ? [{ index: mid, tone: 'active' }] : [],
      title: 'nums（旋转过的有序数组；色带 = 有序的那半边）',
    };
  };
  let lo = 0;
  let hi = nums.length - 1;
  __rec.step({
    at: 'let lo = 0;',
    msg: `旋转数组里任取一个 mid，它的左右两边至少有一边是升序的——先判断哪边有序，再看 target 在不在那半边：在就收缩过去，不在就钻另一边`,
    views: { nums: numsSnap(lo, hi, -1, null) },
    vars: { 目标: String(target) },
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    __rec.step({
      at: 'const mid = Math.floor((lo + hi) / 2)',
      msg:
        nums[mid] === target
          ? `mid = ${mid} 的值就是 ${target}——直接命中，返回下标 ${mid}`
          : nums[lo] <= nums[mid]
            ? `mid = ${mid}（值 ${nums[mid]}）：[lo..mid] 这段是升序（${nums[lo]} ≤ ${nums[mid]}）——看 ${target} 在不在 [${nums[lo]}, ${nums[mid]}) 之间，在就收缩左半，否则去右半`
            : `mid = ${mid}（值 ${nums[mid]}）：左半不是升序 → 右半 [mid..hi] 必然升序——${target} 落在 (${nums[mid]}, ${nums[hi]}] 之间就收缩右半，否则回左半`,
      views: { nums: numsSnap(lo, hi, mid, nums[lo] <= nums[mid] ? 'left' : 'right') },
      vars: { 目标: String(target) },
    });
    if (nums[mid] === target) {
      return mid;
    }
    if (nums[lo] <= nums[mid]) {
      if (target >= nums[lo] && target < nums[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    } else {
      if (target > nums[mid] && target <= nums[hi]) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }
  __rec.step({
    at: 'return -1',
    msg: `窗口收缩到空也没碰到 ${target}——不存在，返回 -1`,
    views: { nums: numsSnap(0, -1, -1, null) },
    vars: { 答案: '-1' },
  });
  return -1;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [4,5,6,7,0,1,2], 0 → 4',
    run: function () {
      const r = search([4, 5, 6, 7, 0, 1, 2], 0);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '示例: [4,5,6,7,0,1,2], 3 → -1',
    run: function () {
      const r = search([4, 5, 6, 7, 0, 1, 2], 3);
      if (r !== -1) throw new Error('期望 -1，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素 [1], 0 → -1',
    run: function () {
      const r = search([1], 0);
      if (r !== -1) throw new Error('期望 -1，实际 ' + r);
    },
  },
]);
