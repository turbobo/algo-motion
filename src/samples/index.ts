/**
 * 样题库：内置两道题的「插桩产物」，与 LLM 生成链路输出格式完全一致。
 * 作用：无 API Key 时也可完整体验「执行 → 帧序列 → 播放」链路。
 */
import type { InstrumentResult } from '../types'
import twoSumInstrumented from './raw/twoSum.js?raw'
import reverseListInstrumented from './raw/reverseList.js?raw'
import maxSubArrayInstrumented from './raw/maxSubArray.js?raw'

export interface Sample {
  id: string
  title: string
  problem: string
  /** 原始解法（用户视角的代码） */
  sourceCode: string
  result: InstrumentResult
}

const TWO_SUM_SOURCE = [
  'function twoSum(nums, target) {',
  '  const seen = new Map();',
  '  for (let i = 0; i < nums.length; i++) {',
  '    const need = target - nums[i];',
  '    if (seen.has(need)) {',
  '      return [seen.get(need), i];',
  '    }',
  '    seen.set(nums[i], i);',
  '  }',
  '  return [];',
  '}',
].join('\n')

const REVERSE_LIST_SOURCE = [
  'function reverseList(head) {',
  '  let prev = null;',
  '  let curr = head;',
  '  while (curr !== null) {',
  '    const next = curr.next;',
  '    curr.next = prev;',
  '    prev = curr;',
  '    curr = next;',
  '  }',
  '  return prev;',
  '}',
].join('\n')

const MAX_SUB_ARRAY_SOURCE = [
  'function maxSubArray(nums) {',
  '  let best = nums[0];',
  '  let cur = nums[0];',
  '  for (let i = 1; i < nums.length; i++) {',
  '    cur = Math.max(nums[i], cur + nums[i]);',
  '    best = Math.max(best, cur);',
  '  }',
  '  return best;',
  '}',
].join('\n')

export const SAMPLES: Sample[] = [
  {
    id: 'two-sum',
    title: '1. 两数之和',
    problem:
      '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案，且同一个元素在答案里不能重复出现。',
    sourceCode: TWO_SUM_SOURCE,
    result: {
      displayCode: TWO_SUM_SOURCE,
      instrumentedCode: twoSumInstrumented,
      fnName: 'twoSum',
      summary: '哈希表一次遍历：边扫边查 complement，O(n) 找出答案',
    },
  },
  {
    id: 'reverse-list',
    title: '206. 反转链表',
    problem: '给你单链表的头节点 head，请你反转链表，并返回反转后的链表。',
    sourceCode: REVERSE_LIST_SOURCE,
    result: {
      displayCode: REVERSE_LIST_SOURCE,
      instrumentedCode: reverseListInstrumented,
      fnName: 'reverseList',
      summary: '双指针迭代：逐个掰断 next 箭头，让它回头指向前驱',
    },
  },
  {
    id: 'max-sub-array',
    title: '53. 最大子数组和',
    problem:
      '给你一个整数数组 nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。示例：nums = [-2,1,-3,4,-1,2,1,-5,4]，输出 6。',
    sourceCode: MAX_SUB_ARRAY_SOURCE,
    result: {
      displayCode: MAX_SUB_ARRAY_SOURCE,
      instrumentedCode: maxSubArrayInstrumented,
      fnName: 'maxSubArray',
      summary: 'Kadane 动态规划：cur 是「以当前元素结尾」的最大和，best 记录全局最优',
    },
  },
]

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id)
}
