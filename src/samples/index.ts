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
import groupAnagramsInstrumented from './raw/groupAnagrams.js?raw'
import longestConsecutiveInstrumented from './raw/longestConsecutive.js?raw'
import moveZeroesInstrumented from './raw/moveZeroes.js?raw'
import maxAreaInstrumented from './raw/maxArea.js?raw'
import threeSumInstrumented from './raw/threeSum.js?raw'
import trapInstrumented from './raw/trap.js?raw'
import findAnagramsInstrumented from './raw/findAnagrams.js?raw'
import subarraySumInstrumented from './raw/subarraySum.js?raw'
import maxSlidingWindowInstrumented from './raw/maxSlidingWindow.js?raw'
import minWindowInstrumented from './raw/minWindow.js?raw'

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

const GROUP_ANAGRAMS_SOURCE = [
  'function groupAnagrams(strs) {',
  '  const groups = new Map();',
  '  for (let i = 0; i < strs.length; i++) {',
  '    const word = strs[i];',
  "    const key = word.split('').sort().join('');",
  '    if (!groups.has(key)) {',
  '      groups.set(key, []);',
  '    }',
  '    groups.get(key).push(word);',
  '  }',
  '  return [...groups.values()];',
  '}',
].join('\n')

const LONGEST_CONSECUTIVE_SOURCE = [
  'function longestConsecutive(nums) {',
  '  const set = new Set(nums);',
  '  let best = 0;',
  '  for (const num of nums) {',
  '    if (set.has(num - 1)) continue;',
  '    let cur = num;',
  '    let len = 1;',
  '    while (set.has(cur + 1)) {',
  '      cur++;',
  '      len++;',
  '    }',
  '    best = Math.max(best, len);',
  '  }',
  '  return best;',
  '}',
].join('\n')

const MOVE_ZEROES_SOURCE = [
  'function moveZeroes(nums) {',
  '  let slow = 0;',
  '  for (let fast = 0; fast < nums.length; fast++) {',
  '    if (nums[fast] !== 0) {',
  '      const tmp = nums[slow];',
  '      nums[slow] = nums[fast];',
  '      nums[fast] = tmp;',
  '      slow++;',
  '    }',
  '  }',
  '  return nums;',
  '}',
].join('\n')

const MAX_AREA_SOURCE = [
  'function maxArea(height) {',
  '  let left = 0;',
  '  let right = height.length - 1;',
  '  let best = 0;',
  '  while (left < right) {',
  '    const h = Math.min(height[left], height[right]);',
  '    const area = h * (right - left);',
  '    best = Math.max(best, area);',
  '    if (height[left] <= height[right]) {',
  '      left++;',
  '    } else {',
  '      right--;',
  '    }',
  '  }',
  '  return best;',
  '}',
].join('\n')

const THREE_SUM_SOURCE = [
  'function threeSum(nums) {',
  '  nums.sort((a, b) => a - b);',
  '  const res = [];',
  '  for (let i = 0; i < nums.length - 2; i++) {',
  '    if (i > 0 && nums[i] === nums[i - 1]) continue;',
  '    let left = i + 1;',
  '    let right = nums.length - 1;',
  '    while (left < right) {',
  '      const sum = nums[i] + nums[left] + nums[right];',
  '      if (sum === 0) {',
  '        res.push([nums[i], nums[left], nums[right]]);',
  '        while (left < right && nums[left] === nums[left + 1]) left++;',
  '        while (left < right && nums[right] === nums[right - 1]) right--;',
  '        left++;',
  '        right--;',
  '      } else if (sum < 0) {',
  '        left++;',
  '      } else {',
  '        right--;',
  '      }',
  '    }',
  '  }',
  '  return res;',
  '}',
].join('\n')

const TRAP_SOURCE = [
  'function trap(height) {',
  '  let left = 0;',
  '  let right = height.length - 1;',
  '  let leftMax = 0;',
  '  let rightMax = 0;',
  '  let water = 0;',
  '  while (left < right) {',
  '    if (height[left] < height[right]) {',
  '      leftMax = Math.max(leftMax, height[left]);',
  '      water += leftMax - height[left];',
  '      left++;',
  '    } else {',
  '      rightMax = Math.max(rightMax, height[right]);',
  '      water += rightMax - height[right];',
  '      right--;',
  '    }',
  '  }',
  '  return water;',
  '}',
].join('\n')

