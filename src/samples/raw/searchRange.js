// 样题「在排序数组中查找元素的第一个和最后一个位置」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：两轮二分找左右边界（array 窗口 + lo/hi/mid 指针）（Hot 100 · 二分查找）
function searchRange(nums, target) {
  const numsSnap = (lo, hi, mid, ans) => {
    const n = nums.length;
    const pointers = {};
    if (lo >= 0 && lo < n) pointers.lo = lo;
    if (hi >= 0 && hi < n) pointers.hi = hi;
    if (mid >= 0 && mid < n) pointers.mid = mid;
    if (ans >= 0 && ans < n) pointers['已定'] = ans;
    return {
      kind: 'array',
      values: [...nums],
      ranges: lo <= hi && lo < n ? [{ from: lo, to: Math.min(hi, n - 1), label: '搜索窗口', tone: 'warn' }] : [],
      pointers: pointers,
      marks: mid >= 0 && mid < n ? [{ index: mid, tone: 'active' }] : [],
      title: 'nums（色带 = 还活着的搜索窗口）',
    };
  };
  const findBound = (isFirst) => {
    let lo = 0;
    let hi = nums.length - 1;
    let ans = -1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (nums[mid] === target) {
        ans = mid;
        if (isFirst) {
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      } else if (nums[mid] < target) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
      __rec.step({
        at: 'const mid = Math.floor((lo + hi) / 2)',
        msg:
          nums[mid] === target
            ? `mid = ${mid} 命中 ${target}！记录 ${isFirst ? '左' : '右'}边界为 ${mid}，然后${isFirst ? '别停——继续往左半找更靠左的' : '继续往右半找更靠右的'}`
            : nums[mid] < target
              ? `mid = ${mid}（值 ${nums[mid]} < ${target}）：答案只可能在右半，窗口收缩到 [${lo}, ${hi}]`
              : `mid = ${mid}（值 ${nums[mid]} > ${target}）：答案只可能在左半，窗口收缩到 [${lo}, ${hi}]`,
        views: { nums: numsSnap(lo, hi, mid, ans) },
        vars: { 轮次: isFirst ? '找左边界' : '找右边界', ans: String(ans) },
      });
    }
    return ans;
  };
  __rec.step({
    at: 'const findBound = (isFirst) => {',
    msg: '普通二分会"找到就停"，但元素可能重复出现。改造一下：找到 target 时不急着返回，而是先记下位置，再继续往' + '同一侧收缩——这样能压到最左（或最右）的那个。跑两轮就是 [第一个位置, 最后一个位置]',
    views: { nums: numsSnap(0, nums.length - 1, -1, -1) },
    vars: {},
  });
  return [findBound(true), findBound(false)];
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [5,7,7,8,8,10], 8 → [3,4]',
    run: function () {
      const r = searchRange([5, 7, 7, 8, 8, 10], 8);
      if (JSON.stringify(r) !== JSON.stringify([3, 4])) throw new Error('期望 [3,4]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: [5,7,7,8,8,10], 6 → [-1,-1]',
    run: function () {
      const r = searchRange([5, 7, 7, 8, 8, 10], 6);
      if (JSON.stringify(r) !== JSON.stringify([-1, -1])) throw new Error('期望 [-1,-1]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 空数组 → [-1,-1]',
    run: function () {
      const r = searchRange([], 1);
      if (JSON.stringify(r) !== JSON.stringify([-1, -1])) throw new Error('期望 [-1,-1]，实际 ' + JSON.stringify(r));
    },
  },
]);
