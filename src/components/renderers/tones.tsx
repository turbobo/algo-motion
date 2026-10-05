/**
 * 色调系统：视图标注语义 → 统一的视觉样式。
 * active=当前动作（琥珀）ok=命中/完成（绿）warn=注意（黄）danger=冲突（红）muted=已排除（灰）
 */
import type { Tone } from '../../types'

export interface ToneStyle {
  color: string
  bg: string
  glow: string
  border: string
}

export const TONE_STYLES: Record<Tone, ToneStyle> = {
  active: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.14)',
    glow: 'rgba(245, 158, 11, 0.35)',
    border: 'rgba(245, 158, 11, 0.75)',
  },
  ok: {
    color: '#4ade80',
    bg: 'rgba(74, 222, 128, 0.14)',
    glow: 'rgba(74, 222, 128, 0.45)',
    border: 'rgba(74, 222, 128, 0.8)',
  },
  warn: {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    glow: 'rgba(251, 191, 36, 0.3)',
    border: 'rgba(251, 191, 36, 0.65)',
  },
  danger: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.14)',
    glow: 'rgba(239, 68, 68, 0.4)',
    border: 'rgba(239, 68, 68, 0.75)',
  },
  muted: {
    color: '#8b95a5',
    bg: 'rgba(139, 149, 165, 0.08)',
    glow: 'transparent',
    border: 'rgba(255, 255, 255, 0.1)',
  },
}

/** 视图卡片统一标题 */
export function ViewTitle({ text }: { text: string }) {
  return <div className="mb-2 font-mono text-[11px] tracking-wide text-sub">{text}</div>
}
