/**
 * 批量生成的教学层数据（scripts/gen-lessons.ts 产出，勿手改）。
 * 手工精修的 lesson 在 samples/index.ts 内联，优先于本表。
 * 预测点基于真实帧序列，正确项为下一帧真实讲解；由 tests/lesson.test.ts 校验。
 */
import type { Lesson } from '../types'

export const LESSONS: Record<string, Lesson> = {
  "lcs": {
    "idea": "二维 DP 逐格填表：字符相同取左上 +1，不同取上/左最大值",
    "contrast": {
      "bad": "暴力枚举所有路径：指数级",
      "good": "二维填表：O(mn)"
    },
    "takeaways": [
      "策略：二维 DP 逐格填表：字符相同取左上 +1，不同取上/左最大值",
      "复杂度：O(m×n) · O(m×n)（标准最优解口径）。",
      "易错：初始化第 0 行 / 列与遍历顺序。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：求 \"abcde\" 与 \"ace\" 的最长公共子序列。dp 表先铺好第 0 行/列（… 下一步会怎样？",
        "options": [
          {
            "text": "text1[0] = 'a' 与 text2[0] = 'a' 相同 → 匹配！dp[1][…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "text1[0] = 'a' 与 text2[0] = 'a' 相同 → 匹配！dp[1][1] = 左上 dp[0][0] + 1 = 1"
      }
    ]
  },
  "inorder-traversal": {
    "idea": "显式栈迭代中序：左走压栈 → 弹栈访问 → 转右子树",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：显式栈迭代中序：左走压栈 → 弹栈访问 → 转右子树",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 4,
        "question": "当前：curr 走到空 → 弹栈：取出 n1（值 1），它的左边已经访问完了，轮到它自己 下一步会怎样？",
        "options": [
          {
            "text": "把值 1 记入结果：[1]",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "把值 1 记入结果：[1]"
      }
    ]
  },
  "num-islands": {
    "idea": "BFS 洪水填充：发现陆地计数 +1，用队列把整座岛扩散探索完",
    "contrast": {
      "bad": "反复全图扫描：O(V·E)",
      "good": "BFS/DFS/拓扑：O(V+E)"
    },
    "takeaways": [
      "策略：BFS 洪水填充：发现陆地计数 +1，用队列把整座岛扩散探索完",
      "复杂度：O(m×n) · O(m×n)（标准最优解口径）。",
      "易错：visited 标记时机，避免重复入队 / 环。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：数一数 4 × 4 的地图上有几座岛屿：扫描每个格子，遇到陆地就把整座岛用 BFS … 下一步会怎样？",
        "options": [
          {
            "text": "发现陆地 (0, 0) —— 这是一座新岛屿（第 1 座）！立刻开始 BFS 把它整座探索完",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "发现陆地 (0, 0) —— 这是一座新岛屿（第 1 座）！立刻开始 BFS 把它整座探索完"
      }
    ]
  },
  "longest-substring": {
    "idea": "滑动窗口 + 最近位置表：重复字符出现时左边界一步跳到位",
    "contrast": {
      "bad": "枚举每个子区间再统计：O(n²)",
      "good": "窗口伸缩一次遍历：O(n)"
    },
    "takeaways": [
      "策略：滑动窗口 + 最近位置表：重复字符出现时左边界一步跳到位",
      "复杂度：O(n) · O(min(n,Σ))（标准最优解口径）。",
      "易错：收缩窗口的条件与计数同步更新，避免越界。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：把 'a' 的最新位置记为 0（下次再遇到它，左边界就知道该跳到哪里） 下一步会怎样？",
        "options": [
          {
            "text": "当前窗口 [0, 0] 长度 1 —— 历史最长记录 best = 1",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "当前窗口 [0, 0] 长度 1 —— 历史最长记录 best = 1"
      }
    ]
  },
  "group-anagrams": {
    "idea": "哈希分组：单词字母排序后当分组键，同键的归入一组",
    "contrast": {
      "bad": "暴力两两配对 / 重复扫描：O(n²)",
      "good": "哈希表边扫边查：O(n)"
    },
    "takeaways": [
      "策略：哈希分组：单词字母排序后当分组键，同键的归入一组",
      "复杂度：O(n×k) · O(n×k)（标准最优解口径）。",
      "易错：先查后存，避免同一个元素和自己配对。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：\"eat\" 排序后得到键 \"aet\" → 开一个新分组 下一步会怎样？",
        "options": [
          {
            "text": "\"tea\" 排序后得到键 \"aet\" → 并入已有分组 [eat, tea]",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "\"tea\" 排序后得到键 \"aet\" → 并入已有分组 [eat, tea]"
      }
    ]
  },
  "longest-consecutive": {
    "idea": "哈希集合 O(1) 查前驱：只从「无前驱」的起点向后延伸计数",
    "contrast": {
      "bad": "暴力两两配对 / 重复扫描：O(n²)",
      "good": "哈希表边扫边查：O(n)"
    },
    "takeaways": [
      "策略：哈希集合 O(1) 查前驱：只从「无前驱」的起点向后延伸计数",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：先查后存，避免同一个元素和自己配对。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：100 没有前驱 → 它是某个连续段的起点！从这里开始往后延伸 下一步会怎样？",
        "options": [
          {
            "text": "从 100 一直延伸到 100，连续长度 1 → 最长记录 best = 1",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "从 100 一直延伸到 100，连续长度 1 → 最长记录 best = 1"
      }
    ]
  },
  "move-zeroes": {
    "idea": "快慢双指针：fast 扫非零数与 slow 位置交换，非零区逐步前移",
    "contrast": {
      "bad": "枚举所有区间 / 配对：O(n²)",
      "good": "双指针单调移动：O(n)"
    },
    "takeaways": [
      "策略：快慢双指针：fast 扫非零数与 slow 位置交换，非零区逐步前移",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：移动哪一侧指针要有单调性依据，否则漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：fast 遇到 0 —— 原地跳过，让它暂时待着，等后面的非零数来跟它交换 下一步会怎样？",
        "options": [
          {
            "text": "fast 发现非零数（交换前是 1）→ 和 slow 位置的数交换，非零区扩大一格：slow…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "fast 发现非零数（交换前是 1）→ 和 slow 位置的数交换，非零区扩大一格：slow = 1"
      }
    ]
  },
  "max-area": {
    "idea": "左右双指针：每轮算容量，矮的一边向内移动搏更高的边",
    "contrast": {
      "bad": "枚举所有区间 / 配对：O(n²)",
      "good": "双指针单调移动：O(n)"
    },
    "takeaways": [
      "策略：左右双指针：每轮算容量，矮的一边向内移动搏更高的边",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：移动哪一侧指针要有单调性依据，否则漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：当前容器：高 min(1, 7) = 1 × 宽 8 = 8 → best = 8；… 下一步会怎样？",
        "options": [
          {
            "text": "当前容器：高 min(8, 7) = 7 × 宽 7 = 49 → best = 49；右边…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "当前容器：高 min(8, 7) = 7 × 宽 7 = 49 → best = 49；右边更矮，把它往里移去搏更高的边"
      }
    ]
  },
  "three-sum": {
    "idea": "排序 + 固定一数 + 左右双指针：和偏小移左、偏大移右、命中去重",
    "contrast": {
      "bad": "枚举所有区间 / 配对：O(n²)",
      "good": "双指针单调移动：O(n)"
    },
    "takeaways": [
      "策略：排序 + 固定一数 + 左右双指针：和偏小移左、偏大移右、命中去重",
      "复杂度：O(n²) · O(1)（标准最优解口径）。",
      "易错：移动哪一侧指针要有单调性依据，否则漏解。"
    ],
    "predicts": [
      {
        "atFrame": 6,
        "question": "当前：固定 nums[1] = -1：接下来在 (2 ~ 5) 区间里，用左右指针找和为 … 下一步会怎样？",
        "options": [
          {
            "text": "-1 + -1 + 2 = 0：正好等于 0 —— 命中！",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "-1 + -1 + 2 = 0：正好等于 0 —— 命中！"
      }
    ]
  },
  "trap": {
    "idea": "双指针双墙高：谁矮就结算谁，接水量 = 墙高 − 柱高",
    "contrast": {
      "bad": "枚举所有区间 / 配对：O(n²)",
      "good": "双指针单调移动：O(n)"
    },
    "takeaways": [
      "策略：双指针双墙高：谁矮就结算谁，接水量 = 墙高 − 柱高",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：移动哪一侧指针要有单调性依据，否则漏解。"
    ],
    "predicts": [
      {
        "atFrame": 3,
        "question": "当前：左边 1 更矮，但它本身就是左墙新高（leftMax = 1）→ 头顶接不到水，wa… 下一步会怎样？",
        "options": [
          {
            "text": "左边 0 更矮：leftMax 是 1，这格头顶能接 1 - 0 = 1 格水，water …",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "左边 0 更矮：leftMax 是 1，这格头顶能接 1 - 0 = 1 格水，water 累计 1"
      }
    ]
  },
  "find-anagrams": {
    "idea": "定长滑窗 + 双哈希计数逐窗对比",
    "contrast": {
      "bad": "枚举每个子区间再统计：O(n²)",
      "good": "窗口伸缩一次遍历：O(n)"
    },
    "takeaways": [
      "策略：定长滑窗 + 双哈希计数逐窗对比",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：收缩窗口的条件与计数同步更新，避免越界。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：窗口 \"cba\" 的计数和 \"abc\" 完全一致 → 命中一个异位词！ 下一步会怎样？",
        "options": [
          {
            "text": "把起点 0 记入答案：目前找到 1 个",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "把起点 0 记入答案：目前找到 1 个"
      }
    ]
  },
  "subarray-sum": {
    "idea": "前缀和 + 哈希计数：查 sum − k 出现几次就新增几个答案",
    "contrast": {
      "bad": "枚举子串逐个验证：O(n²)~O(n³)",
      "good": "前缀和 / 单调队列 / 滑窗：O(n)"
    },
    "takeaways": [
      "策略：前缀和 + 哈希计数：查 sum − k 出现几次就新增几个答案",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：前缀和 / 队列的初始化与边界（空串、单元素）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：加上 1 后前缀和 sum = 1；查 sum − k = -2：没出现过 → 本轮… 下一步会怎样？",
        "options": [
          {
            "text": "加上 2 后前缀和 sum = 3；查 sum − k = 0：出现过 1 次 → 新增 1…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "加上 2 后前缀和 sum = 3；查 sum − k = 0：出现过 1 次 → 新增 1 个合法子数组，res = 1。然后把 3 也记进表"
      }
    ]
  },
  "max-sliding-window": {
    "idea": "单调递减队列：入队前弹出队尾更小值，队首即窗口最大值",
    "contrast": {
      "bad": "枚举子串逐个验证：O(n²)~O(n³)",
      "good": "前缀和 / 单调队列 / 滑窗：O(n)"
    },
    "takeaways": [
      "策略：单调递减队列：入队前弹出队尾更小值，队首即窗口最大值",
      "复杂度：O(n) · O(k)（标准最优解口径）。",
      "易错：前缀和 / 队列的初始化与边界（空串、单元素）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：暴力每窗求 max 是 O(n·k)。单调队列技巧：队列里只留\"还有资格当最大值\"的… 下一步会怎样？",
        "options": [
          {
            "text": "-1 入队并弹掉了队尾更小的数；窗口 [0, 2] 已满，队首下标 1（值 3）就是最大值 …",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "-1 入队并弹掉了队尾更小的数；窗口 [0, 2] 已满，队首下标 1（值 3）就是最大值 → 记入答案"
      }
    ]
  },
  "min-window": {
    "idea": "可变滑窗 + 达标计数：扩张到覆盖全部需求后收缩挤水分",
    "contrast": {
      "bad": "枚举子串逐个验证：O(n²)~O(n³)",
      "good": "前缀和 / 单调队列 / 滑窗：O(n)"
    },
    "takeaways": [
      "策略：可变滑窗 + 达标计数：扩张到覆盖全部需求后收缩挤水分",
      "复杂度：O(n) · O(k)（标准最优解口径）。",
      "易错：前缀和 / 队列的初始化与边界（空串、单元素）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：扩入 'A'：窗口内它有 1 个，刚好达到需求的 1 个 → 达标字符种类 1/3 下一步会怎样？",
        "options": [
          {
            "text": "扩入 'B'：窗口内它有 1 个，刚好达到需求的 1 个 → 达标字符种类 2/3",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "扩入 'B'：窗口内它有 1 个，刚好达到需求的 1 个 → 达标字符种类 2/3"
      }
    ]
  },
  "merge-intervals": {
    "idea": "排序 + 双列表：能接上就延伸右端，接不上开新区间",
    "contrast": {
      "bad": "额外数组或重复扫描：O(n) 空间 / O(n²)",
      "good": "原地操作 / 前后缀：O(1) 空间"
    },
    "takeaways": [
      "策略：排序 + 双列表：能接上就延伸右端，接不上开新区间",
      "复杂度：O(n log n) · O(log n)（标准最优解口径）。",
      "易错：原地修改时注意覆盖顺序，先标记后写回。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：[1,3] 的起点大于当前区间右端（或结果还是空的）→ 接不上，作为一个全新的区间放… 下一步会怎样？",
        "options": [
          {
            "text": "[2,6] 的起点 2 ≤ 当前区间右端 → 它们重叠！把右端延伸到 max(旧右端, 6)…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "[2,6] 的起点 2 ≤ 当前区间右端 → 它们重叠！把右端延伸到 max(旧右端, 6) = 6"
      }
    ]
  },
  "rotate-array": {
    "idea": "三次反转法：整体反转 + 前 k 段反转 + 剩余段反转",
    "contrast": {
      "bad": "额外数组或重复扫描：O(n) 空间 / O(n²)",
      "good": "原地操作 / 前后缀：O(1) 空间"
    },
    "takeaways": [
      "策略：三次反转法：整体反转 + 前 k 段反转 + 剩余段反转",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：原地修改时注意覆盖顺序，先标记后写回。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第一步：整体反转 [0, 6]——原本在后半段的 3 个元素被甩到了前面，但它们的内… 下一步会怎样？",
        "options": [
          {
            "text": "第二步：反转前 k 个 [0, 2]——把刚甩到前面的那 3 个元素的内部顺序恢复正确",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第二步：反转前 k 个 [0, 2]——把刚甩到前面的那 3 个元素的内部顺序恢复正确"
      }
    ]
  },
  "product-except-self": {
    "idea": "前后缀积两趟扫描：先填左侧积，再从右乘上右侧积",
    "contrast": {
      "bad": "额外数组或重复扫描：O(n) 空间 / O(n²)",
      "good": "原地操作 / 前后缀：O(1) 空间"
    },
    "takeaways": [
      "策略：前后缀积两趟扫描：先填左侧积，再从右乘上右侧积",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：原地修改时注意覆盖顺序，先标记后写回。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：要求 O(n) 且不能用除法。思路：答案 = 左边所有数的积 × 右边所有数的积。第… 下一步会怎样？",
        "options": [
          {
            "text": "第一趟：res[0] 先填上左侧积 1；然后 prefix 乘上 nums[0] = 1 →…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第一趟：res[0] 先填上左侧积 1；然后 prefix 乘上 nums[0] = 1 → 1，传给右边的位置"
      }
    ]
  },
  "first-missing-positive": {
    "idea": "原地哈希：把数字 x 交换到下标 x−1，再从左扫第一个错位",
    "contrast": {
      "bad": "额外数组或重复扫描：O(n) 空间 / O(n²)",
      "good": "原地操作 / 前后缀：O(1) 空间"
    },
    "takeaways": [
      "策略：原地哈希：把数字 x 交换到下标 x−1，再从左扫第一个错位",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：原地修改时注意覆盖顺序，先标记后写回。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：目标 O(n) + O(1) 空间：把每个 [1, n] 范围内的正整数 x 交换到… 下一步会怎样？",
        "options": [
          {
            "text": "3 属于 [1, 4] 区间 → 把它交换到下标 2（数字 3 的\"本命位\"）。如果换过来的…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "3 属于 [1, 4] 区间 → 把它交换到下标 2（数字 3 的\"本命位\"）。如果换过来的数也需要归位，while 会继续处理"
      }
    ]
  },
  "set-zeroes": {
    "idea": "首行首列当标记位：标记行头列头，再批量置零",
    "contrast": {
      "bad": "逐格重复模拟：O((mn)²)",
      "good": "边界收缩 / 标记位：O(mn)"
    },
    "takeaways": [
      "策略：首行首列当标记位：标记行头列头，再批量置零",
      "复杂度：O(m×n) · O(1)（标准最优解口径）。",
      "易错：行列下标与边界收缩的终止条件。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：发现 0 在 (2, 2) → 把它的行头 matrix[2][0] 和列头 mat… 下一步会怎样？",
        "options": [
          {
            "text": "(1, 2) 的行头或列头有标记 → 清零（当行头列头都是标记位时，第二遍扫描不会读到被污染…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "(1, 2) 的行头或列头有标记 → 清零（当行头列头都是标记位时，第二遍扫描不会读到被污染的 0）"
      }
    ]
  },
  "spiral-order": {
    "idea": "四边界收缩：上→右→下→左轮流收割，已收集灰化",
    "contrast": {
      "bad": "逐格重复模拟：O((mn)²)",
      "good": "边界收缩 / 标记位：O(mn)"
    },
    "takeaways": [
      "策略：四边界收缩：上→右→下→左轮流收割，已收集灰化",
      "复杂度：O(m×n) · O(1)（标准最优解口径）。",
      "易错：行列下标与边界收缩的终止条件。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：→ 向右：收集 matrix[0][0] = 1 下一步会怎样？",
        "options": [
          {
            "text": "→ 向右：收集 matrix[0][1] = 2",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "→ 向右：收集 matrix[0][1] = 2"
      }
    ]
  },
  "rotate-image": {
    "idea": "转置 + 行反转：两步原地交换等价于顺时针旋转 90°",
    "contrast": {
      "bad": "逐格重复模拟：O((mn)²)",
      "good": "边界收缩 / 标记位：O(mn)"
    },
    "takeaways": [
      "策略：转置 + 行反转：两步原地交换等价于顺时针旋转 90°",
      "复杂度：O(n²) · O(1)（标准最优解口径）。",
      "易错：行列下标与边界收缩的终止条件。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：转置：交换 (0, 1) ↔ (1, 0)，让 matrix[i][j] 和 mat… 下一步会怎样？",
        "options": [
          {
            "text": "转置：交换 (0, 2) ↔ (2, 0)，让 matrix[i][j] 和 matrix[…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "转置：交换 (0, 2) ↔ (2, 0)，让 matrix[i][j] 和 matrix[j][i] 互换位置"
      }
    ]
  },
  "search-matrix-2": {
    "idea": "右上角出发：大了往左、小了往下，Z 字形逼近",
    "contrast": {
      "bad": "逐格重复模拟：O((mn)²)",
      "good": "边界收缩 / 标记位：O(mn)"
    },
    "takeaways": [
      "策略：右上角出发：大了往左、小了往下，Z 字形逼近",
      "复杂度：O(m+n) · O(1)（标准最优解口径）。",
      "易错：行列下标与边界收缩的终止条件。"
    ],
    "predicts": [
      {
        "atFrame": 4,
        "question": "当前：站在 (0, 1)：4 比目标小 → 这一行右边的都更大，排除本行，row 下移 下一步会怎样？",
        "options": [
          {
            "text": "站在 (1, 1)：5 正好命中！",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "站在 (1, 1)：5 正好命中！"
      }
    ]
  },
  "single-number": {
    "idea": "异或抵消：x ^ x = 0，成对的数全部消失只剩落单的",
    "contrast": {
      "bad": "额外空间 / 排序：O(n) 空间或 O(n log n)",
      "good": "位运算 / 原地 / 投票：O(1) 空间"
    },
    "takeaways": [
      "策略：异或抵消：x ^ x = 0，成对的数全部消失只剩落单的",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：位运算 / 原地哈希的下标映射与符号处理。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：res ^= 4 → 4；到目前为止累计异或值是 4（成对的数会在后续步骤里互相抵消… 下一步会怎样？",
        "options": [
          {
            "text": "res ^= 1 → 5；到目前为止累计异或值是 5（成对的数会在后续步骤里互相抵消）",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "res ^= 1 → 5；到目前为止累计异或值是 5（成对的数会在后续步骤里互相抵消）"
      }
    ]
  },
  "majority-element": {
    "idea": "Boyer-Moore 投票：同票加、异票减、归零换人",
    "contrast": {
      "bad": "额外空间 / 排序：O(n) 空间或 O(n log n)",
      "good": "位运算 / 原地 / 投票：O(1) 空间"
    },
    "takeaways": [
      "策略：Boyer-Moore 投票：同票加、异票减、归零换人",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：位运算 / 原地哈希的下标映射与符号处理。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：Boyer-Moore 投票法：先让第一个数当候选人（1 票）。遇到相同的数就加票，… 下一步会怎样？",
        "options": [
          {
            "text": "看到 2：和候选人相同 → 加票到 2",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "看到 2：和候选人相同 → 加票到 2"
      }
    ]
  },
  "sort-colors": {
    "idea": "荷兰国旗三指针：low/mid/high 把数组分成四个区",
    "contrast": {
      "bad": "额外空间 / 排序：O(n) 空间或 O(n log n)",
      "good": "位运算 / 原地 / 投票：O(1) 空间"
    },
    "takeaways": [
      "策略：荷兰国旗三指针：low/mid/high 把数组分成四个区",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：位运算 / 原地哈希的下标映射与符号处理。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：荷兰国旗问题：三个指针把数组分成四个区——[0, low) 全是 0、[low, m… 下一步会怎样？",
        "options": [
          {
            "text": "mid 遇到 2 → 和 high 位置交换，把它甩到蓝色区；high 收缩——换过来的数还…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "mid 遇到 2 → 和 high 位置交换，把它甩到蓝色区；high 收缩——换过来的数还没看过，mid 原地不动继续审察"
      }
    ]
  },
  "next-permutation": {
    "idea": "找升序转折点 → 交换最小更大数 → 后缀反转升序",
    "contrast": {
      "bad": "额外空间 / 排序：O(n) 空间或 O(n log n)",
      "good": "位运算 / 原地 / 投票：O(1) 空间"
    },
    "takeaways": [
      "策略：找升序转折点 → 交换最小更大数 → 后缀反转升序",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：位运算 / 原地哈希的下标映射与符号处理。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：从右往左找到第一个「升序对」：nums[1] = 2 < nums[2] = 3。它… 下一步会怎样？",
        "options": [
          {
            "text": "在右侧降序段里找到「比 nums[1] = 2 大的最小数」（从右往左第一个更大的），交换两…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "在右侧降序段里找到「比 nums[1] = 2 大的最小数」（从右往左第一个更大的），交换两者——2 和 3 互换，这一步只让排列变大最少"
      }
    ]
  },
  "find-duplicate": {
    "idea": "Floyd 判环：把值当下标看成链，两次相遇找环入口",
    "contrast": {
      "bad": "额外空间 / 排序：O(n) 空间或 O(n log n)",
      "good": "位运算 / 原地 / 投票：O(1) 空间"
    },
    "takeaways": [
      "策略：Floyd 判环：把值当下标看成链，两次相遇找环入口",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：位运算 / 原地哈希的下标映射与符号处理。"
    ],
    "predicts": [
      {
        "atFrame": 3,
        "question": "当前：重置后的慢指针从起点出发、快指针留在相遇点，两者同速前进：slow → 2，fast… 下一步会怎样？",
        "options": [
          {
            "text": "两指针在值 2 处再次相遇——这一次相遇点就是环的入口，也就是要找的重复数",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "两指针在值 2 处再次相遇——这一次相遇点就是环的入口，也就是要找的重复数"
      }
    ]
  },
  "has-cycle": {
    "idea": "快慢指针：快指针两步慢指针一步，有环必相遇",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：快慢指针：快指针两步慢指针一步，有环必相遇",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 2,
        "question": "当前：slow 走到 n3，fast 走到 n2，还没追上，继续 下一步会怎样？",
        "options": [
          {
            "text": "slow 走到 n4，fast 走到 n4 —— 相遇了！",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "slow 走到 n4，fast 走到 n4 —— 相遇了！"
      }
    ]
  },
  "detect-cycle": {
    "idea": "两阶段快慢指针：先相遇，再从头与相遇点同速走到环入口",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：两阶段快慢指针：先相遇，再从头与相遇点同速走到环入口",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 2,
        "question": "当前：同速前进：slow 走到 n2，fast 走到 n2 —— 二次相遇！ 下一步会怎样？",
        "options": [
          {
            "text": "二次相遇点在 n2（值 2）——这就是环的入口，返回它",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "二次相遇点在 n2（值 2）——这就是环的入口，返回它"
      }
    ]
  },
  "is-palindrome": {
    "idea": "取值到数组 + 双指针收拢对碰（直观解法）",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：取值到数组 + 双指针收拢对碰（直观解法）",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：回文 = 正着读和反着读一样。把链表的值依次取出来（链表只能单向走，取值后就能两头向… 下一步会怎样？",
        "options": [
          {
            "text": "vals[0] = vals[3] 相等 ✓，左右指针向中间收拢（1 ↔ 2）",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "vals[0] = vals[3] 相等 ✓，左右指针向中间收拢（1 ↔ 2）"
      }
    ]
  },
  "get-intersection-node": {
    "idea": "双指针走对方的路：总路程相同，有交点必同时到达",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：双指针走对方的路：总路程相同，有交点必同时到达",
      "复杂度：O(m+n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：pA 在链 A 的值 4 处，pB 在链 B 的值 5 处，还不相等 → 各自前进一… 下一步会怎样？",
        "options": [
          {
            "text": "pA 在链 A 的值 1 处，pB 在链 B 的值 0 处，还不相等 → 各自前进一步",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "pA 在链 A 的值 1 处，pB 在链 B 的值 0 处，还不相等 → 各自前进一步"
      }
    ]
  },
  "merge-two-lists": {
    "idea": "哑结点 + 双指针接力：谁小接谁，剩余整段直连",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：哑结点 + 双指针接力：谁小接谁，剩余整段直连",
      "复杂度：O(m+n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：刚才接走的是更小的那个节点，cur 前进到队尾；现在比较 2 和 1 下一步会怎样？",
        "options": [
          {
            "text": "刚才接走的是更小的那个节点，cur 前进到队尾；现在比较 2 和 3",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "刚才接走的是更小的那个节点，cur 前进到队尾；现在比较 2 和 3"
      }
    ]
  },
  "add-two-numbers": {
    "idea": "逐位相加 + 进位传递：sum % 10 留本位，Math.floor(sum/10) 进位",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：逐位相加 + 进位传递：sum % 10 留本位，Math.floor(sum/10) 进位",
      "复杂度：O(max(m,n)) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：2 + 5 + 进位0 = 7 → 本位记 7，进位 0 下一步会怎样？",
        "options": [
          {
            "text": "4 + 6 + 进位0 = 10 → 本位记 0，进位 1",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "4 + 6 + 进位0 = 10 → 本位记 0，进位 1"
      }
    ]
  },
  "remove-nth-from-end": {
    "idea": "快指针先走 N+1 步，快慢同速时 slow 停在删除点前一个",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：快指针先走 N+1 步，快慢同速时 slow 停在删除点前一个",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：fast 已先走 3 步，停在值 3；现在 slow 从哑结点出发，两指针同速前进 下一步会怎样？",
        "options": [
          {
            "text": "fast 走到 4，slow 走到 1 —— 保持 3 个身位同步前进",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "fast 走到 4，slow 走到 1 —— 保持 3 个身位同步前进"
      }
    ]
  },
  "swap-pairs": {
    "idea": "哑结点 + 三指针重接：first/second 翻转后接回主干",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：哑结点 + 三指针重接：first/second 翻转后接回主干",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：本轮要交换的一对：first = 1，second = 2 下一步会怎样？",
        "options": [
          {
            "text": "交换完成：2 → 1，prev 前进到 1（这对的尾巴），准备处理下一对",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "交换完成：2 → 1，prev 前进到 1（这对的尾巴），准备处理下一对"
      }
    ]
  },
  "reverse-k-group": {
    "idea": "探路数满 k 个 → 组内反转 → 接回主干，逐组推进",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：探路数满 k 个 → 组内反转 → 接回主干，逐组推进",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：探路成功：从 哑结点 往后数满 2 个，kth 停在值 2——这一组可以翻转 下一步会怎样？",
        "options": [
          {
            "text": "本组翻转完成并接回主干（组尾的新 next 指向组外的 3）；groupPrev 移到本组尾…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "本组翻转完成并接回主干（组尾的新 next 指向组外的 3）；groupPrev 移到本组尾巴，准备下一组"
      }
    ]
  },
  "copy-random-list": {
    "idea": "哈希映射原→新：第一遍建节点，第二遍统一连两指针",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：哈希映射原→新：第一遍建节点，第二遍统一连两指针",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第一遍完成：3 个新节点已就位（值一样但全是孤立节点），映射表建好——这是深拷贝安全… 下一步会怎样？",
        "options": [
          {
            "text": "连好 o1 的两根指针：next → o2 的复制本；random → null 的复制本",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "连好 o1 的两根指针：next → o2 的复制本；random → null 的复制本"
      }
    ]
  },
  "sort-list": {
    "idea": "取值排序回填（直观版）：数组排序后按序写回节点值",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：取值排序回填（直观版）：数组排序后按序写回节点值",
      "复杂度：O(n log n) · O(log n)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：取出 4 个值并排好序：[1, 2, 3, 4]——接下来按顺序填回去 下一步会怎样？",
        "options": [
          {
            "text": "把 1 填进第 0 个节点（链表顺序不变，值按升序归位）",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "把 1 填进第 0 个节点（链表顺序不变，值按升序归位）"
      }
    ]
  },
  "merge-k-lists": {
    "idea": "逐个归并：复用两两合并，把每条链依次并进结果",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：逐个归并：复用两两合并，把每条链依次并进结果",
      "复杂度：O(N log k) · O(k)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第 1 轮：把 lists[1] 归并进结果链——归并过程是标准的双指针接力（谁小接… 下一步会怎样？",
        "options": [
          {
            "text": "第 2 轮：把 lists[2] 归并进结果链——归并过程是标准的双指针接力（谁小接谁），归…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 2 轮：把 lists[2] 归并进结果链——归并过程是标准的双指针接力（谁小接谁），归并后结果链更长、依然有序"
      }
    ]
  },
  "lru-cache": {
    "idea": "哈希表 + 使用顺序表：get/put 都把 key 挪到最近端，满则淘汰最旧",
    "contrast": {
      "bad": "数组化再重建：O(n) 空间",
      "good": "指针原地改接：O(1) 空间"
    },
    "takeaways": [
      "策略：哈希表 + 使用顺序表：get/put 都把 key 挪到最近端，满则淘汰最旧",
      "复杂度：O(1)/操作 · O(capacity)（标准最优解口径）。",
      "易错：改接前先保存 next，否则丢链；注意空链表。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：LRU = 最近最少使用。两个结构配合：map 存 key → value 实现 O… 下一步会怎样？",
        "options": [
          {
            "text": "put(1, 1) 完成：值写入 map，key 挪到使用顺序最右端成为\"最近使用\"",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "put(1, 1) 完成：值写入 map，key 挪到使用顺序最右端成为\"最近使用\""
      }
    ]
  },
  "max-depth": {
    "idea": "后序递归：子树深度先算出，父节点 = max(左, 右) + 1",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：后序递归：子树深度先算出，父节点 = max(左, 右) + 1",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：节点 n2（值 9）收到子树结果：左 0、右 0 → max(0, 0) + 1 =… 下一步会怎样？",
        "options": [
          {
            "text": "节点 n4（值 15）收到子树结果：左 0、右 0 → max(0, 0) + 1 = 1",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "节点 n4（值 15）收到子树结果：左 0、右 0 → max(0, 0) + 1 = 1"
      }
    ]
  },
  "invert-tree": {
    "idea": "递归交换每个节点的左右孩子，树形态实时镜像翻转",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：递归交换每个节点的左右孩子，树形态实时镜像翻转",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：交换节点 n1（值 4）的左右子树——看图中这两个分支换边了 下一步会怎样？",
        "options": [
          {
            "text": "交换节点 n5（值 7）的左右子树——看图中这两个分支换边了",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "交换节点 n5（值 7）的左右子树——看图中这两个分支换边了"
      }
    ]
  },
  "is-symmetric": {
    "idea": "镜像递归：a 的左对 b 的右、a 的右对 b 的左交叉比较",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：镜像递归：a 的左对 b 的右、a 的右对 b 的左交叉比较",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：对称 = 根的左右子树互为镜像。定义 check(a, b)：a 和 b 的值相等，… 下一步会怎样？",
        "options": [
          {
            "text": "镜像位置 2 = 2 ✓。继续往下一层：a 的左孩子要对上 b 的右孩子，a 的右孩子要对上…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "镜像位置 2 = 2 ✓。继续往下一层：a 的左孩子要对上 b 的右孩子，a 的右孩子要对上 b 的左孩子（交叉比较）"
      }
    ]
  },
  "level-order": {
    "idea": "BFS 队列：每轮先记层大小，处理这么多节点即收完一层",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：BFS 队列：每轮先记层大小，处理这么多节点即收完一层",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：层序遍历 = BFS：用队列把根先排上，每一轮先记下\"当前队列长度\"（= 这一层的节… 下一步会怎样？",
        "options": [
          {
            "text": "第 0 层收割完成：[3]——这一层的孩子已经全部排进队列，等着下一轮",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 0 层收割完成：[3]——这一层的孩子已经全部排进队列，等着下一轮"
      }
    ]
  },
  "sorted-array-to-bst": {
    "idea": "分治取中点当根：左右区间递归，天然高度平衡",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：分治取中点当根：左右区间递归，天然高度平衡",
      "复杂度：O(n) · O(log n)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：区间 [0, 1] 取中点 mid = 0（值 -10）作为这棵子树的根——中点保证… 下一步会怎样？",
        "options": [
          {
            "text": "区间 [1, 1] 取中点 mid = 1（值 -3）作为这棵子树的根——中点保证左右子树高…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "区间 [1, 1] 取中点 mid = 1（值 -3）作为这棵子树的根——中点保证左右子树高度差不超过 1，天然平衡"
      }
    ]
  },
  "is-valid-bst": {
    "idea": "中序遍历 + 前驱检查：序列必须严格递增",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：中序遍历 + 前驱检查：序列必须严格递增",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：中序访问 1：比上一个访问的 （还没有）。原理：BST 的中序遍历必然严格递增——边… 下一步会怎样？",
        "options": [
          {
            "text": "中序访问 2：比上一个访问的 1 大 ✓。原理：BST 的中序遍历必然严格递增——边遍历边检…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "中序访问 2：比上一个访问的 1 大 ✓。原理：BST 的中序遍历必然严格递增——边遍历边检查邻居即可"
      }
    ]
  },
  "kth-smallest": {
    "idea": "栈式迭代中序 + k 倒计时：减到 0 即答案",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：栈式迭代中序 + k 倒计时：减到 0 即答案",
      "复杂度：O(h+k) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：访问 1（BST 升序第 1 个），倒计时剩 2——还不够小，继续中序 下一步会怎样？",
        "options": [
          {
            "text": "访问 2（BST 升序第 2 个），倒计时剩 1——还不够小，继续中序",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "访问 2（BST 升序第 2 个），倒计时剩 1——还不够小，继续中序"
      }
    ]
  },
  "right-side-view": {
    "idea": "层序遍历：每层最后一个节点就是右视图",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：层序遍历：每层最后一个节点就是右视图",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：站在树的右侧看，每一层只能看见最右边的那个节点。层序遍历时记住每层的节点数，当处理到… 下一步会怎样？",
        "options": [
          {
            "text": "本层处理到最后一个节点 1 —— 从右侧看它就是这一层唯一可见的，收入右视图",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "本层处理到最后一个节点 1 —— 从右侧看它就是这一层唯一可见的，收入右视图"
      }
    ]
  },
  "build-tree-pre-in": {
    "idea": "前序头定根 + 中序切左右：分治区间递归建树",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：前序头定根 + 中序切左右：分治区间递归建树",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：前序段的第一个 3 就是根；在中序里找到它的位置 1：左边 1 个是左子树（中序 [… 下一步会怎样？",
        "options": [
          {
            "text": "前序段的第一个 9 就是根；在中序里找到它的位置 0：左边 0 个是左子树（中序 [0..-…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "前序段的第一个 9 就是根；在中序里找到它的位置 0：左边 0 个是左子树（中序 [0..-1]），右边是右子树——两段长度又在 preorder 里切出对应的子段"
      }
    ]
  },
  "flatten-tree": {
    "idea": "先序收集 + 逐节点重接：left 清空、right 串链",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：先序收集 + 逐节点重接：left 清空、right 串链",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：先序收集完成，共 6 个节点：[1, 2, 3, 4, 5, 6]——这个顺序就是最… 下一步会怎样？",
        "options": [
          {
            "text": "重接第 1 个节点（值 1）：left 清空，right 指向 2——它原来的子链表已经由先…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "重接第 1 个节点（值 1）：left 清空，right 指向 2——它原来的子链表已经由先序序列的其他节点接力"
      }
    ]
  },
  "lowest-common-ancestor": {
    "idea": "后序递归：左右各找到一个就往上传自己，否则传递找到的那个",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：后序递归：左右各找到一个就往上传自己，否则传递找到的那个",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：定义 dfs(node)：如果 subtree 里找到了 p 或 q 就把它往上传；… 下一步会怎样？",
        "options": [
          {
            "text": "全网搜索完成——最终返回的节点就是最近公共祖先",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "全网搜索完成——最终返回的节点就是最近公共祖先"
      }
    ]
  },
  "diameter-of-binary-tree": {
    "idea": "后序算高度，顺路更新 max(左深 + 右深)",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：后序算高度，顺路更新 max(左深 + 右深)",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：节点 n3（值 4）：左深 0、右深 0。直径如果从这里拐弯就是 0 + 0 = 0… 下一步会怎样？",
        "options": [
          {
            "text": "节点 n4（值 5）：左深 0、右深 0。直径如果从这里拐弯就是 0 + 0 = 0 → 全…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "节点 n4（值 5）：左深 0、右深 0。直径如果从这里拐弯就是 0 + 0 = 0 → 全局最大更新为 0；向上层返回高度 max(0, 0) + 1 = 1"
      }
    ]
  },
  "path-sum-3": {
    "idea": "前缀和 DFS：查 sum − target 在祖先路径出现的次数",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：前缀和 DFS：查 sum − target 在祖先路径出现的次数",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：走到 5：根到它的路径和 sum = 15；查 sum − target = 7 在… 下一步会怎样？",
        "options": [
          {
            "text": "走到 3：根到它的路径和 sum = 18；查 sum − target = 10 在祖先路…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "走到 3：根到它的路径和 sum = 18；查 sum − target = 10 在祖先路径上出现过 1 次 → 新增 1 条合法路径，count = 1。把 18 记进 prefix 继续往下"
      }
    ]
  },
  "max-path-sum": {
    "idea": "后序 DP：单边最大贡献上传，拐弯和更新全局 best",
    "contrast": {
      "bad": "重复遍历子树：O(n²)",
      "good": "一次递归 / 遍历：O(n)"
    },
    "takeaways": [
      "策略：后序 DP：单边最大贡献上传，拐弯和更新全局 best",
      "复杂度：O(n) · O(h)（标准最优解口径）。",
      "易错：递归返回值含义要统一（深度 / 路径和 / 是否合法）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：节点 2：左右孩子的最大贡献是 0 和 0（负贡献按 0 处理，不如不带）。① 路径… 下一步会怎样？",
        "options": [
          {
            "text": "节点 3：左右孩子的最大贡献是 0 和 0（负贡献按 0 处理，不如不带）。① 路径在这里拐…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "节点 3：左右孩子的最大贡献是 0 和 0（负贡献按 0 处理，不如不带）。① 路径在这里拐弯：和 = 3+0+0 = 3，全局 best 更新为 3；② 向上层只传单边最大贡献：3 + max(0,0) = 3"
      }
    ]
  },
  "oranges-rotting": {
    "idea": "多源 BFS：所有腐烂橘子同时逐层扩散，扩散完还有新鲜的就是 -1",
    "contrast": {
      "bad": "反复全图扫描：O(V·E)",
      "good": "BFS/DFS/拓扑：O(V+E)"
    },
    "takeaways": [
      "策略：多源 BFS：所有腐烂橘子同时逐层扩散，扩散完还有新鲜的就是 -1",
      "复杂度：O(m×n) · O(m×n)（标准最优解口径）。",
      "易错：visited 标记时机，避免重复入队 / 环。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：先跑一遍全场：所有腐烂橘子（1 个）入队，统计新鲜橘子共 6 个——这些腐烂橘子是\"… 下一步会怎样？",
        "options": [
          {
            "text": "第 1 分钟：这一轮 2 个新鲜橘子被邻居感染（绿色格子）——同一分钟里所有腐烂橘子同时向外…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 1 分钟：这一轮 2 个新鲜橘子被邻居感染（绿色格子）——同一分钟里所有腐烂橘子同时向外扩一圈，这就是 BFS 的\"层\""
      }
    ]
  },
  "can-finish": {
    "idea": "Kahn 拓扑排序：入度为 0 入队，出队修课并解锁后继；修完的门数 = 总数则无环",
    "contrast": {
      "bad": "反复全图扫描：O(V·E)",
      "good": "BFS/DFS/拓扑：O(V+E)"
    },
    "takeaways": [
      "策略：Kahn 拓扑排序：入度为 0 入队，出队修课并解锁后继；修完的门数 = 总数则无环",
      "复杂度：O(V+E) · O(V+E)（标准最优解口径）。",
      "易错：visited 标记时机，避免重复入队 / 环。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：修完课 0（累计 1 门）：把它解锁的课入度各减 1，其中 [1] 入度降到 0——… 下一步会怎样？",
        "options": [
          {
            "text": "修完课 1（累计 2 门）：把它解锁的课入度各减 1，其中 [2] 入度降到 0——可以排队…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "修完课 1（累计 2 门）：把它解锁的课入度各减 1，其中 [2] 入度降到 0——可以排队上了"
      }
    ]
  },
  "trie": {
    "idea": "字典树：逐字符下行的多叉树，节点表展示所有路径，词尾用 ✓ 标记",
    "contrast": {
      "bad": "反复全图扫描：O(V·E)",
      "good": "BFS/DFS/拓扑：O(V+E)"
    },
    "takeaways": [
      "策略：字典树：逐字符下行的多叉树，节点表展示所有路径，词尾用 ✓ 标记",
      "复杂度：O(L)/操作 · O(N×L)（标准最优解口径）。",
      "易错：visited 标记时机，避免重复入队 / 环。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：插入：沿字符 'p' 往下——没有这条边就现场创建一个新节点，有就走过去。当前停在路… 下一步会怎样？",
        "options": [
          {
            "text": "插入：沿字符 'p' 往下——没有这条边就现场创建一个新节点，有就走过去。当前停在路径 \"a…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "插入：沿字符 'p' 往下——没有这条边就现场创建一个新节点，有就走过去。当前停在路径 \"app\""
      }
    ]
  },
  "permute": {
    "idea": "回溯决策树：每层挑一个没用过的数，选满即得一个排列，试完撤销",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：回溯决策树：每层挑一个没用过的数，选满即得一个排列，试完撤销",
      "复杂度：O(n×n!) · O(n)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：选择 1（第 1 位）。回溯的本质：选一个 → 往下试 → 试完撤销回来，换下一个 下一步会怎样？",
        "options": [
          {
            "text": "选择 2（第 2 位）。回溯的本质：选一个 → 往下试 → 试完撤销回来，换下一个",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "选择 2（第 2 位）。回溯的本质：选一个 → 往下试 → 试完撤销回来，换下一个"
      }
    ]
  },
  "subsets": {
    "idea": "回溯枚举决策树所有节点：每进入一个节点就收割一个子集",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：回溯枚举决策树所有节点：每进入一个节点就收割一个子集",
      "复杂度：O(n×2ⁿ) · O(n)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：空集 ∅ 是第一个子集——回溯法把\"走过的每个节点\"都当作一个答案，而不是只收叶子 下一步会怎样？",
        "options": [
          {
            "text": "当前路径 [1] 本身就是一个子集，收入结果。注意：每进入一个节点先收割，再决定\"还要不要加…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "当前路径 [1] 本身就是一个子集，收入结果。注意：每进入一个节点先收割，再决定\"还要不要加下一个数\""
      }
    ]
  },
  "letter-combinations": {
    "idea": "多路回溯：每位数字在自己字母表里挑一个，选满即收一个组合",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：多路回溯：每位数字在自己字母表里挑一个，选满即收一个组合",
      "复杂度：O(4ⁿ×n) · O(n)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：数字 \"23\" 的字母组合 = 每位数字在自己的字母表里挑一个，全排一遍。第 2 位… 下一步会怎样？",
        "options": [
          {
            "text": "每一位都选完了——组合 \"ad\" 收入结果。回到上一层，把最后一位换成下一个字母（回溯撤销）",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "每一位都选完了——组合 \"ad\" 收入结果。回到上一层，把最后一位换成下一个字母（回溯撤销）"
      }
    ]
  },
  "combination-sum": {
    "idea": "可重复选取的回溯：remain 剪枝，减到 0 收一个组合",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：可重复选取的回溯：remain 剪枝，减到 0 收一个组合",
      "复杂度：O(答案数×长度) · O(target)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：选 2，还差 5。因为每个数可以重复用，下一层还从自己开始选（再往后会越选越大） 下一步会怎样？",
        "options": [
          {
            "text": "选 2，还差 3。因为每个数可以重复用，下一层还从自己开始选（再往后会越选越大）",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "选 2，还差 3。因为每个数可以重复用，下一层还从自己开始选（再往后会越选越大）"
      }
    ]
  },
  "generate-parenthesis": {
    "idea": "合法性剪枝回溯：左括号余额 n、右括号数不得超左括号数，放满必合法",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：合法性剪枝回溯：左括号余额 n、右括号数不得超左括号数，放满必合法",
      "复杂度：O(答案数×n) · O(n)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：3 对括号的合法组合 = 边放边守两条规则：① 左括号最多用 3 个；② 右括号数不… 下一步会怎样？",
        "options": [
          {
            "text": "\"((()))\" 全 6 位放完——因为每一步都保证了\"左括号数 ≥ 右括号数\"，所以只要放…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "\"((()))\" 全 6 位放完——因为每一步都保证了\"左括号数 ≥ 右括号数\"，所以只要放满长度，必然是合法的"
      }
    ]
  },
  "word-search": {
    "idea": "网格 DFS 回溯：匹配路径高亮，# 标记防回头，走不通就还原换方向",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：网格 DFS 回溯：匹配路径高亮，# 标记防回头，走不通就还原换方向",
      "复杂度：O(m×n×3^L) · O(L)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：匹配第 1 个字符 'A'：落在 (0,0)。先把它改成 #（本路径不能走回头路），… 下一步会怎样？",
        "options": [
          {
            "text": "匹配第 2 个字符 'B'：落在 (0,1)。先把它改成 #（本路径不能走回头路），再向上下…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "匹配第 2 个字符 'B'：落在 (0,1)。先把它改成 #（本路径不能走回头路），再向上下左右四个方向继续匹配下一个字符"
      }
    ]
  },
  "palindrome-partitioning": {
    "idea": "切分点回溯：从 start 枚举 end，[start..end] 是回文才切",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：切分点回溯：从 start 枚举 end，[start..end] 是回文才切",
      "复杂度：O(答案数×n²) · O(n)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：从位置 0 试到 0：片段 \"a\" 是回文 ✓，先切下它，再从 1 继续切后面的部分… 下一步会怎样？",
        "options": [
          {
            "text": "从位置 1 试到 1：片段 \"a\" 是回文 ✓，先切下它，再从 2 继续切后面的部分——切错…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "从位置 1 试到 1：片段 \"a\" 是回文 ✓，先切下它，再从 2 继续切后面的部分——切错了回溯再换切点"
      }
    ]
  },
  "search-range": {
    "idea": "两轮二分：命中不停手，压到最左/最右边界",
    "contrast": {
      "bad": "线性扫描：O(n)",
      "good": "每次折半：O(log n)"
    },
    "takeaways": [
      "策略：两轮二分：命中不停手，压到最左/最右边界",
      "复杂度：O(log n) · O(1)（标准最优解口径）。",
      "易错：开闭区间与 mid 取舍决定死循环与否。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：mid = 2（值 7 < 8）：答案只可能在右半，窗口收缩到 [3, 5] 下一步会怎样？",
        "options": [
          {
            "text": "mid = 4 命中 8！记录 左边界为 4，然后别停——继续往左半找更靠左的",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "mid = 4 命中 8！记录 左边界为 4，然后别停——继续往左半找更靠左的"
      }
    ]
  },
  "search-rotated": {
    "idea": "二分：每步先判断左半/右半哪边有序，看 target 在不在有序半边",
    "contrast": {
      "bad": "线性扫描：O(n)",
      "good": "每次折半：O(log n)"
    },
    "takeaways": [
      "策略：二分：每步先判断左半/右半哪边有序，看 target 在不在有序半边",
      "复杂度：O(log n) · O(1)（标准最优解口径）。",
      "易错：开闭区间与 mid 取舍决定死循环与否。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：mid = 3（值 7）：[lo..mid] 这段是升序（4 ≤ 7）——看 0 在… 下一步会怎样？",
        "options": [
          {
            "text": "mid = 5（值 1）：[lo..mid] 这段是升序（0 ≤ 1）——看 0 在不在 […",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "mid = 5（值 1）：[lo..mid] 这段是升序（0 ≤ 1）——看 0 在不在 [0, 1) 之间，在就收缩左半，否则去右半"
      }
    ]
  },
  "find-min-rotated": {
    "idea": "二分找断崖：nums[mid] 与 nums[hi] 比较，收敛到旋转点",
    "contrast": {
      "bad": "线性扫描：O(n)",
      "good": "每次折半：O(log n)"
    },
    "takeaways": [
      "策略：二分找断崖：nums[mid] 与 nums[hi] 比较，收敛到旋转点",
      "复杂度：O(log n) · O(1)（标准最优解口径）。",
      "易错：开闭区间与 mid 取舍决定死循环与否。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：mid = 2（值 5）比最右 2 大——mid 还爬在\"高的那一坡\"上，断崖在右半… 下一步会怎样？",
        "options": [
          {
            "text": "mid = 3（值 1 ≤ 最右 1）——mid 已在低谷一侧（或就是最小值），把右端收回到…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "mid = 3（值 1 ≤ 最右 1）——mid 已在低谷一侧（或就是最小值），把右端收回到 mid：[3, 3]"
      }
    ]
  },
  "search-matrix-binary": {
    "idea": "把矩阵拉直成一维做二分，下标换算行/列后十字高亮",
    "contrast": {
      "bad": "线性扫描：O(n)",
      "good": "每次折半：O(log n)"
    },
    "takeaways": [
      "策略：把矩阵拉直成一维做二分，下标换算行/列后十字高亮",
      "复杂度：O(log(m×n)) · O(1)（标准最优解口径）。",
      "易错：开闭区间与 mid 取舍决定死循环与否。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：mid = 5 展开成 (1, 1)：值 11 > 3 → 窗口收缩到左半，窗口 [… 下一步会怎样？",
        "options": [
          {
            "text": "mid = 2 展开成 (0, 2)：值 5 > 3 → 窗口收缩到左半，窗口 [0, 1]",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "mid = 2 展开成 (0, 2)：值 5 > 3 → 窗口收缩到左半，窗口 [0, 1]"
      }
    ]
  },
  "find-median-sorted-arrays": {
    "idea": "双数组切割线二分：i 定 j 定，保证左半 ≤ 右半",
    "contrast": {
      "bad": "线性扫描：O(n)",
      "good": "每次折半：O(log n)"
    },
    "takeaways": [
      "策略：双数组切割线二分：i 定 j 定，保证左半 ≤ 右半",
      "复杂度：O(log min(m,n)) · O(1)（标准最优解口径）。",
      "易错：开闭区间与 mid 取舍决定死循环与否。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：i = 0 切少了：b 左侧的 3 比 a 右侧的 2 还大——切割线要往右挪 下一步会怎样？",
        "options": [
          {
            "text": "i = 1, j = 1：左侧最大 2 ≤ 右侧最小 3——切割合法！",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "i = 1, j = 1：左侧最大 2 ≤ 右侧最小 3——切割合法！"
      }
    ]
  },
  "valid-parentheses": {
    "idea": "栈配对：左括号压栈，右括号必须匹配栈顶",
    "contrast": {
      "bad": "反复回看历史：O(n²)",
      "good": "单调栈 / 栈一次遍历：O(n)"
    },
    "takeaways": [
      "策略：栈配对：左括号压栈，右括号必须匹配栈顶",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：单调栈的弹出条件与栈底哨兵。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：括号合法性 = 栈的经典舞台：遇到左括号就压栈，遇到右括号就要求\"栈顶正好是它的左括… 下一步会怎样？",
        "options": [
          {
            "text": "'(' 是左括号——压入栈，等后面的人来配对",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "'(' 是左括号——压入栈，等后面的人来配对"
      }
    ]
  },
  "min-stack": {
    "idea": "辅助最小栈：主栈 + 最小栈双栈同步，栈顶即全局最小",
    "contrast": {
      "bad": "反复回看历史：O(n²)",
      "good": "单调栈 / 栈一次遍历：O(n)"
    },
    "takeaways": [
      "策略：辅助最小栈：主栈 + 最小栈双栈同步，栈顶即全局最小",
      "复杂度：O(1)/操作 · O(n)（标准最优解口径）。",
      "易错：单调栈的弹出条件与栈底哨兵。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：push -2：主栈照常压入；最小栈只在\"-2 ≤ 当前最小 -2\"时也压一份——这… 下一步会怎样？",
        "options": [
          {
            "text": "push 0：主栈照常压入；最小栈只在\"0 ≤ 当前最小 -2\"时也压一份——这样栈顶永远同…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "push 0：主栈照常压入；最小栈只在\"0 ≤ 当前最小 -2\"时也压一份——这样栈顶永远同步着全局最小"
      }
    ]
  },
  "decode-string": {
    "idea": "双栈剥括号：数字栈 + 前缀栈，遇 ] 拼回",
    "contrast": {
      "bad": "反复回看历史：O(n²)",
      "good": "单调栈 / 栈一次遍历：O(n)"
    },
    "takeaways": [
      "策略：双栈剥括号：数字栈 + 前缀栈，遇 ] 拼回",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：单调栈的弹出条件与栈底哨兵。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：多层嵌套的 \"3[a2[c]]\" 靠两个栈解：遇 [ 就把\"前面的数字\"和\"外面的字… 下一步会怎样？",
        "options": [
          {
            "text": "遇到 '['：把重复次数 3 和已拼好的前缀 \"\" 分别压栈（稍后拼回），然后清空当前段，开…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "遇到 '['：把重复次数 3 和已拼好的前缀 \"\" 分别压栈（稍后拼回），然后清空当前段，开始解析括号里面"
      }
    ]
  },
  "daily-temperatures": {
    "idea": "单调栈：栈里存等待更暖的日子，一次性结账",
    "contrast": {
      "bad": "反复回看历史：O(n²)",
      "good": "单调栈 / 栈一次遍历：O(n)"
    },
    "takeaways": [
      "策略：单调栈：栈里存等待更暖的日子，一次性结账",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：单调栈的弹出条件与栈底哨兵。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：今天 74° 比 0 日（73°）暖——0 日等到了答案：1 天。弹出结账，继续看栈… 下一步会怎样？",
        "options": [
          {
            "text": "今天 75° 比 1 日（74°）暖——1 日等到了答案：1 天。弹出结账，继续看栈里还有没…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "今天 75° 比 1 日（74°）暖——1 日等到了答案：1 天。弹出结账，继续看栈里还有没有人也在等"
      }
    ]
  },
  "largest-rectangle": {
    "idea": "递增栈：柱子退休时确定左右界，色带展示矩形范围",
    "contrast": {
      "bad": "反复回看历史：O(n²)",
      "good": "单调栈 / 栈一次遍历：O(n)"
    },
    "takeaways": [
      "策略：递增栈：柱子退休时确定左右界，色带展示矩形范围",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：单调栈的弹出条件与栈底哨兵。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：高度 2 的柱子退休：它向左能到 0、向右到 0，宽 1 × 高 2 = 面积 2—… 下一步会怎样？",
        "options": [
          {
            "text": "高度 6 的柱子退休：它向左能到 3、向右到 3，宽 1 × 高 6 = 面积 6——刷新纪…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "高度 6 的柱子退休：它向左能到 3、向右到 3，宽 1 × 高 6 = 面积 6——刷新纪录！"
      }
    ]
  },
  "trap-stack": {
    "idea": "单调栈：弹出盆底，左墙 + 右墙夹出凹槽逐层蓄水",
    "contrast": {
      "bad": "枚举所有区间 / 配对：O(n²)",
      "good": "双指针单调移动：O(n)"
    },
    "takeaways": [
      "策略：单调栈：弹出盆底，左墙 + 右墙夹出凹槽逐层蓄水",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：移动哪一侧指针要有单调性依据，否则漏解。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：接雨水（栈版）：栈里存\"还没找到右墙\"的柱子，高度从底到顶递减。一旦来了比栈顶高的柱… 下一步会怎样？",
        "options": [
          {
            "text": "凹槽 [1, 3]：左墙高 1、右墙高 2，水面高 1，盆底 0——蓄水 宽 1 × 高 1…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "凹槽 [1, 3]：左墙高 1、右墙高 2，水面高 1，盆底 0——蓄水 宽 1 × 高 1 = 1 格，累计 1"
      }
    ]
  },
  "kth-largest": {
    "idea": "大小为 k 的最小堆：超员踢堆顶，扫完后堆顶即第 k 大",
    "contrast": {
      "bad": "全排序取前 K：O(n log n)",
      "good": "堆维护 Top-K：O(n log k)"
    },
    "takeaways": [
      "策略：大小为 k 的最小堆：超员踢堆顶，扫完后堆顶即第 k 大",
      "复杂度：O(n log k) · O(k)（标准最优解口径）。",
      "易错：比较器方向（最大 / 最小堆）与堆大小维护。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：找第 2 大：不用全排序，只需要一个\"大小为 2 的擂台\"。用一个最小堆：新数放进来… 下一步会怎样？",
        "options": [
          {
            "text": "放入 3：还没攒够 2 个（当前 1 个），先都留着",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "放入 3：还没攒够 2 个（当前 1 个），先都留着"
      }
    ]
  },
  "top-k-frequent": {
    "idea": "频率桶：按出现次数装桶，从高频桶倒着扫收集",
    "contrast": {
      "bad": "全排序取前 K：O(n log n)",
      "good": "堆维护 Top-K：O(n log k)"
    },
    "takeaways": [
      "策略：频率桶：按出现次数装桶，从高频桶倒着扫收集",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：比较器方向（最大 / 最小堆）与堆大小维护。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：数完频率、装好桶：最高频的桶在最后（越靠后越热），从那儿倒着捡就能先拿到高频元素 下一步会怎样？",
        "options": [
          {
            "text": "从 3 次桶里捡出 1——还差 1 个，继续往低频方向扫",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "从 3 次桶里捡出 1——还差 1 个，继续往低频方向扫"
      }
    ]
  },
  "median-finder": {
    "idea": "对顶双堆：左半大顶堆 + 右半小顶堆，堆顶夹出中位数",
    "contrast": {
      "bad": "全排序取前 K：O(n log n)",
      "good": "堆维护 Top-K：O(n log k)"
    },
    "takeaways": [
      "策略：对顶双堆：左半大顶堆 + 右半小顶堆，堆顶夹出中位数",
      "复杂度：O(log n)/操作 · O(n)（标准最优解口径）。",
      "易错：比较器方向（最大 / 最小堆）与堆大小维护。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：加入 1：过一遍流程——先进左半、再把左半最大的挪给右半、不平衡再把右半最小的挪回来… 下一步会怎样？",
        "options": [
          {
            "text": "加入 2：过一遍流程——先进左半、再把左半最大的挪给右半、不平衡再把右半最小的挪回来。结束后…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "加入 2：过一遍流程——先进左半、再把左半最大的挪给右半、不平衡再把右半最小的挪回来。结束后左半堆顶 1、右半堆顶 2"
      }
    ]
  },
  "jump-game": {
    "idea": "贪心维护最远可达范围，中途掉队即失败",
    "contrast": {
      "bad": "动态规划全状态：O(n²)",
      "good": "局部最优推全局：O(n) / O(n log n)"
    },
    "takeaways": [
      "策略：贪心维护最远可达范围，中途掉队即失败",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：贪心选择性质需成立，否则要改 DP。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：站上位置 0（能跳 2 步）：从这里最远到 2，和已有记录取大 → 最远可达更新为 … 下一步会怎样？",
        "options": [
          {
            "text": "站上位置 1（能跳 3 步）：从这里最远到 4，和已有记录取大 → 最远可达更新为 4",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "站上位置 1（能跳 3 步）：从这里最远到 4，和已有记录取大 → 最远可达更新为 4"
      }
    ]
  },
  "jump-game-2": {
    "idea": "贪心逐层扩边：走到边界必跳一次，边界推到层内最远",
    "contrast": {
      "bad": "动态规划全状态：O(n²)",
      "good": "局部最优推全局：O(n) / O(n log n)"
    },
    "takeaways": [
      "策略：贪心逐层扩边：走到边界必跳一次，边界推到层内最远",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：贪心选择性质需成立，否则要改 DP。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：走到第 0 格的层边界——必须跳了！第 1 跳把覆盖范围推进到 2（层内所有格子探出… 下一步会怎样？",
        "options": [
          {
            "text": "走到第 2 格的层边界——必须跳了！第 2 跳把覆盖范围推进到 4（层内所有格子探出的最远距…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "走到第 2 格的层边界——必须跳了！第 2 跳把覆盖范围推进到 4（层内所有格子探出的最远距离）"
      }
    ]
  },
  "best-time-stock": {
    "idea": "贪心记录历史最低价，每天算\"今天卖能赚多少\"",
    "contrast": {
      "bad": "动态规划全状态：O(n²)",
      "good": "局部最优推全局：O(n) / O(n log n)"
    },
    "takeaways": [
      "策略：贪心记录历史最低价，每天算\"今天卖能赚多少\"",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：贪心选择性质需成立，否则要改 DP。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：今天 7 刷新了历史最低——从今天买最划算，利润还是 0 下一步会怎样？",
        "options": [
          {
            "text": "今天 1 刷新了历史最低——从今天买最划算，利润还是 0",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "今天 1 刷新了历史最低——从今天买最划算，利润还是 0"
      }
    ]
  },
  "partition-labels": {
    "idea": "先记每个字母最后位置，再贪心扩展片段边界",
    "contrast": {
      "bad": "动态规划全状态：O(n²)",
      "good": "局部最优推全局：O(n) / O(n log n)"
    },
    "takeaways": [
      "策略：先记每个字母最后位置，再贪心扩展片段边界",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：贪心选择性质需成立，否则要改 DP。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：读到 'a'（它最后出现在 2）：片段终点至少要撑到那儿——终点更新为 2 下一步会怎样？",
        "options": [
          {
            "text": "读到 'b'（它最后出现在 3）：片段终点至少要撑到那儿——终点更新为 3",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "读到 'b'（它最后出现在 3）：片段终点至少要撑到那儿——终点更新为 3"
      }
    ]
  },
  "climb-stairs": {
    "idea": "入门一维 DP：dp[i] = dp[i-1] + dp[i-2]",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：入门一维 DP：dp[i] = dp[i-1] + dp[i-2]",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第 2 阶：dp[1] + dp[0] = 1 + 1 = 2 下一步会怎样？",
        "options": [
          {
            "text": "第 3 阶：dp[2] + dp[1] = 2 + 1 = 3",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 3 阶：dp[2] + dp[1] = 2 + 1 = 3"
      }
    ]
  },
  "pascal-triangle": {
    "idea": "逐行递推：每格 = 上一行肩膀上两数之和",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：逐行递推：每格 = 上一行肩膀上两数之和",
      "复杂度：O(n²) · O(n²)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第 0 行只有一个 1——地基就位 下一步会怎样？",
        "options": [
          {
            "text": "第 1 行：首尾是 1，中间的 [（无）] 由上一行相邻两数相加而来",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 1 行：首尾是 1，中间的 [（无）] 由上一行相邻两数相加而来"
      }
    ]
  },
  "house-robber": {
    "idea": "一维 DP 二选一：偷（i-2 + 本家）或不偷（i-1）",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：一维 DP 二选一：偷（i-2 + 本家）或不偷（i-1）",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：前两家只能选一家：max(1, 2) = 2 下一步会怎样？",
        "options": [
          {
            "text": "第 2 家（3 元）：不偷 = 2，偷 = dp[0] + 3 = 4 → 取 max = …",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 2 家（3 元）：不偷 = 2，偷 = dp[0] + 3 = 4 → 取 max = 4"
      }
    ]
  },
  "perfect-squares": {
    "idea": "一维 DP 逐格松弛：dp[i] = min(dp[i], dp[i-k²] + 1)",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：一维 DP 逐格松弛：dp[i] = min(dp[i], dp[i-k²] + 1)",
      "复杂度：O(n×√n) · O(n)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：数字 1：dp[1] = 1——它本身就是完全平方数 下一步会怎样？",
        "options": [
          {
            "text": "数字 2：dp[2] = 2",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "数字 2：dp[2] = 2"
      }
    ]
  },
  "coin-change": {
    "idea": "完全背包：每种硬币过一轮，Δ 刷新更省的金额",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：完全背包：每种硬币过一轮，Δ 刷新更省的金额",
      "复杂度：O(金额×硬币数) · O(金额)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：用 1 元硬币过完一轮：所有\"叠一枚 1 更省\"的金额都被刷新——比如金额 11 现… 下一步会怎样？",
        "options": [
          {
            "text": "用 2 元硬币过完一轮：所有\"叠一枚 2 更省\"的金额都被刷新——比如金额 11 现在需要 …",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "用 2 元硬币过完一轮：所有\"叠一枚 2 更省\"的金额都被刷新——比如金额 11 现在需要 6 枚"
      }
    ]
  },
  "word-break": {
    "idea": "一维 bool DP：枚举切点 j，dp[j] ✓ 且 s[j..i) 在字典则 dp[i] ✓",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：一维 bool DP：枚举切点 j，dp[j] ✓ 且 s[j..i) 在字典则 dp[i] ✓",
      "复杂度：O(n²) · O(n)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：前 0 个字符可拆 ✓，且第 0~3 个字符 \"leet\" 在字典里 → 前 4 个… 下一步会怎样？",
        "options": [
          {
            "text": "前 4 个字符可拆 ✓，且第 4~7 个字符 \"code\" 在字典里 → 前 8 个字符也可…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "前 4 个字符可拆 ✓，且第 4~7 个字符 \"code\" 在字典里 → 前 8 个字符也可以拆！"
      }
    ]
  },
  "longest-increasing-subsequence": {
    "idea": "一维 DP：dp[i] = max(dp[j] + 1)（所有小于 nums[i] 的 j）",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：一维 DP：dp[i] = max(dp[j] + 1)（所有小于 nums[i] 的 j）",
      "复杂度：O(n²) · O(n)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：位置 0（值 10）：向前找所有比它小的数接上——dp[0] = 1；全局最长目前是… 下一步会怎样？",
        "options": [
          {
            "text": "位置 1（值 9）：向前找所有比它小的数接上——dp[1] = 1；全局最长目前是 1",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "位置 1（值 9）：向前找所有比它小的数接上——dp[1] = 1；全局最长目前是 1"
      }
    ]
  },
  "max-product-subarray": {
    "idea": "双状态 DP：同时维护以 i 结尾的最大/最小乘积，遇负数交换",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：双状态 DP：同时维护以 i 结尾的最大/最小乘积，遇负数交换",
      "复杂度：O(n) · O(1)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：乘上 3：以 1 结尾的最大乘积 = 6，最小乘积 = 3，全局最佳 6 下一步会怎样？",
        "options": [
          {
            "text": "乘上 -2（负数！先交换最大/最小再乘——负负得正嘛）：以 2 结尾的最大乘积 = -2，最…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "乘上 -2（负数！先交换最大/最小再乘——负负得正嘛）：以 2 结尾的最大乘积 = -2，最小乘积 = -12，全局最佳 6"
      }
    ]
  },
  "partition-equal-subset": {
    "idea": "01 背包：目标 = 总和一半，金额逆序扫保证每数只用一次",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：01 背包：目标 = 总和一半，金额逆序扫保证每数只用一次",
      "复杂度：O(n×target) · O(target)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：过一遍数 1（金额从大到小逆序扫——保证每个数最多用一次）：所有\"差 1 就能凑到\"… 下一步会怎样？",
        "options": [
          {
            "text": "过一遍数 5（金额从大到小逆序扫——保证每个数最多用一次）：所有\"差 5 就能凑到\"的金额都…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "过一遍数 5（金额从大到小逆序扫——保证每个数最多用一次）：所有\"差 5 就能凑到\"的金额都点亮了——当前能凑到 4 种金额"
      }
    ]
  },
  "unique-paths": {
    "idea": "二维 DP 逐行填表：每格 = 上方 + 左方",
    "contrast": {
      "bad": "暴力枚举所有路径：指数级",
      "good": "二维填表：O(mn)"
    },
    "takeaways": [
      "策略：二维 DP 逐行填表：每格 = 上方 + 左方",
      "复杂度：O(m×n) · O(m×n)（标准最优解口径）。",
      "易错：初始化第 0 行 / 列与遍历顺序。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第 1 行填完：每格 = 上方格子 + 左方格子（两条来路）——右下角（2, 6）目… 下一步会怎样？",
        "options": [
          {
            "text": "第 2 行填完：每格 = 上方格子 + 左方格子（两条来路）——右下角（2, 6）目前是 2…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 2 行填完：每格 = 上方格子 + 左方格子（两条来路）——右下角（2, 6）目前是 28"
      }
    ]
  },
  "min-path-sum": {
    "idea": "二维 DP 就地填表：边界先行，其余格 = min(上, 左) + 本格",
    "contrast": {
      "bad": "暴力枚举所有路径：指数级",
      "good": "二维填表：O(mn)"
    },
    "takeaways": [
      "策略：二维 DP 就地填表：边界先行，其余格 = min(上, 左) + 本格",
      "复杂度：O(m×n) · O(1)（标准最优解口径）。",
      "易错：初始化第 0 行 / 列与遍历顺序。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：格子 (1, 1)：从上面来要花 4、从左边来要花 2——走省的那条，本格累计最小和… 下一步会怎样？",
        "options": [
          {
            "text": "格子 (1, 2)：从上面来要花 5、从左边来要花 7——走省的那条，本格累计最小和 6",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "格子 (1, 2)：从上面来要花 5、从左边来要花 7——走省的那条，本格累计最小和 6"
      }
    ]
  },
  "longest-palindrome-substr": {
    "idea": "区间 DP：按长度从小到大，头尾相等且内层回文则整体回文",
    "contrast": {
      "bad": "暴力枚举所有路径：指数级",
      "good": "二维填表：O(mn)"
    },
    "takeaways": [
      "策略：区间 DP：按长度从小到大，头尾相等且内层回文则整体回文",
      "复杂度：O(n²) · O(n²)（标准最优解口径）。",
      "易错：初始化第 0 行 / 列与遍历顺序。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：长度 2 的一轮：没有任何一对头尾相等又内层回文——这轮没发现新回文 下一步会怎样？",
        "options": [
          {
            "text": "长度 3 的一轮：头尾相等的有 2 对上了（绿色格）——它们要么是长度 2、要么里面那层已是…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "长度 3 的一轮：头尾相等的有 2 对上了（绿色格）——它们要么是长度 2、要么里面那层已是回文。当前最长 \"bab\""
      }
    ]
  },
  "edit-distance": {
    "idea": "二维 DP：相同继承左上，不同则 min(删/插/改) + 1",
    "contrast": {
      "bad": "暴力枚举所有路径：指数级",
      "good": "二维填表：O(mn)"
    },
    "takeaways": [
      "策略：二维 DP：相同继承左上，不同则 min(删/插/改) + 1",
      "复杂度：O(m×n) · O(m×n)（标准最优解口径）。",
      "易错：初始化第 0 行 / 列与遍历顺序。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第 1 行填完（word1 的字符 'h'）：逐格比较——相同就\"继承左上\"，不同就… 下一步会怎样？",
        "options": [
          {
            "text": "第 2 行填完（word1 的字符 'o'）：逐格比较——相同就\"继承左上\"，不同就在\"删/…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 2 行填完（word1 的字符 'o'）：逐格比较——相同就\"继承左上\"，不同就在\"删/插/改\"三个邻居里挑最小 + 1"
      }
    ]
  },
  "longest-valid-parentheses": {
    "idea": "栈底哨兵：存未配对下标，弹栈后 i − 栈顶即有效长度",
    "contrast": {
      "bad": "递归重复子问题：指数级",
      "good": "记忆化 / 递推填表：O(n)~O(n²)"
    },
    "takeaways": [
      "策略：栈底哨兵：存未配对下标，弹栈后 i − 栈顶即有效长度",
      "复杂度：O(n) · O(n)（标准最优解口径）。",
      "易错：状态定义与转移方程的边界（第 0 行 / 列）。"
    ],
    "predicts": [
      {
        "atFrame": 0,
        "question": "当前：一个经典技巧：栈里存\"还没配对的左括号下标\"，并在**栈底放一个哨兵 -1**（表示… 下一步会怎样？",
        "options": [
          {
            "text": "读到 '('：压入它的下标 0，等一个 ')' 来配对",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "读到 '('：压入它的下标 0，等一个 ')' 来配对"
      }
    ]
  },
  "search-insert": {
    "idea": "二分查找：窗口收缩到空时 lo 即插入位",
    "contrast": {
      "bad": "线性扫描：O(n)",
      "good": "每次折半：O(log n)"
    },
    "takeaways": [
      "策略：二分查找：窗口收缩到空时 lo 即插入位",
      "复杂度：O(log n) · O(1)（标准最优解口径）。",
      "易错：开闭区间与 mid 取舍决定死循环与否。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：mid = 1（值 3 < 5）：答案在右半，lo 右移到 2 下一步会怎样？",
        "options": [
          {
            "text": "mid = 2 正好是 5——直接返回下标 2",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "mid = 2 正好是 5——直接返回下标 2"
      }
    ]
  },
  "n-queens": {
    "idea": "回溯 + 三集合剪枝：列 / 主对角 / 副对角冲突即时跳过",
    "contrast": {
      "bad": "生成全部再过滤：指数级浪费",
      "good": "剪枝回溯：只走可行分支"
    },
    "takeaways": [
      "策略：回溯 + 三集合剪枝：列 / 主对角 / 副对角冲突即时跳过",
      "复杂度：O(n!×n) · O(n)（标准最优解口径）。",
      "易错：选择 / 撤销要成对，剪枝条件不能漏解。"
    ],
    "predicts": [
      {
        "atFrame": 1,
        "question": "当前：第 0 行的皇后放在第 0 列：列 0 空闲、对角线 0+0=0 与 0−0=0 也… 下一步会怎样？",
        "options": [
          {
            "text": "第 1 行的皇后放在第 2 列：列 2 空闲、对角线 1+2=3 与 1−2=-1 也没人占…",
            "correct": true
          },
          {
            "text": "直接返回最终答案",
            "correct": false
          },
          {
            "text": "跳过当前元素继续",
            "correct": false
          }
        ],
        "explain": "第 1 行的皇后放在第 2 列：列 2 空闲、对角线 1+2=3 与 1−2=-1 也没人占——放下！递归去选第 2 行"
      }
    ]
  }
}
