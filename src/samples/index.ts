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
import mergeIntervalsInstrumented from './raw/mergeIntervals.js?raw'
import rotateArrayInstrumented from './raw/rotateArray.js?raw'
import productExceptSelfInstrumented from './raw/productExceptSelf.js?raw'
import firstMissingPositiveInstrumented from './raw/firstMissingPositive.js?raw'
import setZeroesInstrumented from './raw/setZeroes.js?raw'
import spiralOrderInstrumented from './raw/spiralOrder.js?raw'
import rotateImageInstrumented from './raw/rotateImage.js?raw'
import searchMatrix2Instrumented from './raw/searchMatrix2.js?raw'
import singleNumberInstrumented from './raw/singleNumber.js?raw'
import majorityElementInstrumented from './raw/majorityElement.js?raw'
import sortColorsInstrumented from './raw/sortColors.js?raw'
import nextPermutationInstrumented from './raw/nextPermutation.js?raw'
import findDuplicateInstrumented from './raw/findDuplicate.js?raw'
import hasCycleInstrumented from './raw/hasCycle.js?raw'
import detectCycleInstrumented from './raw/detectCycle.js?raw'
import isPalindromeInstrumented from './raw/isPalindrome.js?raw'
import getIntersectionNodeInstrumented from './raw/getIntersectionNode.js?raw'
import mergeTwoListsInstrumented from './raw/mergeTwoLists.js?raw'
import addTwoNumbersInstrumented from './raw/addTwoNumbers.js?raw'
import removeNthFromEndInstrumented from './raw/removeNthFromEnd.js?raw'
import swapPairsInstrumented from './raw/swapPairs.js?raw'
import reverseKGroupInstrumented from './raw/reverseKGroup.js?raw'
import copyRandomListInstrumented from './raw/copyRandomList.js?raw'
import sortListInstrumented from './raw/sortList.js?raw'
import mergeKListsInstrumented from './raw/mergeKLists.js?raw'
import lruCacheInstrumented from './raw/lruCache.js?raw'

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

const MERGE_INTERVALS_SOURCE = [
  'function merge(intervals) {',
  '  intervals.sort((a, b) => a[0] - b[0]);',
  '  const res = [];',
  '  for (const interval of intervals) {',
  '    if (res.length > 0 && res[res.length - 1][1] >= interval[0]) {',
  '      res[res.length - 1][1] = Math.max(res[res.length - 1][1], interval[1]);',
  '    } else {',
  '      res.push([...interval]);',
  '    }',
  '  }',
  '  return res;',
  '}',
].join('\n')

const ROTATE_ARRAY_SOURCE = [
  'function rotate(nums, k) {',
  '  const n = nums.length;',
  '  k = k % n;',
  '  const reverse = (l, r) => {',
  '    while (l < r) {',
  '      const tmp = nums[l];',
  '      nums[l] = nums[r];',
  '      nums[r] = tmp;',
  '      l++;',
  '      r--;',
  '    }',
  '  };',
  '  reverse(0, n - 1);',
  '  reverse(0, k - 1);',
  '  reverse(k, n - 1);',
  '  return nums;',
  '}',
].join('\n')

const PRODUCT_EXCEPT_SELF_SOURCE = [
  'function productExceptSelf(nums) {',
  '  const n = nums.length;',
  '  const res = new Array(n).fill(1);',
  '  let prefix = 1;',
  '  for (let i = 0; i < n; i++) {',
  '    res[i] = prefix;',
  '    prefix *= nums[i];',
  '  }',
  '  let suffix = 1;',
  '  for (let i = n - 1; i >= 0; i--) {',
  '    res[i] *= suffix;',
  '    suffix *= nums[i];',
  '  }',
  '  return res;',
  '}',
].join('\n')

const FIRST_MISSING_POSITIVE_SOURCE = [
  'function firstMissingPositive(nums) {',
  '  const n = nums.length;',
  '  for (let i = 0; i < n; i++) {',
  '    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {',
  '      const target = nums[i] - 1;',
  '      const tmp = nums[target];',
  '      nums[target] = nums[i];',
  '      nums[i] = tmp;',
  '    }',
  '  }',
  '  for (let i = 0; i < n; i++) {',
  '    if (nums[i] !== i + 1) {',
  '      return i + 1;',
  '    }',
  '  }',
  '  return n + 1;',
  '}',
].join('\n')

