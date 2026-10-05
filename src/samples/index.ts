/**
 * 样题库：内置两道题的「插桩产物」，与 LLM 生成链路输出格式完全一致。
 * 作用：无 API Key 时也可完整体验「执行 → 帧序列 → 播放」链路。
 */
import type { InstrumentResult } from '../types'
import twoSumInstrumented from './raw/twoSum.js?raw'
import reverseListInstrumented from './raw/reverseList.js?raw'
import maxSubArrayInstrumented from './raw/maxSubArray.js?raw'
import lcsInstrumented from './raw/lcs.js?raw'
import inorderInstrumented from './raw/inorderTraversal.js?raw'
import numIslandsInstrumented from './raw/numIslands.js?raw'
import longestSubstringInstrumented from './raw/longestSubstring.js?raw'

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

const LCS_SOURCE = [
  'function longestCommonSubsequence(text1, text2) {',
  '  const m = text1.length;',
  '  const n = text2.length;',
  '  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
  '  for (let i = 1; i <= m; i++) {',
  '    for (let j = 1; j <= n; j++) {',
  '      if (text1[i - 1] === text2[j - 1]) {',
  '        dp[i][j] = dp[i - 1][j - 1] + 1;',
  '      } else {',
  '        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);',
  '      }',
  '    }',
  '  }',
  '  return dp[m][n];',
  '}',
].join('\n')

const INORDER_SOURCE = [
  'function inorderTraversal(root) {',
  '  const res = [];',
  '  const stack = [];',
  '  let curr = root;',
  '  while (curr !== null || stack.length > 0) {',
  '    while (curr !== null) {',
  '      stack.push(curr);',
  '      curr = curr.left;',
  '    }',
  '    curr = stack.pop();',
  '    res.push(curr.val);',
  '    curr = curr.right;',
  '  }',
  '  return res;',
  '}',
].join('\n')

const NUM_ISLANDS_SOURCE = [
  'function numIslands(grid) {',
  '  const m = grid.length;',
  '  const n = grid[0].length;',
  '  let count = 0;',
  '  for (let i = 0; i < m; i++) {',
  '    for (let j = 0; j < n; j++) {',
  "      if (grid[i][j] === '1') {",
  '        count++;',
  "        grid[i][j] = '0';",
  '        const queue = [[i, j]];',
  '        while (queue.length > 0) {',
  '          const [r, c] = queue.shift();',
  '          const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];',
  '          for (const [dr, dc] of dirs) {',
  '            const nr = r + dr;',
  '            const nc = c + dc;',
  "            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === '1') {",
  "              grid[nr][nc] = '0';",
  '              queue.push([nr, nc]);',
  '            }',
  '          }',
  '        }',
  '      }',
  '    }',
  '  }',
  '  return count;',
  '}',
].join('\n')

const LONGEST_SUBSTRING_SOURCE = [
  'function lengthOfLongestSubstring(s) {',
  '  const last = new Map();',
  '  let left = 0;',
  '  let best = 0;',
  '  for (let right = 0; right < s.length; right++) {',
  '    const c = s[right];',
  '    if (last.has(c) && last.get(c) >= left) {',
  '      left = last.get(c) + 1;',
  '    }',
  '    last.set(c, right);',
  '    best = Math.max(best, right - left + 1);',
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
  {
    id: 'lcs',
    title: '1143. 最长公共子序列',
    problem:
      '给定两个字符串 text1 和 text2，返回它们的最长公共子序列的长度。若不存在公共子序列，返回 0。示例：text1 = "abcde"，text2 = "ace"，输出 3。',
    sourceCode: LCS_SOURCE,
    result: {
      displayCode: LCS_SOURCE,
      instrumentedCode: lcsInstrumented,
      fnName: 'longestCommonSubsequence',
      summary: '二维 DP 逐格填表：字符相同取左上 +1，不同取上/左最大值',
    },
  },
  {
    id: 'inorder-traversal',
    title: '94. 二叉树中序遍历（迭代）',
    problem:
      '给定一个二叉树的根节点 root，返回它的中序遍历结果。这里用「显式栈」的迭代写法模拟递归：一路向左压栈，弹栈访问后转向右子树。',
    sourceCode: INORDER_SOURCE,
    result: {
      displayCode: INORDER_SOURCE,
      instrumentedCode: inorderInstrumented,
      fnName: 'inorderTraversal',
      summary: '显式栈迭代中序：左走压栈 → 弹栈访问 → 转右子树',
    },
  },
  {
    id: 'num-islands',
    title: '200. 岛屿数量',
    problem:
      "给你一个由 '1'（陆地）和 '0'（水）组成的二维网格，请你计算网格中岛屿的数量。岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。",
    sourceCode: NUM_ISLANDS_SOURCE,
    result: {
      displayCode: NUM_ISLANDS_SOURCE,
      instrumentedCode: numIslandsInstrumented,
      fnName: 'numIslands',
      summary: 'BFS 洪水填充：发现陆地计数 +1，用队列把整座岛扩散探索完',
    },
  },
  {
    id: 'longest-substring',
    title: '3. 无重复字符的最长子串',
    problem:
      '给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。示例：s = "abcabcbb"，输出 3（因为无重复字符的最长子串是 "abc"）。',
    sourceCode: LONGEST_SUBSTRING_SOURCE,
    result: {
      displayCode: LONGEST_SUBSTRING_SOURCE,
      instrumentedCode: longestSubstringInstrumented,
      fnName: 'lengthOfLongestSubstring',
      summary: '滑动窗口 + 最近位置表：重复字符出现时左边界一步跳到位',
    },
  },
]

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id)
}
