/**
 * 解题工作台原型数据
 *
 * 首批只精修 3 道 Hot 100（两数之和 / 最大子数组和 / 接雨水），
 * 其余题库继续走现有动画链路。判题结果为模拟数据，接入真实后端时整体替换。
 */
import type {
  SolveLanguage,
  SolveProblem,
  SubmissionRecord,
  SubmissionResult,
  Verdict,
  VerdictMeta,
} from './types'

export const LANGUAGE_OPTIONS: ReadonlyArray<{ value: SolveLanguage; label: string }> = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
]

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  accepted: { label: '通过', code: 'AC', tone: 'ok' },
  wrong_answer: { label: '解答错误', code: 'WA', tone: 'danger' },
  time_limit: { label: '超出时间限制', code: 'TLE', tone: 'warn' },
  compile_error: { label: '编译错误', code: 'CE', tone: 'danger' },
  runtime_error: { label: '运行时错误', code: 'RE', tone: 'danger' },
}

/** 原型走查用：按顺序强制切换判题结论 */
export const VERDICT_ORDER: Verdict[] = [
  'accepted',
  'wrong_answer',
  'time_limit',
  'compile_error',
  'runtime_error',
]

export const MOCK_PROBLEMS: SolveProblem[] = [
  {
    id: 'two-sum',
    number: 1,
    title: '两数之和',
    difficulty: '简单',
    category: '哈希',
    description:
      '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n\n' +
      '你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。你可以按任意顺序返回答案。',
    examples: [
      {
        id: 'two-sum-ex-1',
        label: '示例 1',
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: '因为 nums[0] + nums[1] == 9，返回 [0, 1]。',
      },
      {
        id: 'two-sum-ex-2',
        label: '示例 2',
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        id: 'two-sum-ex-3',
        label: '示例 3',
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      '只会存在一个有效答案',
    ],
    hints: [
      '暴力解法是两层循环枚举所有配对，时间复杂度 O(n²)，在 10^4 规模下会超时。',
      '把「已经见过的数」记到哈希表里，扫到 nums[i] 时查 target − nums[i] 是否出现过。',
      '哈希表存「值 → 下标」；命中时返回 [之前的下标, 当前下标]。',
    ],
    starterCode: {
      javascript:
        '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // TODO: 在这里写你的解法\n}',
      python:
        'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # TODO: 在这里写你的解法\n        pass',
      java:
        'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: 在这里写你的解法\n        return new int[]{};\n    }\n}',
    },
    sampleTests: [
      {
        id: 'two-sum-case-1',
        label: '示例 1',
        input: 'nums = [2,7,11,15], target = 9',
        expected: '[0,1]',
      },
      {
        id: 'two-sum-case-2',
        label: '示例 2',
        input: 'nums = [3,2,4], target = 6',
        expected: '[1,2]',
      },
      {
        id: 'two-sum-case-3',
        label: '边界',
        input: 'nums = [3,3], target = 6',
        expected: '[0,1]',
      },
    ],
    hiddenCaseCount: 12,
    animationId: 'two-sum',
    acceptanceRate: 52.3,
  },
  {
    id: 'max-sub-array',
    number: 53,
    title: '最大子数组和',
    difficulty: '中等',
    category: '普通数组',
    description:
      '给你一个整数数组 nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。\n\n' +
      '子数组是数组中的一个连续部分。',
    examples: [
      {
        id: 'max-sub-array-ex-1',
        label: '示例 1',
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '连续子数组 [4,-1,2,1] 的和最大，为 6。',
      },
      {
        id: 'max-sub-array-ex-2',
        label: '示例 2',
        input: 'nums = [1]',
        output: '1',
      },
      {
        id: 'max-sub-array-ex-3',
        label: '示例 3',
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
      },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: [
      '以 i 结尾的最大子数组和，只可能从「以 i−1 结尾的最大和」接过来，或从 nums[i] 重新开始。',
      'cur = max(nums[i], cur + nums[i])，best = max(best, cur)。',
      '整个过程只扫一遍，时间 O(n)，额外空间 O(1)。',
    ],
    starterCode: {
      javascript:
        '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n  // TODO: 在这里写你的解法\n}',
      python:
        'class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        # TODO: 在这里写你的解法\n        pass',
      java:
        'class Solution {\n    public int maxSubArray(int[] nums) {\n        // TODO: 在这里写你的解法\n        return 0;\n    }\n}',
    },
    sampleTests: [
      {
        id: 'max-sub-array-case-1',
        label: '示例 1',
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        expected: '6',
      },
      {
        id: 'max-sub-array-case-2',
        label: '示例 2',
        input: 'nums = [1]',
        expected: '1',
      },
      {
        id: 'max-sub-array-case-3',
        label: '示例 3',
        input: 'nums = [5,4,-1,7,8]',
        expected: '23',
      },
    ],
    hiddenCaseCount: 15,
    animationId: 'max-sub-array',
    acceptanceRate: 54.1,
  },
  {
    id: 'trap',
    number: 42,
    title: '接雨水',
    difficulty: '困难',
    category: '双指针',
    description:
      '给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。\n\n' +
      '每个位置能接的水量，取决于它左右两侧最高柱子的较矮者与自身高度的差。',
    examples: [
      {
        id: 'trap-ex-1',
        label: '示例 1',
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: '蓝色部分为接到的雨水，共 6 个单位。',
      },
      {
        id: 'trap-ex-2',
        label: '示例 2',
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
      },
    ],
    constraints: ['1 <= height.length <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    hints: [
      '每个位置能接的水 = min(左侧最高, 右侧最高) − 当前高度。',
      '先预处理每个位置的前缀最大值和后缀最大值，再扫一遍累加。',
      '双指针可以做到 O(1) 额外空间：谁矮就结算谁，并向内移动。',
    ],
    starterCode: {
      javascript:
        '/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n  // TODO: 在这里写你的解法\n}',
      python:
        'class Solution:\n    def trap(self, height: list[int]) -> int:\n        # TODO: 在这里写你的解法\n        pass',
      java:
        'class Solution {\n    public int trap(int[] height) {\n        // TODO: 在这里写你的解法\n        return 0;\n    }\n}',
    },
    sampleTests: [
      {
        id: 'trap-case-1',
        label: '示例 1',
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        expected: '6',
      },
      {
        id: 'trap-case-2',
        label: '示例 2',
        input: 'height = [4,2,0,3,2,5]',
        expected: '9',
      },
    ],
    hiddenCaseCount: 18,
    animationId: 'trap',
    acceptanceRate: 62.8,
  },
]

export const MOCK_SUBMISSION_RECORDS: SubmissionRecord[] = [
  {
    id: 'sub-two-sum-1',
    problemId: 'two-sum',
    language: 'javascript',
    verdict: 'accepted',
    submittedAt: '2026-10-25T21:14:00+08:00',
    runtimeMs: 52,
    code:
      'function twoSum(nums, target) {\n' +
      '  const seen = new Map()\n' +
      '  for (let i = 0; i < nums.length; i++) {\n' +
      '    const need = target - nums[i]\n' +
      '    if (seen.has(need)) return [seen.get(need), i]\n' +
      '    seen.set(nums[i], i)\n' +
      '  }\n' +
      '  return []\n' +
      '}',
  },
  {
    id: 'sub-two-sum-2',
    problemId: 'two-sum',
    language: 'javascript',
    verdict: 'wrong_answer',
    submittedAt: '2026-10-24T19:02:00+08:00',
    runtimeMs: 48,
    code: 'function twoSum(nums, target) {\n  return [0, 1]\n}',
  },
  {
    id: 'sub-max-sub-array-1',
    problemId: 'max-sub-array',
    language: 'javascript',
    verdict: 'wrong_answer',
    submittedAt: '2026-10-23T09:41:00+08:00',
    runtimeMs: 46,
    code: 'function maxSubArray(nums) {\n  return 0\n}',
  },
]

const MOCK_VERDICT_BASE: Record<
  Verdict,
  {
    runtimeMs: number
    memoryMb: number
    runtimePercentile: number
    memoryPercentile: number
    errorMessage?: string
  }
> = {
  accepted: {
    runtimeMs: 52,
    memoryMb: 42.1,
    runtimePercentile: 88.4,
    memoryPercentile: 72.6,
  },
  wrong_answer: {
    runtimeMs: 48,
    memoryMb: 41.8,
    runtimePercentile: 0,
    memoryPercentile: 0,
  },
  time_limit: {
    runtimeMs: 10000,
    memoryMb: 45.2,
    runtimePercentile: 0,
    memoryPercentile: 0,
    errorMessage: '超出时间限制（10 秒），请检查是否存在多层循环。',
  },
  compile_error: {
    runtimeMs: 0,
    memoryMb: 0,
    runtimePercentile: 0,
    memoryPercentile: 0,
    errorMessage: "SyntaxError: Unexpected token '}'（第 7 行）",
  },
  runtime_error: {
    runtimeMs: 12,
    memoryMb: 41.2,
    runtimePercentile: 0,
    memoryPercentile: 0,
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'length')",
  },
}

/** 原型模拟判题：按结论生成一份自洽的结果 */
export function buildMockSubmission(
  problem: SolveProblem,
  verdict: Verdict,
  now: Date = new Date(),
): SubmissionResult {
  const base = MOCK_VERDICT_BASE[verdict]
  const firstExample = problem.examples[0]
  const failedCase =
    verdict === 'accepted'
      ? undefined
      : {
          label: verdict === 'time_limit' ? '隐藏用例 7' : '隐藏用例 4',
          input: firstExample?.input ?? '[]',
          expected: firstExample?.output ?? '',
          actual: verdict === 'wrong_answer' ? '[]' : '—',
        }

  return {
    verdict,
    passedCases:
      verdict === 'accepted' ? problem.hiddenCaseCount : Math.max(1, problem.hiddenCaseCount - 4),
    totalCases: problem.hiddenCaseCount,
    runtimeMs: base.runtimeMs,
    memoryMb: base.memoryMb,
    runtimePercentile: base.runtimePercentile,
    memoryPercentile: base.memoryPercentile,
    ...(failedCase ? { failedCase } : {}),
    ...(base.errorMessage ? { errorMessage: base.errorMessage } : {}),
    submittedAt: now.toISOString(),
  }
}

export function findSolveProblem(id: string): SolveProblem | null {
  return MOCK_PROBLEMS.find((p) => p.id === id) ?? null
}

export function nextSolveProblem(currentId: string): SolveProblem {
  const index = MOCK_PROBLEMS.findIndex((p) => p.id === currentId)
  const nextIndex = index < 0 ? 0 : (index + 1) % MOCK_PROBLEMS.length
  const next = MOCK_PROBLEMS[nextIndex]
  if (!next) throw new Error('解题题库为空')
  return next
}

/** 提交时间：刚刚 / N 分钟前 / N 小时前 / N 天前 / 日期 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso

  const diff = now.getTime() - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`

  const date = new Date(then)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayOfMonth = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${dayOfMonth}`
}
