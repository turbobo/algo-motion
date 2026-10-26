/**
 * 首批开放「做题」的样题 id（完整题面在 mock-data.ts）。
 * 独立成轻量文件：首页只消费这份元数据，避免把整份题面拉进主包。
 */
export const SOLVE_PROBLEM_IDS = ['two-sum', 'max-sub-array', 'trap'] as const

export type SolveProblemId = (typeof SOLVE_PROBLEM_IDS)[number]

export function isSolveProblemId(id: string): id is SolveProblemId {
  return (SOLVE_PROBLEM_IDS as readonly string[]).includes(id)
}
