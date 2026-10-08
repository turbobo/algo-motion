// 样题「最小栈」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：辅助最小栈（主栈 + 最小栈双 stack 视图）（Hot 100 · 栈）
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  push(val) {
    this.stack.push(val);
    if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
      this.minStack.push(val);
    }
    __rec.step({
      at: 'this.stack.push(val)',
      msg: `push ${val}：主栈照常压入；最小栈只在"${val} ≤ 当前最小 ${this.minStack[this.minStack.length - 1]}"时也压一份——这样栈顶永远同步着全局最小`,
      views: { main: this.mainSnap(), min: this.minSnap() },
      vars: { 当前最小: String(this.minStack[this.minStack.length - 1]) },
    });
  }
  pop() {
    const val = this.stack.pop();
    if (val === this.minStack[this.minStack.length - 1]) {
      this.minStack.pop();
    }
    __rec.step({
      at: 'return val',
      msg: `pop 掉 ${val}：如果它正好是最小值，最小栈也同步弹一个——两个栈永远步调一致`,
      views: { main: this.mainSnap(), min: this.minSnap() },
      vars: { 弹出: String(val) },
    });
    return val;
  }
  top() {
    __rec.step({
      at: 'return this.stack[this.stack.length - 1]',
      msg: `top 直接看主栈栈顶：${this.stack[this.stack.length - 1]}`,
      views: { main: this.mainSnap(), min: this.minSnap() },
      vars: {},
    });
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    __rec.step({
      at: 'return this.minStack[this.minStack.length - 1]',
      msg: `getMin 直接看最小栈栈顶：${this.minStack[this.minStack.length - 1]}——O(1) 拿到最小，这是整个设计的核心`,
      views: { main: this.mainSnap(), min: this.minSnap() },
      vars: { 答案: String(this.minStack[this.minStack.length - 1]) },
    });
    return this.minStack[this.minStack.length - 1];
  }
  mainSnap() {
    return {
      kind: 'stack',
      items: this.stack.map((v) => String(v)),
      marks: this.stack.length > 0 ? [{ index: this.stack.length - 1, tone: 'active' }] : [],
      title: '主栈',
    };
  }
  minSnap() {
    return {
      kind: 'stack',
      items: this.minStack.map((v) => String(v)),
      marks: this.minStack.length > 0 ? [{ index: this.minStack.length - 1, tone: 'ok' }] : [],
      title: '最小栈（栈顶 = 当前最小）',
    };
  }
}

// ===== 测试用例 =====
__rec.tests([
  {
    label: '示例: push -2, 0, -3 → getMin -3 → pop → top 0 → getMin -2',
    run: function () {
      const st = new MinStack();
      st.push(-2);
      st.push(0);
      st.push(-3);
      if (st.getMin() !== -3) throw new Error('getMin 期望 -3，实际 ' + st.getMin());
      st.pop();
      if (st.top() !== 0) throw new Error('top 期望 0，实际 ' + st.top());
      if (st.getMin() !== -2) throw new Error('getMin 期望 -2，实际 ' + st.getMin());
    },
  },
  {
    label: '示例: push 1, 1 → getMin 1 → pop → getMin 1（含重复最小）',
    run: function () {
      const st = new MinStack();
      st.push(1);
      st.push(1);
      if (st.getMin() !== 1) throw new Error('getMin 期望 1，实际 ' + st.getMin());
      st.pop();
      if (st.getMin() !== 1) throw new Error('pop 后 getMin 期望 1，实际 ' + st.getMin());
    },
  },
  {
    label: '边界: 单元素 push 5 → top 5, getMin 5',
    run: function () {
      const st = new MinStack();
      st.push(5);
      if (st.top() !== 5) throw new Error('top 期望 5，实际 ' + st.top());
      if (st.getMin() !== 5) throw new Error('getMin 期望 5，实际 ' + st.getMin());
    },
  },
]);