const SET_ZEROES_SOURCE = [
  'function setZeroes(matrix) {',
  '  const m = matrix.length;',
  '  const n = matrix[0].length;',
  '  let firstRowZero = false;',
  '  let firstColZero = false;',
  '  for (let j = 0; j < n; j++) {',
  '    if (matrix[0][j] === 0) firstRowZero = true;',
  '  }',
  '  for (let i = 0; i < m; i++) {',
  '    if (matrix[i][0] === 0) firstColZero = true;',
  '  }',
  '  for (let i = 1; i < m; i++) {',
  '    for (let j = 1; j < n; j++) {',
  '      if (matrix[i][j] === 0) {',
  '        matrix[i][0] = 0;',
  '        matrix[0][j] = 0;',
  '      }',
  '    }',
  '  }',
  '  for (let i = 1; i < m; i++) {',
  '    for (let j = 1; j < n; j++) {',
  '      if (matrix[i][0] === 0 || matrix[0][j] === 0) {',
  '        matrix[i][j] = 0;',
  '      }',
  '    }',
  '  }',
  '  if (firstRowZero) {',
  '    for (let j = 0; j < n; j++) {',
  '      matrix[0][j] = 0;',
  '    }',
  '  }',
  '  if (firstColZero) {',
  '    for (let i = 0; i < m; i++) {',
  '      matrix[i][0] = 0;',
  '    }',
  '  }',
  '  return matrix;',
  '}',
].join('\n')

const SPIRAL_ORDER_SOURCE = [
  'function spiralOrder(matrix) {',
  '  const res = [];',
  '  let top = 0;',
  '  let bottom = matrix.length - 1;',
  '  let left = 0;',
  '  let right = matrix[0].length - 1;',
  '  while (top <= bottom && left <= right) {',
  '    for (let j = left; j <= right; j++) {',
  '      res.push(matrix[top][j]);',
  '    }',
  '    top++;',
  '    for (let i = top; i <= bottom; i++) {',
  '      res.push(matrix[i][right]);',
  '    }',
  '    right--;',
  '    if (top <= bottom) {',
  '      for (let j = right; j >= left; j--) {',
  '        res.push(matrix[bottom][j]);',
  '      }',
  '    }',
  '    bottom--;',
  '    if (left <= right) {',
  '      for (let i = bottom; i >= top; i--) {',
  '        res.push(matrix[i][left]);',
  '      }',
  '    }',
  '    left++;',
  '  }',
  '  return res;',
  '}',
].join('\n')

const ROTATE_IMAGE_SOURCE = [
  'function rotate(matrix) {',
  '  const n = matrix.length;',
  '  for (let i = 0; i < n; i++) {',
  '    for (let j = i + 1; j < n; j++) {',
  '      const tmp = matrix[i][j];',
  '      matrix[i][j] = matrix[j][i];',
  '      matrix[j][i] = tmp;',
  '    }',
  '  }',
  '  for (let i = 0; i < n; i++) {',
  '    for (let j = 0; j < Math.floor(n / 2); j++) {',
  '      const tmp = matrix[i][j];',
  '      matrix[i][j] = matrix[i][n - 1 - j];',
  '      matrix[i][n - 1 - j] = tmp;',
  '    }',
  '  }',
  '  return matrix;',
  '}',
].join('\n')

const SEARCH_MATRIX_2_SOURCE = [
  'function searchMatrix(matrix, target) {',
  '  const m = matrix.length;',
  '  const n = matrix[0].length;',
  '  let row = 0;',
  '  let col = n - 1;',
  '  while (row < m && col >= 0) {',
  '    const cur = matrix[row][col];',
  '    if (cur === target) {',
  '      return true;',
  '    } else if (cur > target) {',
  '      col--;',
  '    } else {',
  '      row++;',
  '    }',
  '  }',
  '  return false;',
  '}',
].join('\n')

const SINGLE_NUMBER_SOURCE = [
  'function singleNumber(nums) {',
  '  let res = 0;',
  '  for (let i = 0; i < nums.length; i++) {',
  '    res ^= nums[i];',
  '  }',
  '  return res;',
  '}',
].join('\n')

const MAJORITY_ELEMENT_SOURCE = [
  'function majorityElement(nums) {',
  '  let cand = nums[0];',
  '  let count = 1;',
  '  for (let i = 1; i < nums.length; i++) {',
  '    if (count === 0) {',
  '      cand = nums[i];',
  '      count = 1;',
  '    } else if (nums[i] === cand) {',
  '      count++;',
  '    } else {',
  '      count--;',
  '    }',
  '  }',
  '  return cand;',
  '}',
].join('\n')

