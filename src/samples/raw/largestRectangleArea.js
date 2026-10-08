// 样题「柱状图中最大的矩形」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：递增栈找左右界（柱高 array + 色带矩形 + 栈）（Hot 100 · 栈）
function largestRectangleArea(heights) {
  const stack = [];
  let best = 0;
  const n = heights.length;
  const hSnap = (left, right, height) => {
    const from = left + 1;
    const to = right - 1;
    return {
      kind: 'array',
      values: heights.map((v) => String(v)),
      ranges:
        from >= 0 && to >= 0 && to < n && from <= to
          ? [{ from: from, to: to, label: `宽 ${to - from + 1} × 高 ${height}`, tone: 'warn' }]
          : [],
      title: '柱高（色带 = 当前计算的矩形）',
    };
  };
  const stackSnap = () => ({
    kind: 'stack',
    items: stack.map((k) => `${k}(${heights[k]})`),
    marks: stack.length > 0 ? [{ index: stack.length - 1, tone: 'ok' }] : [],
    title: '递增栈（高度从底到顶递增）',
  });
  const ext = [...heights, 0];
  __rec.step({
    at: 'const ext = [...heights, 0];',
    msg: '最大矩形一定以某根柱子为"最短的那根"。维护一个递增栈：谁比栈顶矮，栈顶的柱子就"退休"了——它左右能延伸的范围就此确定，结算它的矩形面积。末尾补一根高度 0 的柱子，把所有柱子强制结算',
    views: { h: hSnap(-1, -1, 0), stack: stackSnap() },
    vars: {},
  });
  for (let i = 0; i < ext.length; i++) {
    while (stack.length > 0 && ext[i] < ext[stack[stack.length - 1]]) {
      const h = ext[stack.pop()];
      const left = stack.length === 0 ? -1 : stack[stack.length - 1];
      const area = h * (i - left - 1);
      best = Math.max(best, area);
      __rec.step({
        at: 'const area = h * (i - left - 1)',
        msg: `高度 ${h} 的柱子退休：它向左能到 ${left + 1}、向右到 ${i - 1}，宽 ${i - left - 1} × 高 ${h} = 面积 ${area}${area >= best ? '——刷新纪录！' : `（当前纪录 ${best}）`}`,
        views: { h: hSnap(left, i, h), stack: stackSnap() },
        vars: { 面积: String(area), 目前最大: String(best) },
      });
    }
    stack.push(i);
  }
  __rec.step({
    at: 'return best',
    msg: `遍历结束——柱状图里能画出的最大矩形面积是 ${best}`,
    views: { h: hSnap(-1, -1, 0), stack: stackSnap() },
    vars: { 答案: String(best) },
  });
  return best;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: [2,1,5,6,2,3] → 10',
    run: function () {
      const r = largestRectangleArea([2, 1, 5, 6, 2, 3]);
      if (r !== 10) throw new Error('期望 10，实际 ' + r);
    },
  },
  {
    label: '示例: [2,4] → 4',
    run: function () {
      const r = largestRectangleArea([2, 4]);
      if (r !== 4) throw new Error('期望 4，实际 ' + r);
    },
  },
  {
    label: '边界: 全相同 [3,3,3] → 9',
    run: function () {
      const r = largestRectangleArea([3, 3, 3]);
      if (r !== 9) throw new Error('期望 9，实际 ' + r);
    },
  },
]);
