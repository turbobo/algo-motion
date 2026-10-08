// 样题「跳跃游戏」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：贪心维护最远可达（array + 可达范围色带）（Hot 100 · 贪心）
function canJump(nums) {
  const n = nums.length;
  const numsSnap = (i, reach) => {
    const pointers = {};
    if (i >= 0 && i < n) pointers.当前位置 = i;
    if (reach >= 0 && reach < n) pointers.最远可达 = reach;
    return {
      kind: 'array',
      values: nums.map((v) => String(v)),
      ranges: reach >= 0 ? [{ from: 0, to: Math.min(reach, n - 1), label: '当前可达范围', tone: 'ok' }] : [],
      pointers: pointers,
      marks: i >= 0 && i < n ? [{ index: i, tone: 'active' }] : [],
      title: 'num（数字 = 从这个位置最多跳几步）',
    };
  };
  let reach = 0;
  __rec.step({
    at: 'let reach = 0',
    msg: '不用知道"具体怎么跳"，只需一路记录最远能到哪：边走边把 reach 更新成 max(reach, i + nums[i])。只要中途遇到 i > reach，就说明这个位置根本到不了，游戏结束',
    views: { nums: numsSnap(-1, reach) },
    vars: { 最远: String(reach) },
  });
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) {
      __rec.step({
        at: 'return false',
        msg: `位置 ${i} 超出了最远可达 ${reach}——这里根本到不了，不可能跳到终点`,
        views: { nums: numsSnap(i, reach) },
        vars: { 答案: 'false' },
      });
      return false;
    }
    reach = Math.max(reach, i + nums[i]);
    __rec.step({
      at: 'reach = Math.max(reach, i + nums[i])',
      msg: `站上位置 ${i}（能跳 ${nums[i]} 步）：从这里最远到 ${i + nums[i]}，和已有记录取大 → 最远可达更新为 ${reach}`,
      views: { nums: numsSnap(i, reach) },
      vars: { 最远: String(reach) },
    });
  }
  __rec.step({
    at: 'return true',
    msg: `走到最后一个位置都没断——最远可达覆盖了全程，能跳到终点！`,
    views: { nums: numsSnap(-1, reach) },
    vars: { 答案: 'true' },
  });
  return true;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [2,3,1,1,4] → true',
    run: function () {
      const r = canJump([2, 3, 1, 1, 4]);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: [3,2,1,0,4] → false',
    run: function () {
      const r = canJump([3, 2, 1, 0, 4]);
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 单元素 [0] → true（起点就是终点）',
    run: function () {
      const r = canJump([0]);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
]);