const SORT_COLORS_SOURCE = [
  'function sortColors(nums) {',
  '  let low = 0;',
  '  let mid = 0;',
  '  let high = nums.length - 1;',
  '  while (mid <= high) {',
  '    if (nums[mid] === 0) {',
  '      const tmp = nums[low];',
  '      nums[low] = nums[mid];',
  '      nums[mid] = tmp;',
  '      low++;',
  '      mid++;',
  '    } else if (nums[mid] === 1) {',
  '      mid++;',
  '    } else {',
  '      const tmp = nums[mid];',
  '      nums[mid] = nums[high];',
  '      nums[high] = tmp;',
  '      high--;',
  '    }',
  '  }',
  '  return nums;',
  '}',
].join('\n')

const NEXT_PERMUTATION_SOURCE = [
  'function nextPermutation(nums) {',
  '  let i = nums.length - 2;',
  '  while (i >= 0 && nums[i] >= nums[i + 1]) {',
  '    i--;',
  '  }',
  '  if (i >= 0) {',
  '    let j = nums.length - 1;',
  '    while (nums[j] <= nums[i]) {',
  '      j--;',
  '    }',
  '    const tmp = nums[i];',
  '    nums[i] = nums[j];',
  '    nums[j] = tmp;',
  '  }',
  '  let l = i + 1;',
  '  let r = nums.length - 1;',
  '  while (l < r) {',
  '    const tmp = nums[l];',
  '    nums[l] = nums[r];',
  '    nums[r] = tmp;',
  '    l++;',
  '    r--;',
  '  }',
  '  return nums;',
  '}',
].join('\n')

const FIND_DUPLICATE_SOURCE = [
  'function findDuplicate(nums) {',
  '  let slow = nums[0];',
  '  let fast = nums[0];',
  '  do {',
  '    slow = nums[slow];',
  '    fast = nums[nums[fast]];',
  '  } while (slow !== fast);',
  '  slow = nums[0];',
  '  while (slow !== fast) {',
  '    slow = nums[slow];',
  '    fast = nums[fast];',
  '  }',
  '  return slow;',
  '}',
].join('\n')

const HAS_CYCLE_SOURCE = [
  'function hasCycle(head) {',
  '  let slow = head;',
  '  let fast = head;',
  '  while (fast !== null && fast.next !== null) {',
  '    slow = slow.next;',
  '    fast = fast.next.next;',
  '    if (slow === fast) {',
  '      return true;',
  '    }',
  '  }',
  '  return false;',
  '}',
].join('\n')

const DETECT_CYCLE_SOURCE = [
  'function detectCycle(head) {',
  '  let slow = head;',
  '  let fast = head;',
  '  while (fast !== null && fast.next !== null) {',
  '    slow = slow.next;',
  '    fast = fast.next.next;',
  '    if (slow === fast) {',
  '      break;',
  '    }',
  '  }',
  '  if (fast === null || fast.next === null) {',
  '    return null;',
  '  }',
  '  slow = head;',
  '  while (slow !== fast) {',
  '    slow = slow.next;',
  '    fast = fast.next;',
  '  }',
  '  return slow;',
  '}',
].join('\n')

const IS_PALINDROME_SOURCE = [
  'function isPalindrome(head) {',
  '  const vals = [];',
  '  for (let p = head; p !== null; p = p.next) {',
  '    vals.push(p.val);',
  '  }',
  '  let l = 0;',
  '  let r = vals.length - 1;',
  '  while (l < r) {',
  '    if (vals[l] !== vals[r]) {',
  '      return false;',
  '    }',
  '    l++;',
  '    r--;',
  '  }',
  '  return true;',
  '}',
].join('\n')

const GET_INTERSECTION_NODE_SOURCE = [
  'function getIntersectionNode(headA, headB) {',
  '  let pA = headA;',
  '  let pB = headB;',
  '  while (pA !== pB) {',
  '    if (pA === null) {',
  '      pA = headB;',
  '    } else {',
  '      pA = pA.next;',
  '    }',
  '    if (pB === null) {',
  '      pB = headA;',
  '    } else {',
  '      pB = pB.next;',
  '    }',
  '  }',
  '  return pA;',
  '}',
].join('\n')

