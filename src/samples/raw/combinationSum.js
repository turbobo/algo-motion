// 样题「组合总和」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：可重复选取的回溯 + 剪枝（path + res）（Hot 100 · 回溯）
function combinationSum(candidates, target) {
  const res = [];
  const path = [];
  const pathSnap = () => ({
    kind: 'array',
    values: path.length > 0 ? [...path] : ['(未选)'],
    marks: path.length > 0 ? [{ index: path.length - 1, tone: 'active' }] : [],
    title: '当前组合',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((r) => r.join('+')),
    title: `已收集的组合（共 ${res.length} 个）`,
  });
  const __stack = [];
  const backtrack = (start, remain) => {
    __stack.push(`backtrack(剩 ${remain})`);
    if (remain === 0) {
      res.push([...path]);
      __rec.step({
        at: 'res.push([...path])',
        msg: `${path.join(' + ')} = ${target} 正好凑满！收入结果——然后回溯，把最后一个数换掉再试`,
        views: { path: pathSnap(), res: resSnap() },
        vars: { 剩余: '0', 已收集: String(res.length) },
        stack: [...__stack],
      });
      __stack.pop();
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remain) {
        continue;
      }
      path.push(candidates[i]);
      const left = remain - candidates[i];
      __rec.step({
        at: 'path.push(candidates[i])',
        msg: `选 ${candidates[i]}，还差 ${left}${left === 0 ? '——刚好凑满！' : '。因为每个数可以重复用，下一层还从自己开始选（再往后会越选越大）'}`,
        views: { path: pathSnap(), res: resSnap() },
        vars: { 当前和: String(target - left), 剩余: String(left) },
        stack: [...__stack],
      });
      backtrack(i, remain - candidates[i]);
      path.pop();
    }
    __stack.pop();
  };
  __rec.step({
    at: 'const backtrack = (start, remain) => {',
    msg: `候选 [${candidates.join(', ')}]，目标 ${target}。每个数可以重复选——用 remain（还剩多少）当剪枝器：候选比 remain 大就跳过，正好减到 0 就收一个组合`,
    views: { path: pathSnap(), res: resSnap() },
    vars: { 目标: String(target) },
    stack: [`backtrack(剩 ${target})`],
  });
  backtrack(0, target);
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [2,3,6,7], 7 → [[2,2,3],[7]]',
    run: function () {
      const r = combinationSum([2, 3, 6, 7], 7);
      if (JSON.stringify(r) !== JSON.stringify([[2, 2, 3], [7]])) throw new Error('期望 [[2,2,3],[7]]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '示例: [2,3,5], 8 → [[2,2,2,2],[2,3,3],[3,5]]',
    run: function () {
      const r = combinationSum([2, 3, 5], 8);
      if (JSON.stringify(r) !== JSON.stringify([[2, 2, 2, 2], [2, 3, 3], [3, 5]])) {
        throw new Error('期望 [[2,2,2,2],[2,3,3],[3,5]]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '边界: [2], 1 → []（全都超了）',
    run: function () {
      const r = combinationSum([2], 1);
      if (JSON.stringify(r) !== JSON.stringify([])) throw new Error('期望 []，实际 ' + JSON.stringify(r));
    },
  },
]);
