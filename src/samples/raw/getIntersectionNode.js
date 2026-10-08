// 样题「相交链表」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：双指针走对方的路（双 array + 归属跟踪）（Hot 100 · 链表）
function getIntersectionNode(headA, headB) {
  const arrA = [];
  const arrB = [];
  for (let p = headA; p !== null; p = p.next) arrA.push(p);
  for (let p = headB; p !== null; p = p.next) arrB.push(p);
  // 视图：pA / pB 各自只画在「当前归属」的链上（跳链后随指针转移）
  const makeView = (arr, paOn, pA, pbOn, pB, name) => {
    const pointers = {};
    const marks = [];
    const idxA = paOn && pA !== null ? arr.indexOf(pA) : -1;
    const idxB = pbOn && pB !== null ? arr.indexOf(pB) : -1;
    if (idxA >= 0) pointers.pA = idxA;
    if (idxB >= 0) pointers.pB = idxB;
    if (idxA >= 0 && idxA === idxB) {
      marks.push({ index: idxA, tone: 'ok' });
    } else {
      if (idxA >= 0) marks.push({ index: idxA, tone: 'active' });
      if (idxB >= 0) marks.push({ index: idxB, tone: 'warn' });
    }
    return { kind: 'array', values: arr.map((p) => String(p.val)), pointers: pointers, marks: marks, title: name };
  };
  let pA = headA;
  let pB = headB;
  let paInA = true;
  let pbInB = true;
  const views = () => ({
    a: makeView(arrA, paInA, pA, !pbInB, pB, '链表 A（走到尽头会跳到 B 的头部）'),
    b: makeView(arrB, !paInA, pA, pbInB, pB, '链表 B（走到尽头会跳到 A 的头部）'),
  });
  __rec.step({
    at: 'let pB = headB',
    msg: '两条链可能有公共的尾部（相交）。绝妙技巧：pA 走完 A 就转到 B 的头部，pB 走完 B 就转到 A 的头部——两人走的总路程相同（你走过的路我也会走完），如果有交点，必然同时到达',
    views: views(),
    vars: {},
  });
  while (pA !== pB) {
    __rec.step({
      at: 'while (pA !== pB)',
      msg: `pA 在链 ${paInA ? 'A' : 'B'} 的值 ${pA === null ? 'null' : pA.val} 处，pB 在链 ${pbInB ? 'B' : 'A'} 的值 ${pB === null ? 'null' : pB.val} 处，还不相等 → 各自前进一步${pA === null ? '（pA 已到尽头，将跳到 B 头部）' : ''}${pB === null ? '（pB 已到尽头，将跳到 A 头部）' : ''}`,
      views: views(),
      vars: {
        pA: pA === null ? 'null' : String(pA.val),
        pB: pB === null ? 'null' : String(pB.val),
      },
    });
    if (pA === null) {
      pA = headB;
      paInA = false;
    } else {
      pA = pA.next;
    }
    if (pB === null) {
      pB = headA;
      pbInB = false;
    } else {
      pB = pB.next;
    }
  }
  __rec.step({
    at: 'return pA',
    msg: pA === null
      ? '两指针同时走到了 null——两条链没有交点'
      : `两指针在值 ${pA.val} 处会合，这就是相交节点`,
    views: views(),
    vars: { 答案: pA === null ? 'null' : String(pA.val) },
  });
  return pA;
}

// ===== 测试用例 =====
function buildWithTail(vals, tail) {
  const dummy = { val: 0, next: tail };
  let p = dummy;
  for (const v of vals) {
    p.next = { val: v, next: p.next };
    p = p.next;
  }
  return dummy.next;
}
__rec.tests([
  {
    label: '示例: A=[4,1] B=[5,0,1] 共享 [8,4,5] → 交点值 8',
    run: function () {
      const shared = buildWithTail([8, 4, 5], null);
      const a = buildWithTail([4, 1], shared);
      const b = buildWithTail([5, 0, 1], shared);
      const r = getIntersectionNode(a, b);
      if (!r || r !== shared) throw new Error('期望交点节点（值 8），实际 ' + (r ? r.val : 'null'));
    },
  },
  {
    label: '边界: 无交点 A=[2,6,4] B=[1,5] → null',
    run: function () {
      const a = buildWithTail([2, 6, 4], null);
      const b = buildWithTail([1, 5], null);
      const r = getIntersectionNode(a, b);
      if (r !== null) throw new Error('期望 null，实际 ' + (r ? r.val : 'null'));
    },
  },
  {
    label: '边界: 空链 → null',
    run: function () {
      const r = getIntersectionNode(null, null);
      if (r !== null) throw new Error('期望 null，实际 ' + (r ? r.val : 'null'));
    },
  },
]);
