// 样题「多数元素」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：Boyer-Moore 投票计数（array 指针 + 候选人高亮）（Hot 100 · 技巧）
function majorityElement(nums) {
  const listSnap = (i, marks) => ({
    kind: 'array',
    values: [...nums],
    pointers: i >= 0 ? { i: i } : {},
    marks: marks || [],
    title: 'nums',
  });
  let cand = nums[0];
  let count = 1;
  __rec.step({
    at: 'let count = 1',
    msg: 'Boyer-Moore 投票法：先让第一个数当候选人（1 票）。遇到相同的数就加票，遇到不同的数就减票——票数归零时换当前数为新候选人。多数元素超过一半，就算被全程针对，最后剩下的也一定是它',
    views: { list: listSnap(0, [{ index: 0, tone: 'ok' }]) },
    vars: { cand: String(cand), count: '1' },
  });
  for (let i = 1; i < nums.length; i++) {
    let action;
    if (count === 0) {
      cand = nums[i];
      count = 1;
      action = `票数归零 → 换成 ${nums[i]} 当新候选人（重新起 1 票）`;
    } else if (nums[i] === cand) {
      count++;
      action = `和候选人相同 → 加票到 ${count}`;
    } else {
      count--;
      action = `和候选人不同 → 减票到 ${count}${count === 0 ? '（票数归零，下轮换人）' : ''}`;
    }
    __rec.step({
      at: 'if (count === 0)',
      msg: `看到 ${nums[i]}：${action}`,
      views: {
        list: listSnap(i, [
          { index: i, tone: nums[i] === cand ? 'ok' : 'danger' },
        ]),
      },
      vars: { cand: String(cand), count: String(count) },
    });
  }
  __rec.step({
    at: 'return cand',
    msg: `投票结束，活下来的候选人 ${cand} 就是多数元素（出现次数超过一半）`,
    views: { list: listSnap(-1, []) },
    vars: { 答案: String(cand) },
  });
  return cand;
}
__rec.tests([
  {
    label: '示例: [2,2,1,1,1,2,2] → 2',
    run: function () {
      const r = majorityElement([2, 2, 1, 1, 1, 2, 2]);
      if (r !== 2) throw new Error('期望 2，实际 ' + r);
    },
  },
  {
    label: '示例: [3,2,3] → 3',
    run: function () {
      const r = majorityElement([3, 2, 3]);
      if (r !== 3) throw new Error('期望 3，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素 [1]',
    run: function () {
      const r = majorityElement([1]);
      if (r !== 1) throw new Error('期望 1，实际 ' + r);
    },
  },
]);