const MERGE_TWO_LISTS_SOURCE = [
  'function mergeTwoLists(list1, list2) {',
  '  const dummy = { val: 0, next: null };',
  '  let cur = dummy;',
  '  while (list1 !== null && list2 !== null) {',
  '    if (list1.val <= list2.val) {',
  '      cur.next = list1;',
  '      list1 = list1.next;',
  '    } else {',
  '      cur.next = list2;',
  '      list2 = list2.next;',
  '    }',
  '    cur = cur.next;',
  '  }',
  '  cur.next = list1 !== null ? list1 : list2;',
  '  return dummy.next;',
  '}',
].join('\n')

const ADD_TWO_NUMBERS_SOURCE = [
  'function addTwoNumbers(l1, l2) {',
  '  const dummy = { val: 0, next: null };',
  '  let cur = dummy;',
  '  let carry = 0;',
  '  while (l1 !== null || l2 !== null || carry !== 0) {',
  '    const a = l1 !== null ? l1.val : 0;',
  '    const b = l2 !== null ? l2.val : 0;',
  '    const sum = a + b + carry;',
  '    carry = Math.floor(sum / 10);',
  '    cur.next = { val: sum % 10, next: null };',
  '    cur = cur.next;',
  '    if (l1 !== null) l1 = l1.next;',
  '    if (l2 !== null) l2 = l2.next;',
  '  }',
  '  return dummy.next;',
  '}',
].join('\n')

const REMOVE_NTH_FROM_END_SOURCE = [
  'function removeNthFromEnd(head, n) {',
  '  const dummy = { val: 0, next: head };',
  '  let fast = dummy;',
  '  let slow = dummy;',
  '  for (let i = 0; i <= n; i++) {',
  '    fast = fast.next;',
  '  }',
  '  while (fast !== null) {',
  '    fast = fast.next;',
  '    slow = slow.next;',
  '  }',
  '  slow.next = slow.next.next;',
  '  return dummy.next;',
  '}',
].join('\n')

const SWAP_PAIRS_SOURCE = [
  'function swapPairs(head) {',
  '  const dummy = { val: 0, next: head };',
  '  let prev = dummy;',
  '  while (prev.next !== null && prev.next.next !== null) {',
  '    const first = prev.next;',
  '    const second = first.next;',
  '    first.next = second.next;',
  '    second.next = first;',
  '    prev.next = second;',
  '    prev = first;',
  '  }',
  '  return dummy.next;',
  '}',
].join('\n')

const REVERSE_K_GROUP_SOURCE = [
  'function reverseKGroup(head, k) {',
  '  const dummy = { val: 0, next: head };',
  '  let groupPrev = dummy;',
  '  while (true) {',
  '    let kth = groupPrev;',
  '    for (let i = 0; i < k && kth !== null; i++) {',
  '      kth = kth.next;',
  '    }',
  '    if (kth === null) {',
  '      break;',
  '    }',
  '    const groupNext = kth.next;',
  '    let prev = groupNext;',
  '    let cur = groupPrev.next;',
  '    for (let i = 0; i < k; i++) {',
  '      const next = cur.next;',
  '      cur.next = prev;',
  '      prev = cur;',
  '      cur = next;',
  '    }',
  '    const newGroupTail = groupPrev.next;',
  '    groupPrev.next = prev;',
  '    groupPrev = newGroupTail;',
  '  }',
  '  return dummy.next;',
  '}',
].join('\n')

const COPY_RANDOM_LIST_SOURCE = [
  'function copyRandomList(head) {',
  '  const map = new Map();',
  '  for (let p = head; p !== null; p = p.next) {',
  '    map.set(p, { val: p.val, next: null, random: null });',
  '  }',
  '  for (let p = head; p !== null; p = p.next) {',
  '    const copy = map.get(p);',
  '    copy.next = p.next ? map.get(p.next) : null;',
  '    copy.random = p.random ? map.get(p.random) : null;',
  '  }',
  '  return head ? map.get(head) : null;',
  '}',
].join('\n')

const SORT_LIST_SOURCE = [
  'function sortList(head) {',
  '  if (head === null) {',
  '    return null;',
  '  }',
  '  const vals = [];',
  '  for (let p = head; p !== null; p = p.next) {',
  '    vals.push(p.val);',
  '  }',
  '  vals.sort((a, b) => a - b);',
  '  let p = head;',
  '  for (let i = 0; i < vals.length; i++) {',
  '    p.val = vals[i];',
  '    p = p.next;',
  '  }',
  '  return head;',
  '}',
].join('\n')

