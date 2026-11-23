/**
 * 教学层批量生成器：为全部样题生成 lesson（策略卡 / 对比 / 预测 / 复盘）。
 * 运行：npx vite-node scripts/gen-lessons.ts
 * 预测点基于真实帧序列：取「命中(ok)前一帧」或中段帧，正确项=下一帧真实讲解，
 * 保证 atFrame 落在帧序列内（由 tests/lesson.test.ts 校验）。
 * 手工精修的 lesson（Sample.lesson）优先，生成器只补齐其余题目。
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SAMPLES } from '../src/samples'
import { CATALOG } from '../src/samples/catalog'
import { runInstrumented } from '../src/engine/protocol'
import type { Lesson } from '../src/types'

const CONTRAST: Record<string, { bad: string; good: string }> = {
  哈希: { bad: '暴力两两配对 / 重复扫描：O(n²)', good: '哈希表边扫边查：O(n)' },
  双指针: { bad: '枚举所有区间 / 配对：O(n²)', good: '双指针单调移动：O(n)' },
  滑动窗口: { bad: '枚举每个子区间再统计：O(n²)', good: '窗口伸缩一次遍历：O(n)' },
  子串: { bad: '枚举子串逐个验证：O(n²)~O(n³)', good: '前缀和 / 单调队列 / 滑窗：O(n)' },
  普通数组: { bad: '额外数组或重复扫描：O(n) 空间 / O(n²)', good: '原地操作 / 前后缀：O(1) 空间' },
  矩阵: { bad: '逐格重复模拟：O((mn)²)', good: '边界收缩 / 标记位：O(mn)' },
  链表: { bad: '数组化再重建：O(n) 空间', good: '指针原地改接：O(1) 空间' },
  二叉树: { bad: '重复遍历子树：O(n²)', good: '一次递归 / 遍历：O(n)' },
  图论: { bad: '反复全图扫描：O(V·E)', good: 'BFS/DFS/拓扑：O(V+E)' },
  回溯: { bad: '生成全部再过滤：指数级浪费', good: '剪枝回溯：只走可行分支' },
  二分查找: { bad: '线性扫描：O(n)', good: '每次折半：O(log n)' },
  栈: { bad: '反复回看历史：O(n²)', good: '单调栈 / 栈一次遍历：O(n)' },
  堆: { bad: '全排序取前 K：O(n log n)', good: '堆维护 Top-K：O(n log k)' },
  贪心: { bad: '动态规划全状态：O(n²)', good: '局部最优推全局：O(n) / O(n log n)' },
  动态规划: { bad: '递归重复子问题：指数级', good: '记忆化 / 递推填表：O(n)~O(n²)' },
  多维动态规划: { bad: '暴力枚举所有路径：指数级', good: '二维填表：O(mn)' },
  技巧: { bad: '额外空间 / 排序：O(n) 空间或 O(n log n)', good: '位运算 / 原地 / 投票：O(1) 空间' },
}

const PITFALL: Record<string, string> = {
  哈希: '易错：先查后存，避免同一个元素和自己配对。',
  双指针: '易错：移动哪一侧指针要有单调性依据，否则漏解。',
  滑动窗口: '易错：收缩窗口的条件与计数同步更新，避免越界。',
  子串: '易错：前缀和 / 队列的初始化与边界（空串、单元素）。',
  普通数组: '易错：原地修改时注意覆盖顺序，先标记后写回。',
  矩阵: '易错：行列下标与边界收缩的终止条件。',
  链表: '易错：改接前先保存 next，否则丢链；注意空链表。',
  二叉树: '易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。',
  图论: '易错：visited 标记时机，避免重复入队 / 环。',
  回溯: '易错：选择 / 撤销要成对，剪枝条件不能漏解。',
  二分查找: '易错：开闭区间与 mid 取舍决定死循环与否。',
  栈: '易错：单调栈的弹出条件与栈底哨兵。',
  堆: '易错：比较器方向（最大 / 最小堆）与堆大小维护。',
  贪心: '易错：贪心选择性质需成立，否则要改 DP。',
  动态规划: '易错：状态定义与转移方程的边界（第 0 行 / 列）。',
  多维动态规划: '易错：初始化第 0 行 / 列与遍历顺序。',
  技巧: '易错：位运算 / 原地哈希的下标映射与符号处理。',
}

function short(s: string, n = 42): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

type Frame = ReturnType<typeof runInstrumented>['frameGroups'][number][number]

function hasOk(f: Frame): boolean {
  return Object.values(f.views).some(
    (v) =>
      'marks' in v &&
      Array.isArray((v as { marks?: unknown }).marks) &&
      (v as { marks: Array<{ tone?: string }> }).marks.some((m) => m.tone === 'ok'),
  )
}
const isReturn = (f: Frame): boolean => /return/.test(f.at)

/** 动作类锚点 → 作用分类（无显式分支时用「这一步的作用是？」决策） */
function roleOf(at: string): { correct: string; wrong: [string, string] } {
  if (/return/.test(at)) return { correct: '返回结果，结束本轮 / 本次', wrong: ['交换两个元素', '把新元素加入容器'] }
  if (/\.push\(/.test(at)) return { correct: '把新元素加入容器（栈 / 队列 / 结果）', wrong: ['从容器取出元素', '排序后继续遍历'] }
  if (/\.(pop|shift)\(/.test(at)) return { correct: '从容器取出元素', wrong: ['把新元素加入容器', '排序后继续遍历'] }
  if (/sort\(/.test(at)) return { correct: '排序以简化后续处理', wrong: ['从容器取出元素', '交换两个元素'] }
  if (/\+\+|--|\^=|\+=|-=/.test(at)) return { correct: '更新状态变量，推进算法', wrong: ['返回结果，结束本轮 / 本次', '把新元素加入容器'] }
  if (/=/.test(at)) return { correct: '更新指针 / 状态，推进算法', wrong: ['返回结果，结束本轮 / 本次', '从容器取出元素'] }
  return { correct: '推进当前步骤', wrong: ['终止算法', '回退到起点'] }
}

/** 决策式预测：优先 if 分支 / 循环续退 / Math.max-min 取值，正确项由真实下一帧决定 */
function buildPredict(frames: Frame[]): Lesson['predicts'] {
  if (frames.length < 3) return undefined
  const find = (re: RegExp): number => {
    for (let i = 0; i < frames.length - 1; i++) if (re.test(frames[i]!.at)) return i
    return -1
  }
  let k = find(/if\s*\(/)
  let type: 'branch' | 'loop' | 'choice' | 'step' = 'branch'
  if (k < 0) { k = find(/(for|while)\s*\(/); type = 'loop' }
  if (k < 0) { k = find(/Math\.(max|min)/); type = 'choice' }
  if (k < 0) {
    type = 'step'
    k = -1
    for (let i = 0; i < frames.length - 1; i++) if (hasOk(frames[i + 1]!)) { k = i; break }
    if (k < 0) k = Math.min(1, frames.length - 2)
  }
  const cur = frames[k]!
  const nxt = frames[k + 1]!

  if (type === 'branch') {
    const yes = hasOk(nxt) || isReturn(nxt)
    return [{
      atFrame: k,
      question: `执行到条件判断「${short(cur.at, 30)}」。条件成立吗？`,
      options: [
        { text: yes ? '成立 → 进入命中 / 返回分支' : '不成立 → 走记录 / 继续分支', correct: true },
        { text: yes ? '不成立 → 走记录 / 继续分支' : '成立 → 进入命中 / 返回分支', correct: false },
        { text: '跳过判断直接返回', correct: false },
      ],
      explain: nxt.msg,
    }]
  }
  if (type === 'loop') {
    const cont = !isReturn(nxt)
    return [{
      atFrame: k,
      question: `循环「${short(cur.at, 30)}」：继续下一轮还是退出？`,
      options: [
        { text: cont ? '继续下一轮迭代' : '退出循环，返回结果', correct: true },
        { text: cont ? '退出循环，返回结果' : '继续下一轮迭代', correct: false },
        { text: '重置循环变量从头再来', correct: false },
      ],
      explain: nxt.msg,
    }]
  }
  if (type === 'choice') {
    return [{
      atFrame: k,
      question: `状态更新「${short(cur.at, 30)}」：两个候选取哪个？`,
      options: [
        { text: short(nxt.msg, 46), correct: true },
        { text: '保持旧值，不更新', correct: false },
        { text: '不比较，随机取一个', correct: false },
      ],
      explain: nxt.msg,
    }]
  }
  // 无 if/for/while/Math 锚点：命中前决策 → 否则动作作用
  if (hasOk(nxt)) {
    return [{
      atFrame: k,
      question: `执行到「${short(cur.at, 30)}」：此刻满足命中 / 结束条件了吗？`,
      options: [
        { text: '满足 → 命中 / 完成', correct: true },
        { text: '还没，继续推进', correct: false },
        { text: '直接放弃本轮', correct: false },
      ],
      explain: nxt.msg,
    }]
  }
  const role = roleOf(cur.at)
  return [{
    atFrame: k,
    question: `执行「${short(cur.at, 30)}」：这一步的作用是？`,
    options: [
      { text: role.correct, correct: true },
      { text: role.wrong[0], correct: false },
      { text: role.wrong[1], correct: false },
    ],
    explain: nxt.msg,
  }]
}

function buildLesson(id: string): Lesson | null {
  const sample = SAMPLES.find((s) => s.id === id)
  if (!sample) return null
  const meta = CATALOG.find((c) => c.id === id)
  const run = runInstrumented({ instrumentedCode: sample.result.instrumentedCode, fnName: sample.result.fnName })
  if (!run.ok) return null
  const frames = run.frameGroups[0] ?? []
  const cat = sample.category

  const lesson: Lesson = {
    idea: sample.result.summary,
    contrast: CONTRAST[cat] ?? { bad: '暴力枚举：高时间复杂度', good: '优化策略：线性 / 对数级' },
    takeaways: [
      `策略：${sample.result.summary}`,
      `复杂度：${meta?.complexity ?? '见播放页徽章'}（标准最优解口径）。`,
      PITFALL[cat] ?? '注意边界输入（空 / 单元素 / 重复值）。',
    ],
  }

  lesson.predicts = buildPredict(frames)
  return lesson
}

const out: Record<string, Lesson> = {}
// 手工精修内联在 samples/index.ts 的題目，生成器不覆盖
const HAND = new Set(['two-sum', 'reverse-list', 'max-sub-array'])
for (const s of SAMPLES) {
  if (HAND.has(s.id)) continue
  const l = buildLesson(s.id)
  if (l) out[s.id] = l
}

const target = fileURLToPath(new URL('../src/samples/lessons.ts', import.meta.url))
const body = `/**
 * 批量生成的教学层数据（scripts/gen-lessons.ts 产出，勿手改）。
 * 手工精修的 lesson 在 samples/index.ts 内联，优先于本表。
 * 预测点基于真实帧序列，正确项为下一帧真实讲解；由 tests/lesson.test.ts 校验。
 */
import type { Lesson } from '../types'

export const LESSONS: Record<string, Lesson> = ${JSON.stringify(out, null, 2)}
`
writeFileSync(target, body)
console.log(`generated lessons for ${Object.keys(out).length} samples -> src/samples/lessons.ts`)