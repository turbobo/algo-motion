// 样题「三数之和」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：排序 + 固定一数 + 左右双指针 + 去重（Hot 100 · 双指针）
function threeSum(nums) {
  const numsSnap = (i, l, r, marks) => ({
    kind: 'array',
    values: [...nums],
    pointers: l >= 0 ? { i: i, left: l, right: r } : i >= 0 ? { i: i } : {},
    marks: marks || [],
    title: 'nums（已排序）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((t) => t.join(',')),
    title: '答案（不重复的三元组）',
  });
  nums.sort((a, b) => a - b);
  const res = [];
  __rec.step({
    at: 'nums.sort((a, b) => a - b)',
    msg: '第一步一定要先排序！排序后才能用双指针从两端往中间收紧，也才能通过跳过来去重。之后固定一个数 nums[i]，在它右边找两数之和 = -nums[i]',
    views: { nums: numsSnap(-1, -1, -1, []), res: resSnap() },
    vars: {},
  });
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      __rec.step({
        at: 'if (i > 0 && nums[i] === nums[i - 1]) continue',
        msg: `nums[${i}] = ${nums[i]} 和上一个被固定的数相同 → 同样的两数已经被找过，直接跳过这个 i，避免答案重复`,
        views: { nums: numsSnap(i, -1, -1, [{ index: i, tone: 'muted' }]), res: resSnap() },
        vars: { i: String(i) },
      });
      continue;
    }
    let left = i + 1;
    let right = nums.length - 1;
    __rec.step({
      at: 'let right = nums.length - 1',
      msg: `固定 nums[${i}] = ${nums[i]}：接下来在 (${i + 1} ~ ${nums.length - 1}) 区间里，用左右指针找和为 ${-nums[i]} 的两个数`,
      views: { nums: numsSnap(i, left, right, [{ index: i, tone: 'active' }]), res: resSnap() },
      vars: { i: String(i), 目标两数和: String(-nums[i]) },
    });
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      const verdict = sum === 0 ? '正好等于 0 —— 命中！' : sum < 0 ? '偏小 → left 右移搏更大的数' : '偏大 → right 左移搏更小的数';
      __rec.step({
        at: 'const sum = nums[i] + nums[left] + nums[right]',
        msg: `${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum}：${verdict}`,
        views: {
          nums: numsSnap(i, left, right, [
            { index: i, tone: 'active' },
            { index: left, tone: sum === 0 ? 'ok' : 'warn' },
            { index: right, tone: sum === 0 ? 'ok' : 'warn' },
          ]),
          res: resSnap(),
        },
        vars: { i: String(i), sum: String(sum) },
      });
      if (sum === 0) {
        res.push([nums[i], nums[left], nums[right]]);
        __rec.step({
          at: 'res.push([nums[i], nums[left], nums[right]])',
          msg: `收获一组答案 [${nums[i]}, ${nums[left]}, ${nums[right]}]！接下来要把 left/right 跳过相同的数，防止重复三元组`,
          views: {
            nums: numsSnap(i, left, right, [
              { index: i, tone: 'ok' },
              { index: left, tone: 'ok' },
              { index: right, tone: 'ok' },
            ]),
            res: resSnap(),
          },
          vars: { 已找到: `${res.length} 组` },
        });
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  __rec.step({
    at: 'return res',
    msg: `全部枚举完成，共找到 ${res.length} 组不重复的三元组`,
    views: { nums: numsSnap(-1, -1, -1, []), res: resSnap() },
    vars: { 答案: `${res.length} 组` },
  });
  return res;
}
__rec.tests([
  {
    label: '示例: [-1,0,1,2,-1,-4]',
    run: function () {
      const r = threeSum([-1, 0, 1, 2, -1, -4]);
      const norm = r.map((t) => t.join(',')).sort();
      if (JSON.stringify(norm) !== JSON.stringify(['-1,-1,2', '-1,0,1'])) {
        throw new Error('期望 [-1,-1,2] 与 [-1,0,1]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: 全零 [0,0,0,0]',
    run: function () {
      const r = threeSum([0, 0, 0, 0]);
      if (JSON.stringify(r) !== JSON.stringify([[0, 0, 0]])) throw new Error('期望 [[0,0,0]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 无解 [1,2,3]',
    run: function () {
      const r = threeSum([1, 2, 3]);
      if (r.length !== 0) throw new Error('期望 []，实际 ' + JSON.stringify(r));
    },
  },
]);
