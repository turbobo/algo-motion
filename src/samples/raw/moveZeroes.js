// 样题「移动零」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：快慢双指针原地交换（Hot 100 · 双指针）
function moveZeroes(nums) {
  const listSnap = (fast, slow, marks) => ({
    kind: 'array',
    values: [...nums],
    marks: marks || [],
    pointers: fast >= 0 ? { fast: fast, slow: slow } : {},
    title: 'nums',
  });
  let slow = 0;
  __rec.step({
    at: 'let slow = 0',
    msg: '目标：把所有 0 移到末尾，非零数的相对顺序不变。用一个快指针扫数组，一个慢指针指着"下一个非零数该放的位置"',
    views: { list: listSnap(0, 0, []) },
    vars: { slow: '0' },
  });
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      const tmp = nums[slow];
      nums[slow] = nums[fast];
      nums[fast] = tmp;
      slow++;
      __rec.step({
        at: 'slow++',
        msg: `fast 发现非零数（交换前是 ${nums[slow - 1]}）→ 和 slow 位置的数交换，非零区扩大一格：slow = ${slow}`,
        views: {
          list: listSnap(
            fast,
            slow - 1,
            slow - 1 === fast
              ? [{ index: fast, tone: 'ok' }]
              : [
                  { index: slow - 1, tone: 'ok' },
                  { index: fast, tone: 'warn' },
                ],
          ),
        },
        vars: { slow: String(slow), fast: String(fast) },
      });
    } else {
      __rec.step({
        at: 'if (nums[fast] !== 0)',
        msg: `fast 遇到 0 —— 原地跳过，让它暂时待着，等后面的非零数来跟它交换`,
        views: { list: listSnap(fast, slow, [{ index: fast, tone: 'muted' }]) },
        vars: { slow: String(slow), fast: String(fast) },
      });
    }
  }
  __rec.step({
    at: 'return nums',
    msg: `扫描完成：所有非零数都按原顺序挤到了前面，剩下的自然全是 0`,
    views: { list: listSnap(-1, -1, []) },
    vars: { 结果: JSON.stringify(nums) },
  });
  return nums;
}
__rec.tests([
  {
    label: '示例: [0,1,0,3,12] → [1,3,12,0,0]',
    run: function () {
      const r = moveZeroes([0, 1, 0, 3, 12]);
      if (JSON.stringify(r) !== JSON.stringify([1, 3, 12, 0, 0])) {
        throw new Error('期望 [1,3,12,0,0]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: 没有零',
    run: function () {
      const r = moveZeroes([1, 2, 3]);
      if (JSON.stringify(r) !== JSON.stringify([1, 2, 3])) throw new Error('期望 [1,2,3]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 全是零',
    run: function () {
      const r = moveZeroes([0, 0]);
      if (JSON.stringify(r) !== JSON.stringify([0, 0])) throw new Error('期望 [0,0]，实际 ' + JSON.stringify(r));
    },
  },
]);