const FIND_ANAGRAMS_SOURCE = [
  'function findAnagrams(s, p) {',
  '  const need = new Map();',
  '  for (const ch of p) need.set(ch, (need.get(ch) || 0) + 1);',
  '  const res = [];',
  '  for (let left = 0; left + p.length <= s.length; left++) {',
  '    const win = new Map();',
  '    for (let i = left; i < left + p.length; i++) {',
  '      const ch = s[i];',
  '      win.set(ch, (win.get(ch) || 0) + 1);',
  '    }',
  '    let ok = win.size === need.size;',
  '    for (const [ch, cnt] of need) {',
  '      if ((win.get(ch) || 0) !== cnt) {',
  '        ok = false;',
  '        break;',
  '      }',
  '    }',
  '    if (ok) {',
  '      res.push(left);',
  '    }',
  '  }',
  '  return res;',
  '}',
].join('\n')

const SUBARRAY_SUM_SOURCE = [
  'function subarraySum(nums, k) {',
  '  const count = new Map();',
  '  count.set(0, 1);',
  '  let sum = 0;',
  '  let res = 0;',
  '  for (let i = 0; i < nums.length; i++) {',
  '    sum += nums[i];',
  '    if (count.has(sum - k)) {',
  '      res += count.get(sum - k);',
  '    }',
  '    count.set(sum, (count.get(sum) || 0) + 1);',
  '  }',
  '  return res;',
  '}',
].join('\n')

const MAX_SLIDING_WINDOW_SOURCE = [
  'function maxSlidingWindow(nums, k) {',
  '  const res = [];',
  '  const deque = [];',
  '  for (let i = 0; i < nums.length; i++) {',
  '    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {',
  '      deque.pop();',
  '    }',
  '    deque.push(i);',
  '    if (deque[0] <= i - k) {',
  '      deque.shift();',
  '    }',
  '    if (i >= k - 1) {',
  '      res.push(nums[deque[0]]);',
  '    }',
  '  }',
  '  return res;',
  '}',
].join('\n')

