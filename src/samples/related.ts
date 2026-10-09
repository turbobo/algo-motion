/**
 * 一题多解互链：样题 id → 对照解法的样题 id（双向映射）。
 * 用于首页卡片「双解法」角标与播放页「对照解法」一键切换。
 */
export const RELATED_SAMPLES: Record<string, string> = {
  trap: 'trap-stack',
  'trap-stack': 'trap',
}