const MERGE_K_LISTS_SOURCE = [
  'function mergeKLists(lists) {',
  '  const mergeTwo = (a, b) => {',
  '    const dummy = { val: 0, next: null };',
  '    let cur = dummy;',
  '    while (a !== null && b !== null) {',
  '      if (a.val <= b.val) {',
  '        cur.next = a;',
  '        a = a.next;',
  '      } else {',
  '        cur.next = b;',
  '        b = b.next;',
  '      }',
  '      cur = cur.next;',
  '    }',
  '    cur.next = a !== null ? a : b;',
  '    return dummy.next;',
  '  };',
  '  let result = lists[0] || null;',
  '  for (let i = 1; i < lists.length; i++) {',
  '    result = mergeTwo(result, lists[i]);',
  '  }',
  '  return result;',
  '}',
].join('\n')

const LRU_CACHE_SOURCE = [
  'class LRUCache {',
  '  constructor(capacity) {',
  '    this.capacity = capacity;',
  '    this.map = new Map();',
  '    this.order = [];',
  '  }',
  '  touch(key) {',
  '    const idx = this.order.indexOf(key);',
  '    if (idx >= 0) {',
  '      this.order.splice(idx, 1);',
  '    }',
  '    this.order.push(key);',
  '  }',
  '  get(key) {',
  '    if (!this.map.has(key)) {',
  '      return -1;',
  '    }',
  '    this.touch(key);',
  '    return this.map.get(key);',
  '  }',
  '  put(key, value) {',
  '    if (!this.map.has(key) && this.order.length >= this.capacity) {',
  '      const evict = this.order.shift();',
  '      this.map.delete(evict);',
  '    }',
  '    this.map.set(key, value);',
  '    const idx = this.order.indexOf(key);',
  '    if (idx >= 0) {',
  '      this.order.splice(idx, 1);',
  '    }',
  '    this.order.push(key);',
  '  }',
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
  {
    id: 'merge-intervals',
    title: '56. 合并区间',
    problem:
      '以数组 intervals 表示若干区间的集合，请合并所有重叠的区间。示例：[[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]。',
    sourceCode: MERGE_INTERVALS_SOURCE,
    result: {
      displayCode: MERGE_INTERVALS_SOURCE,
      instrumentedCode: mergeIntervalsInstrumented,
      fnName: 'merge',
      summary: '排序 + 双列表：能接上就延伸右端，接不上开新区间',
    },
  },
  {
    id: 'rotate-array',
    title: '189. 轮转数组',
    problem:
      '给定一个整数数组 nums，将数组中的元素向右轮转 k 个位置。示例：[1,2,3,4,5,6,7], k=3 → [5,6,7,1,2,3,4]。',
    sourceCode: ROTATE_ARRAY_SOURCE,
    result: {
      displayCode: ROTATE_ARRAY_SOURCE,
      instrumentedCode: rotateArrayInstrumented,
      fnName: 'rotate',
      summary: '三次反转法：整体反转 + 前 k 段反转 + 剩余段反转',
    },
  },
  {
    id: 'product-except-self',
    title: '238. 除自身以外数组的乘积',
    problem:
      '给你一个整数数组 nums，返回数组 answer，其中 answer[i] 等于 nums 中除 nums[i] 之外其余各元素的乘积。要求不使用除法且 O(n)。示例：[1,2,3,4] → [24,12,8,6]。',
    sourceCode: PRODUCT_EXCEPT_SELF_SOURCE,
    result: {
      displayCode: PRODUCT_EXCEPT_SELF_SOURCE,
      instrumentedCode: productExceptSelfInstrumented,
      fnName: 'productExceptSelf',
      summary: '前后缀积两趟扫描：先填左侧积，再从右乘上右侧积',
    },
  },
  {
    id: 'first-missing-positive',
    title: '41. 缺失的第一个正数',
    problem:
      '给你一个未排序的整数数组 nums，请你找出其中没有出现的最小的正整数。要求 O(n) 时间、O(1) 额外空间。示例：[3,4,-1,1] → 2。',
    sourceCode: FIRST_MISSING_POSITIVE_SOURCE,
    result: {
      displayCode: FIRST_MISSING_POSITIVE_SOURCE,
      instrumentedCode: firstMissingPositiveInstrumented,
      fnName: 'firstMissingPositive',
      summary: '原地哈希：把数字 x 交换到下标 x−1，再从左扫第一个错位',
    },
  },
  {
    id: 'set-zeroes',
    title: '73. 矩阵置零',
    problem:
      '给定一个 m × n 的矩阵，如果一个元素为 0，则将其所在行和列的所有元素都设为 0。请使用原地算法。示例：[[0,1,2],[3,4,5],[1,2,0]] → [[0,0,0],[0,4,0],[0,0,0]]。',
    sourceCode: SET_ZEROES_SOURCE,
    result: {
      displayCode: SET_ZEROES_SOURCE,
      instrumentedCode: setZeroesInstrumented,
      fnName: 'setZeroes',
      summary: '首行首列当标记位：标记行头列头，再批量置零',
    },
  },
  {
    id: 'spiral-order',
    title: '54. 螺旋矩阵',
    problem:
      '给你一个 m 行 n 列的矩阵 matrix，请按照顺时针螺旋顺序，返回矩阵中的所有元素。示例：[[1,2,3],[4,5,6],[7,8,9]] → [1,2,3,6,9,8,7,4,5]。',
    sourceCode: SPIRAL_ORDER_SOURCE,
    result: {
      displayCode: SPIRAL_ORDER_SOURCE,
      instrumentedCode: spiralOrderInstrumented,
      fnName: 'spiralOrder',
      summary: '四边界收缩：上→右→下→左轮流收割，已收集灰化',
    },
  },
  {
    id: 'rotate-image',
    title: '48. 旋转图像',
    problem:
      '给定一个 n × n 的二维矩阵 matrix 表示一个图像，请你将图像顺时针旋转 90 度。必须原地旋转。示例：[[1,2,3],[4,5,6],[7,8,9]] → [[7,4,1],[8,5,2],[9,6,3]]。',
    sourceCode: ROTATE_IMAGE_SOURCE,
    result: {
      displayCode: ROTATE_IMAGE_SOURCE,
      instrumentedCode: rotateImageInstrumented,
      fnName: 'rotate',
      summary: '转置 + 行反转：两步原地交换等价于顺时针旋转 90°',
    },
  },
  {
    id: 'search-matrix-2',
    title: '240. 搜索二维矩阵 II',
    problem:
      '编写一个高效的算法来搜索 m × n 矩阵 matrix 中的一个目标值 target。该矩阵每行从左到右递增、每列从上到下递增。',
    sourceCode: SEARCH_MATRIX_2_SOURCE,
    result: {
      displayCode: SEARCH_MATRIX_2_SOURCE,
      instrumentedCode: searchMatrix2Instrumented,
      fnName: 'searchMatrix',
      summary: '右上角出发：大了往左、小了往下，Z 字形逼近',
    },
  },
  {
    id: 'single-number',
    title: '136. 只出现一次的数字',
    problem:
      '给你一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。要求线性时间、常数空间。示例：[4,1,2,1,2] → 4。',
    sourceCode: SINGLE_NUMBER_SOURCE,
    result: {
      displayCode: SINGLE_NUMBER_SOURCE,
      instrumentedCode: singleNumberInstrumented,
      fnName: 'singleNumber',
      summary: '异或抵消：x ^ x = 0，成对的数全部消失只剩落单的',
    },
  },
  {
    id: 'majority-element',
    title: '169. 多数元素',
    problem:
      '给定一个大小为 n 的数组 nums，返回其中的多数元素（出现次数大于 n/2 的元素）。你可以假设数组是非空的，并且给定的数组总是存在多数元素。示例：[2,2,1,1,1,2,2] → 2。',
    sourceCode: MAJORITY_ELEMENT_SOURCE,
    result: {
      displayCode: MAJORITY_ELEMENT_SOURCE,
      instrumentedCode: majorityElementInstrumented,
      fnName: 'majorityElement',
      summary: 'Boyer-Moore 投票：同票加、异票减、归零换人',
    },
  },
  {
    id: 'sort-colors',
    title: '75. 颜色分类',
    problem:
      '给定一个包含红色(0)、白色(1)、蓝色(2)的数组，原地对它们进行排序，使得相同颜色的元素相邻并按照红色、白色、蓝色顺序排列。示例：[2,0,2,1,1,0] → [0,0,1,1,2,2]。',
    sourceCode: SORT_COLORS_SOURCE,
    result: {
      displayCode: SORT_COLORS_SOURCE,
      instrumentedCode: sortColorsInstrumented,
      fnName: 'sortColors',
      summary: '荷兰国旗三指针：low/mid/high 把数组分成四个区',
    },
  },
  {
    id: 'next-permutation',
    title: '31. 下一个排列',
    problem:
      '整数数组的下一个排列是其字典序中下一个更大的排列。如果不存在下一个更大的排列，则将数字重新排列成最小的排列。必须原地修改。示例：[1,2,3] → [1,3,2]。',
    sourceCode: NEXT_PERMUTATION_SOURCE,
    result: {
      displayCode: NEXT_PERMUTATION_SOURCE,
      instrumentedCode: nextPermutationInstrumented,
      fnName: 'nextPermutation',
      summary: '找升序转折点 → 交换最小更大数 → 后缀反转升序',
    },
  },
  {
    id: 'find-duplicate',
    title: '287. 寻找重复数',
    problem:
      '给定一个包含 n + 1 个整数的数组 nums，其数字都在 [1, n] 范围内，可知至少存在一个重复的整数。假设只有一个重复的整数，找出这个重复的数。要求不修改数组且只用常量级额外空间。示例：[1,3,4,2,2] → 2。',
    sourceCode: FIND_DUPLICATE_SOURCE,
    result: {
      displayCode: FIND_DUPLICATE_SOURCE,
      instrumentedCode: findDuplicateInstrumented,
      fnName: 'findDuplicate',
      summary: 'Floyd 判环：把值当下标看成链，两次相遇找环入口',
    },
  },
  {
    id: 'has-cycle',
    title: '141. 环形链表',
    problem:
      '给你一个链表的头节点 head，判断链表中是否有环。示例：[3,2,0,-4] 尾部回指第 1 个节点 → true。',
    sourceCode: HAS_CYCLE_SOURCE,
    result: {
      displayCode: HAS_CYCLE_SOURCE,
      instrumentedCode: hasCycleInstrumented,
      fnName: 'hasCycle',
      summary: '快慢指针：快指针两步慢指针一步，有环必相遇',
    },
  },
  {
    id: 'detect-cycle',
    title: '142. 环形链表 II',
    problem:
      '给定一个链表的头节点 head，返回链表开始入环的第一个节点；如果链表无环，则返回 null。不允许修改链表。',
    sourceCode: DETECT_CYCLE_SOURCE,
    result: {
      displayCode: DETECT_CYCLE_SOURCE,
      instrumentedCode: detectCycleInstrumented,
      fnName: 'detectCycle',
      summary: '两阶段快慢指针：先相遇，再从头与相遇点同速走到环入口',
    },
  },
  {
    id: 'is-palindrome',
    title: '234. 回文链表',
    problem:
      '给你一个单链表的头节点 head，请你判断该链表是否为回文链表。示例：[1,2,2,1] → true；[1,2] → false。',
    sourceCode: IS_PALINDROME_SOURCE,
    result: {
      displayCode: IS_PALINDROME_SOURCE,
      instrumentedCode: isPalindromeInstrumented,
      fnName: 'isPalindrome',
      summary: '取值到数组 + 双指针收拢对碰（直观解法）',
    },
  },
  {
    id: 'get-intersection-node',
    title: '160. 相交链表',
    problem:
      '给你两个单链表的头节点 headA 和 headB，找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 null。',
    sourceCode: GET_INTERSECTION_NODE_SOURCE,
    result: {
      displayCode: GET_INTERSECTION_NODE_SOURCE,
      instrumentedCode: getIntersectionNodeInstrumented,
      fnName: 'getIntersectionNode',
      summary: '双指针走对方的路：总路程相同，有交点必同时到达',
    },
  },
  {
    id: 'merge-two-lists',
    title: '21. 合并两个有序链表',
    problem:
      '将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。示例：[1,2,4] + [1,3,4] → 1→1→2→3→4→4。',
    sourceCode: MERGE_TWO_LISTS_SOURCE,
    result: {
      displayCode: MERGE_TWO_LISTS_SOURCE,
      instrumentedCode: mergeTwoListsInstrumented,
      fnName: 'mergeTwoLists',
      summary: '哑结点 + 双指针接力：谁小接谁，剩余整段直连',
    },
  },
  {
    id: 'add-two-numbers',
    title: '2. 两数相加',
    problem:
      '给你两个非空链表，表示两个非负整数（每位数字逆序存储）。请将它们相加并以相同形式返回一个表示和的链表。示例：(2→4→3) + (5→6→4) = 807 → 7→0→8。',
    sourceCode: ADD_TWO_NUMBERS_SOURCE,
    result: {
      displayCode: ADD_TWO_NUMBERS_SOURCE,
      instrumentedCode: addTwoNumbersInstrumented,
      fnName: 'addTwoNumbers',
      summary: '逐位相加 + 进位传递：sum % 10 留本位，Math.floor(sum/10) 进位',
    },
  },
  {
    id: 'remove-nth-from-end',
    title: '19. 删除链表的倒数第 N 个结点',
    problem:
      '给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。示例：[1,2,3,4,5] n=2 → [1,2,3,5]。',
    sourceCode: REMOVE_NTH_FROM_END_SOURCE,
    result: {
      displayCode: REMOVE_NTH_FROM_END_SOURCE,
      instrumentedCode: removeNthFromEndInstrumented,
      fnName: 'removeNthFromEnd',
      summary: '快指针先走 N+1 步，快慢同速时 slow 停在删除点前一个',
    },
  },
  {
    id: 'swap-pairs',
    title: '24. 两两交换链表中的节点',
    problem:
      '给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。必须在不修改节点内部值的情况下完成。示例：[1,2,3,4] → [2,1,4,3]。',
    sourceCode: SWAP_PAIRS_SOURCE,
    result: {
      displayCode: SWAP_PAIRS_SOURCE,
      instrumentedCode: swapPairsInstrumented,
      fnName: 'swapPairs',
      summary: '哑结点 + 三指针重接：first/second 翻转后接回主干',
    },
  },
  {
    id: 'reverse-k-group',
    title: '25. K 个一组翻转链表',
    problem:
      '给你链表的头节点 head，每 k 个节点一组进行翻转（不足 k 个保持原序），返回修改后的链表。示例：[1,2,3,4,5] k=2 → [2,1,4,3,5]。',
    sourceCode: REVERSE_K_GROUP_SOURCE,
    result: {
      displayCode: REVERSE_K_GROUP_SOURCE,
      instrumentedCode: reverseKGroupInstrumented,
      fnName: 'reverseKGroup',
      summary: '探路数满 k 个 → 组内反转 → 接回主干，逐组推进',
    },
  },
  {
    id: 'copy-random-list',
    title: '138. 随机链表的复制',
    problem:
      '给你一个长度为 n 的链表，每个节点包含 next 和 random 两个指针。请返回该链表的深拷贝。',
    sourceCode: COPY_RANDOM_LIST_SOURCE,
    result: {
      displayCode: COPY_RANDOM_LIST_SOURCE,
      instrumentedCode: copyRandomListInstrumented,
      fnName: 'copyRandomList',
      summary: '哈希映射原→新：第一遍建节点，第二遍统一连两指针',
    },
  },
  {
    id: 'sort-list',
    title: '148. 排序链表',
    problem:
      '给你链表的头结点 head，请将其按升序排列并返回排序后的链表。示例：[4,2,1,3] → [1,2,3,4]。',
    sourceCode: SORT_LIST_SOURCE,
    result: {
      displayCode: SORT_LIST_SOURCE,
      instrumentedCode: sortListInstrumented,
      fnName: 'sortList',
      summary: '取值排序回填（直观版）：数组排序后按序写回节点值',
    },
  },
  {
    id: 'merge-k-lists',
    title: '23. 合并 K 个升序链表',
    problem:
      '给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。示例：[[1,4,5],[1,3,4],[2,6]] → 1→1→2→3→4→4→5→6。',
    sourceCode: MERGE_K_LISTS_SOURCE,
    result: {
      displayCode: MERGE_K_LISTS_SOURCE,
      instrumentedCode: mergeKListsInstrumented,
      fnName: 'mergeKLists',
      summary: '逐个归并：复用两两合并，把每条链依次并进结果',
    },
  },
  {
    id: 'lru-cache',
    title: '146. LRU 缓存',
    problem:
      '请你设计并实现一个满足 LRU（最近最少使用）缓存约束的数据结构：get(key) 存在则返回值否则 -1；put(key, value) 写入，容量满时淘汰最久未使用的 key。（教学直观版：数组维护使用顺序）',
    sourceCode: LRU_CACHE_SOURCE,
    result: {
      displayCode: LRU_CACHE_SOURCE,
      instrumentedCode: lruCacheInstrumented,
      fnName: 'LRUCache',
      summary: '哈希表 + 使用顺序表：get/put 都把 key 挪到最近端，满则淘汰最旧',
    },
  },
]

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id)
}
