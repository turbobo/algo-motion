// 样题「反转链表」的插桩版代码（模拟 LLM 插桩产物）
// 链表视图关键设计：为原节点分配稳定 id（n1, n2...），跨帧保持同一节点可做过渡动画
function reverseList(head) {
  // 给每个原始节点分配稳定 id，让播放器能把同一个节点在帧之间对上
  const ids = new Map();
  let counter = 1;
  for (let p = head; p !== null; p = p.next) {
    ids.set(p, 'n' + counter++);
  }
  const idOf = (p) => (p && ids.has(p) ? ids.get(p) : null);
  const valOf = (p) => (p === null ? 'null' : String(p.val));
  const snap = (pointers, marks) => ({
    kind: 'linkedlist',
    nodes: [...ids.entries()].map(([p, id]) => ({ id: id, value: String(p.val) })),
    next: [...ids.entries()].map(([p, id]) => [id, idOf(p.next)]),
    pointers: pointers,
    // 空链表等场景下 idOf() 返回 null，这类幽灵标注直接不画
    marks: (marks || []).filter((m) => m && m.id),
    title: '链表',
  });
  __rec.step({
    at: 'let prev = null',
    msg: '先摆好两个指针：prev = null（反转后它将成为表尾），curr = 表头，从第一个节点开始处理。',
    views: {
      list: snap({ prev: null, curr: idOf(head) }, []),
    },
    vars: { prev: 'null', curr: '链头' },
  });
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;
    __rec.step({
      at: 'const next = curr.next',
      msg: `curr 指向 ${idOf(curr)}（值 ${curr.val}）。先把下一站 ${next ? idOf(next) + '（值 ' + next.val + '）' : 'null'} 存进 next——掰断箭头前先记好去路，不然链就丢了。`,
      views: {
        list: snap({ prev: idOf(prev), curr: idOf(curr), next: idOf(next) }, []),
      },
      vars: { prev: valOf(prev), curr: valOf(curr), next: valOf(next) },
    });
    curr.next = prev;
    __rec.step({
      at: 'curr.next = prev',
      msg: `${idOf(curr)} 的箭头掰向回头：从指向 ${next ? idOf(next) : 'null'} 改为指向 ${prev ? idOf(prev) + '（值 ' + prev.val + '）' : 'null'}，反转完成一步。`,
      views: {
        list: snap({ prev: idOf(prev), curr: idOf(curr), next: idOf(next) }, [{ id: idOf(curr), tone: 'ok' }]),
      },
      vars: { prev: valOf(prev), curr: valOf(curr), next: valOf(next) },
    });
    prev = curr;
    __rec.step({
      at: 'prev = curr',
      msg: `prev 前进到 ${idOf(prev)}：它成为后面节点掰箭头时的"回头目标"。`,
      views: {
        list: snap({ prev: idOf(prev), curr: idOf(curr), next: idOf(next) }, []),
      },
      vars: { prev: valOf(prev), curr: valOf(curr), next: valOf(next) },
    });
    curr = next;
    __rec.step({
      at: 'curr = next',
      msg: curr
        ? `curr 前进到 ${idOf(curr)}，进入下一轮。`
        : 'curr 变成 null——所有箭头都掰完了，while 循环退出。',
      views: {
        list: snap({ prev: idOf(prev), curr: idOf(curr), next: null }, curr ? [] : [{ id: idOf(prev), tone: 'warn' }]),
      },
      vars: { prev: valOf(prev), curr: valOf(curr), next: 'null' },
    });
  }
  __rec.step({
    at: 'return prev',
    msg: `返回 prev：它指向最后处理过的节点 ${idOf(prev)}——这就是反转后的新表头。`,
    views: {
      list: snap({ curr: idOf(prev) }, [{ id: idOf(prev), tone: 'ok' }]),
    },
    vars: { 返回: '新表头 ' + idOf(prev) },
  });
  return prev;
}

// ===== 测试用例 =====
function buildList(vals) {
  const dummy = { val: 0, next: null };
  let p = dummy;
  for (let i = 0; i < vals.length; i++) {
    p.next = { val: vals[i], next: null };
    p = p.next;
  }
  return dummy.next;
}
function dump(node) {
  const out = [];
  let guard = 0;
  while (node !== null && guard++ < 100) {
    out.push(node.val);
    node = node.next;
  }
  return out.join('→');
}
__rec.tests([
  {
    label: '示例: 1→2→3 反转',
    run: function () {
      const r = reverseList(buildList([1, 2, 3]));
      if (dump(r) !== '3→2→1') throw new Error('期望 3→2→1，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 单节点 5',
    run: function () {
      const r = reverseList(buildList([5]));
      if (dump(r) !== '5') throw new Error('期望 5，实际 ' + dump(r));
    },
  },
  {
    label: '边界: 空链表',
    run: function () {
      const r = reverseList(null);
      if (r !== null) throw new Error('期望 null，实际 ' + (r === null ? 'null' : dump(r)));
    },
  },
]);
