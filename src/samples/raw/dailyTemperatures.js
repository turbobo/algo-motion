// 样题「每日温度」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：单调栈（气温 array + 等待栈 + 结果 array）（Hot 100 · 栈）
function dailyTemperatures(temperatures) {
  const res = new Array(temperatures.length).fill(0);
  const stack = [];
  const tSnap = (i) => ({
    kind: 'array',
    values: temperatures.map((v) => String(v)),
    pointers: i >= 0 && i < temperatures.length ? { 今天: i } : {},
    marks: i >= 0 && i < temperatures.length ? [{ index: i, tone: 'active' }] : [],
    title: '气温（高亮 = 今天）',
  });
  const stackSnap = () => ({
    kind: 'stack',
    items: stack.map((k) => `${k}日(${temperatures[k]}°)`),
    marks: stack.length > 0 ? [{ index: stack.length - 1, tone: 'warn' }] : [],
    title: '还没等到更暖天气的日子（越往栈顶越近）',
  });
  const resSnap = () => ({
    kind: 'array',
    values: res.map((v) => String(v)),
    title: '结果（还要等几天）',
  });
  __rec.step({
    at: 'const stack = [];',
    msg: '单调栈的经典题：栈里存"还没等到更暖天气"的日子（它们的温度从底到顶递减）。今天温度一出，把所有比它冷的日子一次性结账——每个日子最多进出栈一次，所以是 O(n)',
    views: { t: tSnap(-1), stack: stackSnap(), res: resSnap() },
    vars: {},
  });
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prev = stack.pop();
      res[prev] = i - prev;
      __rec.step({
        at: 'res[prev] = i - prev',
        msg: `今天 ${temperatures[i]}° 比 ${prev} 日（${temperatures[prev]}°）暖——${prev} 日等到了答案：${i - prev} 天。弹出结账，继续看栈里还有没有人也在等`,
        views: { t: tSnap(i), stack: stackSnap(), res: resSnap() },
        vars: { 结账: `${prev} 日 → ${i - prev} 天` },
      });
    }
    stack.push(i);
  }
  __rec.step({
    at: 'return res',
    msg: '扫完了，栈里剩下的日子再也不会更暖——它们的结果就是 0。每个下标最多进出栈一次，整个过程 O(n)',
    views: { t: tSnap(-1), stack: stackSnap(), res: resSnap() },
    vars: { 答案: JSON.stringify(res) },
  });
  return res;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0]',
    run: function () {
      const r = dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]);
      if (JSON.stringify(r) !== JSON.stringify([1, 1, 4, 2, 1, 1, 0, 0])) {
        throw new Error('期望 [1,1,4,2,1,1,0,0]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '示例: [30,40,50,60] → [1,1,1,0]',
    run: function () {
      const r = dailyTemperatures([30, 40, 50, 60]);
      if (JSON.stringify(r) !== JSON.stringify([1, 1, 1, 0])) throw new Error('期望 [1,1,1,0]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: [30,60,90] → [1,1,0]',
    run: function () {
      const r = dailyTemperatures([30, 60, 90]);
      if (JSON.stringify(r) !== JSON.stringify([1, 1, 0])) throw new Error('期望 [1,1,0]，实际 ' + JSON.stringify(r));
    },
  },
]);
