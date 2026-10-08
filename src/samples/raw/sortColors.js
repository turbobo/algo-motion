// 样题「颜色分类」的插桩版代码（模拟 LLM 插桩产物）
// 覆盖场景：荷兰国旗三指针分区（array 三指针 + 交换高亮）（Hot 100 · 技巧）
function sortColors(nums) {
  const listSnap = (marks) => {
    // 指针可能落在 [0, len) 之外（mid 扫到尽头、high 收缩到 -1），越界的不绘制
    const pointers = {};
    if (low < nums.length) pointers.low = low;
    if (mid < nums.length) pointers.mid = mid;
    if (high >= 0 && high < nums.length) pointers.high = high;
    return {
      kind: 'array',
      values: [...nums],
      pointers: pointers,
      marks: marks || [],
      title: 'nums（0=红 1=白 2=蓝）',
    };
  };
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  __rec.step({
    at: 'let high = nums.length - 1',
    msg: '荷兰国旗问题：三个指针把数组分成四个区——[0, low) 全是 0、[low, mid) 全是 1、(high, n-1] 全是 2、[mid, high] 还是未处理的乱区。mid 向前扫，根据颜色决定怎么扩张',
    views: { list: listSnap([]) },
    vars: { low: '0', mid: '0', high: String(high) },
  });
  while (mid <= high) {
    if (nums[mid] === 0) {
      const tmp = nums[low];
      nums[low] = nums[mid];
      nums[mid] = tmp;
      low++;
      mid++;
      __rec.step({
        at: 'nums[mid] = tmp',
        msg: `mid 遇到 0 → 和 low 位置交换，把它送到红色区；low 和 mid 一起前进（换过来的必然是 1，已归位）`,
        views: {
          list: listSnap(
            low - 1 === mid - 1
              ? [{ index: mid - 1, tone: 'danger' }]
              : [
                  { index: low - 1, tone: 'danger' },
                  { index: mid - 1, tone: 'warn' },
                ],
          ),
        },
        vars: { low: String(low), mid: String(mid), high: String(high) },
      });
    } else if (nums[mid] === 1) {
      mid++;
      __rec.step({
        at: 'mid++',
        msg: `mid 遇到 1 → 它已经在白色区的正确位置，mid 直接前进`,
        views: { list: listSnap([{ index: mid - 1, tone: 'ok' }]) },
        vars: { low: String(low), mid: String(mid), high: String(high) },
      });
    } else {
      const tmp = nums[mid];
      nums[mid] = nums[high];
      nums[high] = tmp;
      high--;
      __rec.step({
        at: 'nums[high] = tmp',
        msg: `mid 遇到 2 → 和 high 位置交换，把它甩到蓝色区；high 收缩——换过来的数还没看过，mid 原地不动继续审察`,
        views: {
          list: listSnap(
            high + 1 === mid
              ? [{ index: mid, tone: 'ok' }]
              : [
                  { index: high + 1, tone: 'ok' },
                  { index: mid, tone: 'warn' },
                ],
          ),
        },
        vars: { low: String(low), mid: String(mid), high: String(high) },
      });
    }
  }
  __rec.step({
    at: 'return nums',
    msg: `mid 越过 high，乱区清空——三个区域各就各位：[${nums.join(', ')}]`,
    views: { list: listSnap([]) },
    vars: { 答案: `[${nums.join(', ')}]` },
  });
  return nums;
}
__rec.tests([
  {
    label: '示例: [2,0,2,1,1,0]',
    run: function () {
      const r = sortColors([2, 0, 2, 1, 1, 0]);
      if (JSON.stringify(r) !== JSON.stringify([0, 0, 1, 1, 2, 2])) {
        throw new Error('期望 [0,0,1,1,2,2]，实际 ' + JSON.stringify(r));
      }
    },
  },
  {
    label: '示例: [2,0,1]',
    run: function () {
      const r = sortColors([2, 0, 1]);
      if (JSON.stringify(r) !== JSON.stringify([0, 1, 2])) throw new Error('期望 [0,1,2]，实际 ' + JSON.stringify(r));
    },
  },
  {
    label: '边界: 全同色 [1,1]',
    run: function () {
      const r = sortColors([1, 1]);
      if (JSON.stringify(r) !== JSON.stringify([1, 1])) throw new Error('期望 [1,1]，实际 ' + JSON.stringify(r));
    },
  },
]);
