// 样题「课程表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：Kahn 拓扑排序（依赖图 graph + 入度 array + 队列）（Hot 100 · 图论）
function canFinish(numCourses, prerequisites) {
  const indegree = new Array(numCourses).fill(0);
  const graph = new Map();
  const studiedSet = new Set();
  const graphSnap = (cur) => ({
    kind: 'graph',
    nodes: Array.from({ length: numCourses }, (unused, i) => ({ id: 'c' + i, label: String(i) })),
    edges: [...graph.entries()].flatMap(([from, tos]) => tos.map((to) => ['c' + from, 'c' + to])),
    marks: Array.from({ length: numCourses }, (unused, i) => i).flatMap((i) => {
      if (cur === i) return [{ id: 'c' + i, tone: 'active' }];
      if (studiedSet.has(i)) return [{ id: 'c' + i, tone: 'ok' }];
      return [];
    }),
    title: '依赖图（箭头 = 先修 → 解锁；绿 = 已修完，橙 = 当前）',
  });
  const indegreeSnap = (hi) => ({
    kind: 'array',
    values: indegree.map((v) => String(v)),
    pointers: hi !== undefined && hi >= 0 ? { 当前: hi } : {},
    title: '入度表：每门课还剩几门前置',
  });
  const queueSnap = (queue) => ({
    kind: 'array',
    values: queue.map((c) => String(c)),
    pointers: queue.length > 0 ? { 队首: 0 } : {},
    title: '可以立刻上的课（入度为 0）',
  });
  for (const pair of prerequisites) {
    const course = pair[0];
    const need = pair[1];
    indegree[course]++;
    if (!graph.has(need)) {
      graph.set(need, []);
    }
    graph.get(need).push(course);
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) {
      queue.push(i);
    }
  }
  __rec.step({
    at: 'let studied = 0',
    msg: `建好图：每对 [a, b] 表示"上 b 之前必须先上 a"。入度为 0 的课（${queue.length} 门）可以直接修——先进队列`,
    views: { graph: graphSnap(null), indegree: indegreeSnap(-1), queue: queueSnap(queue) },
    vars: { 已选出: String(queue.length) },
  });
  let studied = 0;
  while (queue.length > 0) {
    const cur = queue.shift();
    studied++;
    studiedSet.add(cur);
    const unlocked = [];
    for (const next of graph.get(cur) || []) {
      indegree[next]--;
      if (indegree[next] === 0) {
        unlocked.push(next);
        queue.push(next);
      }
    }
    __rec.step({
      at: 'if (indegree[next] === 0)',
      msg: unlocked.length > 0
        ? `修完课 ${cur}（累计 ${studied} 门）：把它解锁的课入度各减 1，其中 [${unlocked.join(', ')}] 入度降到 0——可以排队上了`
        : `修完课 ${cur}（累计 ${studied} 门）：它没有解锁新的课（入度减掉后仍 > 0 或没有后继）`,
      views: { graph: graphSnap(cur), indegree: indegreeSnap(-1), queue: queueSnap(queue) },
      vars: { 刚修: String(cur), 已修: String(studied) },
    });
  }
  __rec.step({
    at: 'return studied === numCourses',
    msg:
      studied === numCourses
        ? `一共修完了 ${studied} 门 = 全部课程——没有环，可以完成（拓扑序存在）`
        : `只修完 ${studied} 门 < ${numCourses} 门——剩下的课互相锁死（成环），永远上不了`,
    views: { graph: graphSnap(null), indegree: indegreeSnap(-1), queue: queueSnap([]) },
    vars: { 答案: String(studied === numCourses) },
  });
  return studied === numCourses;
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: 4 门链式 [[1,0],[2,1],[3,2]] → true',
    run: function () {
      const r = canFinish(4, [[1, 0], [2, 1], [3, 2]]);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
  {
    label: '示例: 环 [[1,0],[0,1]] → false',
    run: function () {
      const r = canFinish(2, [[1, 0], [0, 1]]);
      if (r !== false) throw new Error('期望 false，实际 ' + r);
    },
  },
  {
    label: '边界: 无先修 [[], ] 3 门 → true',
    run: function () {
      const r = canFinish(3, []);
      if (r !== true) throw new Error('期望 true，实际 ' + r);
    },
  },
]);
