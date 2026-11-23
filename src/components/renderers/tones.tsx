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
    color: 'rgb(var(--c-accent))',
    bg: 'rgb(var(--c-accent) / 0.14)',
    glow: 'rgb(var(--c-accent) / 0.35)',
    border: 'rgb(var(--c-accent) / 0.75)',
  },
  ok: {
    color: 'rgb(var(--c-ok))',
    bg: 'rgb(var(--c-ok) / 0.14)',
    glow: 'rgb(var(--c-ok) / 0.45)',
    border: 'rgb(var(--c-ok) / 0.8)',
  },
  warn: {
    color: 'rgb(var(--c-warn))',
    bg: 'rgb(var(--c-warn) / 0.12)',
    glow: 'rgb(var(--c-warn) / 0.3)',
    border: 'rgb(var(--c-warn) / 0.65)',
  },
  danger: {
    color: 'rgb(var(--c-danger-text))',
    bg: 'rgb(var(--c-danger) / 0.14)',
    glow: 'rgb(var(--c-danger) / 0.4)',
    border: 'rgb(var(--c-danger) / 0.75)',
  },
  muted: {
    color: 'rgb(var(--c-sub))',
    bg: 'rgb(var(--c-sub) / 0.08)',
    glow: 'transparent',
    border: 'var(--line)',
  },
}

/** 视图卡片统一标题 */
export function ViewTitle({ text }: { text: string }) {
  return <div className="mb-2 font-mono text-[11px] tracking-wide text-sub">{text}</div>
}

/** 语义脉冲：flash 颜色跟随 tone（ok 绿 / danger 红 / 其余琥珀） */
export function flashClass(tone: Tone | undefined): string {
  if (tone === 'ok') return 'animate-flash-ok'
  if (tone === 'danger') return 'animate-flash-danger'
  return 'animate-flash-active'
}
