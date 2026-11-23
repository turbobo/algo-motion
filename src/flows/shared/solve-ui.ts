import type { SolveProblem } from './types'

/** 难度徽章配色（LeetCode 官方三色：简单青绿 / 中等黄 / 困难红） */
export const DIFFICULTY_STYLE: Record<SolveProblem['difficulty'], string> = {
  简单: 'border-easy/40 bg-easy/10 text-easy',
  中等: 'border-warn/40 bg-warn/10 text-warn',
  困难: 'border-danger/40 bg-danger/10 text-danger-text',
}

/** 判题结论色调（AC / WA / TLE / CE / RE 共用） */
export const VERDICT_TONE_STYLE: Record<'ok' | 'warn' | 'danger', string> = {
  ok: 'border-ok/40 bg-ok/10 text-ok',
  warn: 'border-warn/40 bg-warn/10 text-warn',
  danger: 'border-danger/40 bg-danger/10 text-danger-text',
}