const MIN_WINDOW_SOURCE = [
  'function minWindow(s, t) {',
  '  const need = new Map();',
  '  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);',
  '  const win = new Map();',
  '  let valid = 0;',
  '  let left = 0;',
  '  let start = 0;',
  '  let len = Infinity;',
  '  for (let right = 0; right < s.length; right++) {',
  '    const ch = s[right];',
  '    if (need.has(ch)) {',
  '      win.set(ch, (win.get(ch) || 0) + 1);',
  '      if (win.get(ch) === need.get(ch)) {',
  '        valid++;',
  '      }',
  '    }',
  '    while (valid === need.size) {',
  '      if (right - left + 1 < len) {',
  '        start = left;',
  '        len = right - left + 1;',
  '      }',
  '      const out = s[left];',
  '      if (need.has(out)) {',
  '        if (win.get(out) === need.get(out)) {',
  '          valid--;',
  '        }',
  '        win.set(out, win.get(out) - 1);',
  '      }',
  '      left++;',
  '    }',
  '  }',
  "  return len === Infinity ? '' : s.slice(start, start + len);",
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
  {
    id: 'group-anagrams',
    title: '49. 字母异位词分组',
    problem:
      '给你一个字符串数组，请你将字母异位词组合在一起。字母异位词是由重新排列源单词的所有字母得到的一个新单词。示例：["eat","tea","tan","ate","nat","bat"] → [["bat"],["nat","tan"],["ate","eat","tea"]]。',
    sourceCode: GROUP_ANAGRAMS_SOURCE,
    result: {
      displayCode: GROUP_ANAGRAMS_SOURCE,
      instrumentedCode: groupAnagramsInstrumented,
      fnName: 'groupAnagrams',
      summary: '哈希分组：单词字母排序后当分组键，同键的归入一组',
    },
  },
  {
    id: 'longest-consecutive',
    title: '128. 最长连续序列',
    problem:
      '给定一个未排序的整数数组 nums，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。示例：[100,4,200,1,3,2] → 4（序列 1,2,3,4）。',
    sourceCode: LONGEST_CONSECUTIVE_SOURCE,
    result: {
      displayCode: LONGEST_CONSECUTIVE_SOURCE,
      instrumentedCode: longestConsecutiveInstrumented,
      fnName: 'longestConsecutive',
      summary: '哈希集合 O(1) 查前驱：只从「无前驱」的起点向后延伸计数',
    },
  },
  {
    id: 'move-zeroes',
    title: '283. 移动零',
    problem:
      '给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。示例：[0,1,0,3,12] → [1,3,12,0,0]。',
    sourceCode: MOVE_ZEROES_SOURCE,
    result: {
      displayCode: MOVE_ZEROES_SOURCE,
      instrumentedCode: moveZeroesInstrumented,
      fnName: 'moveZeroes',
      summary: '快慢双指针：fast 扫非零数与 slow 位置交换，非零区逐步前移',
    },
  },
  {
    id: 'max-area',
    title: '11. 盛最多水的容器',
    problem:
      '给定一个长度为 n 的整数数组 height。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。示例：[1,8,6,2,5,4,8,3,7] → 49。',
    sourceCode: MAX_AREA_SOURCE,
    result: {
      displayCode: MAX_AREA_SOURCE,
      instrumentedCode: maxAreaInstrumented,
      fnName: 'maxArea',
      summary: '左右双指针：每轮算容量，矮的一边向内移动搏更高的边',
    },
  },
  {
    id: 'three-sum',
    title: '15. 三数之和',
    problem:
      '给你一个整数数组 nums，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i ≠ j ≠ k 且三数之和为 0，返回所有不重复的三元组。示例：[-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]。',
    sourceCode: THREE_SUM_SOURCE,
    result: {
      displayCode: THREE_SUM_SOURCE,
      instrumentedCode: threeSumInstrumented,
      fnName: 'threeSum',
      summary: '排序 + 固定一数 + 左右双指针：和偏小移左、偏大移右、命中去重',
    },
  },
  {
    id: 'trap',
    title: '42. 接雨水',
    problem:
      '给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子下雨之后能接多少雨水。示例：[0,1,0,2,1,0,1,3,2,1,2,1] → 6。',
    sourceCode: TRAP_SOURCE,
    result: {
      displayCode: TRAP_SOURCE,
      instrumentedCode: trapInstrumented,
      fnName: 'trap',
      summary: '双指针双墙高：谁矮就结算谁，接水量 = 墙高 − 柱高',
    },
  },
  {
    id: 'find-anagrams',
    title: '438. 找到字符串中所有字母异位词',
    problem:
      '给定两个字符串 s 和 p，找到 s 中所有 p 的异位词的子串，返回这些子串的起始索引。示例：s = "cbaebabacd", p = "abc" → [0,6]。',
    sourceCode: FIND_ANAGRAMS_SOURCE,
    result: {
      displayCode: FIND_ANAGRAMS_SOURCE,
      instrumentedCode: findAnagramsInstrumented,
      fnName: 'findAnagrams',
      summary: '定长滑窗 + 双哈希计数逐窗对比',
    },
  },
  {
    id: 'subarray-sum',
    title: '560. 和为 K 的子数组',
    problem:
      '给你一个整数数组 nums 和一个整数 k，请你统计并返回该数组中和为 k 的子数组的个数。示例：nums = [1,2,3], k = 3 → 2。',
    sourceCode: SUBARRAY_SUM_SOURCE,
    result: {
      displayCode: SUBARRAY_SUM_SOURCE,
      instrumentedCode: subarraySumInstrumented,
      fnName: 'subarraySum',
      summary: '前缀和 + 哈希计数：查 sum − k 出现几次就新增几个答案',
    },
  },
  {
    id: 'max-sliding-window',
    title: '239. 滑动窗口最大值',
    problem:
      '给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧，返回滑动窗口中的最大值。示例：[1,3,-1,-3,5,3,6,7], k=3 → [3,3,5,5,6,7]。',
    sourceCode: MAX_SLIDING_WINDOW_SOURCE,
    result: {
      displayCode: MAX_SLIDING_WINDOW_SOURCE,
      instrumentedCode: maxSlidingWindowInstrumented,
      fnName: 'maxSlidingWindow',
      summary: '单调递减队列：入队前弹出队尾更小值，队首即窗口最大值',
    },
  },
  {
    id: 'min-window',
    title: '76. 最小覆盖子串',
    problem:
      '给你一个字符串 s 和一个字符串 t，返回 s 中涵盖 t 所有字符的最小子串；如果不存在则返回空串。示例：s = "ADOBECODEBANC", t = "ABC" → "BANC"。',
    sourceCode: MIN_WINDOW_SOURCE,
    result: {
      displayCode: MIN_WINDOW_SOURCE,
      instrumentedCode: minWindowInstrumented,
      fnName: 'minWindow',
      summary: '可变滑窗 + 达标计数：扩张到覆盖全部需求后收缩挤水分',
    },
  },
]

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id)
}
