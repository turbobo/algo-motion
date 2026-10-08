// 样题「寻找重复数」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：数值当索引的快慢指针（环形检测）（Hot 100 · 技巧）
function findDuplicate(nums) {
  // 指针值是「下标」，必须落在 [0, len) 内才可绘制（值可能等于 len）
  const listSnap = (slowIdx, fastIdx, marks) => {
    const pointers = {};
    if (slowIdx >= 0 && slowIdx < nums.length) pointers.slow = slowIdx;
    if (fastIdx >= 0 && fastIdx < nums.length) pointers.fast = fastIdx;
    return {
      kind: 'array',
      values: [...nums],
      marks: (marks || []).filter((m) => m.index >= 0 && m.index < nums.length),
      pointers: pointers,
      title: 'nums（把 i → nums[i] 看成一条链：值指向下一个下标）',
    };
  };
  let slow = nums[0];
  let fast = nums[0];
  __rec.step({
    at: 'let fast = nums[0]',
    msg: '重复数让「i → nums[i]」这张图必然出现环（两个下标指向同一个值）。把数组当链表跑 Floyd 判环：慢指针走一步、快指针走两步，它们一定会在环里相遇',
    views: { list: listSnap(slow, fast, [{ index: slow, tone: 'active' }]) },
    vars: { slow: String(slow), fast: String(fast) },
  });
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  __rec.step({
    at: 'while (slow !== fast)',
    msg: `两指针在值 ${slow} 处相遇（此时在下标 ${slow}）——相遇点只是"证明有环"，还不一定是环的入口（重复数）`,
    views: { list: listSnap(slow, fast, [{ index: slow, tone: 'warn' }]) },
    vars: { 相遇于: String(slow) },
  });
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
    __rec.step({
      at: 'fast = nums[fast]',
      msg: `重置后的慢指针从起点出发、快指针留在相遇点，两者同速前进：slow → ${slow}，fast → ${fast}`,
      views: { list: listSnap(slow, fast, [{ index: slow, tone: 'active' }]) },
      vars: { slow: String(slow), fast: String(fast) },
    });
  }
  __rec.step({
    at: 'return slow',
    msg: `两指针在值 ${slow} 处再次相遇——这一次相遇点就是环的入口，也就是要找的重复数`,
    views: { list: listSnap(slow, fast, [{ index: slow, tone: 'ok' }]) },
    vars: { 答案: String(slow) },
  });
  return slow;
}
__rec.tests([
  {
    label: '示例: [1,3,4,2,2] → 2',
    run: function () {
      const r = findDuplicate([1, 3, 4, 2, 2]);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '示例: [3,1,3,4,2] → 3',
    run: function () {
      const r = findDuplicate([3, 1, 3, 4, 2]);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '边界: [1,1] → 1',
    run: function () {
      const r = findDuplicate([1, 1]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
