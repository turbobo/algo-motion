/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // LeetCode 实测配色，RGB 通道变量支持 /alpha 修饰，深/浅由 [data-theme] 切换
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        sub: 'rgb(var(--c-sub) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        'danger-text': 'rgb(var(--c-danger-text) / <alpha-value>)',
        easy: 'rgb(var(--c-easy) / <alpha-value>)',
        // 语义中性 token（替代 white/xx，随主题切换）
        line: 'var(--line)',
        'line-soft': 'var(--line-soft)',
        'line-strong': 'var(--line-strong)',
        fill: 'var(--fill)',
        'fill-2': 'var(--fill-2)',
        'fill-3': 'var(--fill-3)',
        faint: 'var(--faint)',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // 值落定：新值从下方滑入 + 微过冲（替代 scale 弹跳）
        settleIn: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // 语义脉冲：颜色跟随 tone（active 橙 / ok 绿 / danger 红）
        flashActive: {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--c-accent) / 0.6)', transform: 'scale(1.06)' },
          '100%': { boxShadow: '0 0 0 8px rgb(var(--c-accent) / 0)', transform: 'scale(1)' },
        },
        flashOk: {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--c-ok) / 0.7)', transform: 'scale(1.08)' },
          '50%': { boxShadow: '0 0 0 10px rgb(var(--c-ok) / 0.15)' },
          '100%': { boxShadow: '0 0 0 14px rgb(var(--c-ok) / 0)', transform: 'scale(1)' },
        },
        flashDanger: {
          '0%,100%': { transform: 'translateX(0)', boxShadow: '0 0 0 0 rgb(var(--c-danger) / 0.6)' },
          '20%': { transform: 'translateX(-2px)', boxShadow: '0 0 0 4px rgb(var(--c-danger) / 0.3)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'translateX(-1px)', boxShadow: '0 0 0 7px rgb(var(--c-danger) / 0)' },
          '80%': { transform: 'translateX(1px)' },
        },
        flashText: {
          from: { color: 'rgb(var(--c-accent))' },
          to: { color: 'rgb(var(--c-ink))' },
        },
        // 完成时刻：ok 元素绽放
        completeBloom: {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--c-ok) / 0.5)', transform: 'scale(1)' },
          '40%': { boxShadow: '0 0 0 12px rgb(var(--c-ok) / 0.12)', transform: 'scale(1.06)' },
          '100%': { boxShadow: '0 0 0 18px rgb(var(--c-ok) / 0)', transform: 'scale(1)' },
        },
        checkBloom: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // 帧呼吸：前进上飘 / 后退下飘
        breathFwd: {
          '0%': { transform: 'translateY(1px)', opacity: '0.92' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        breathBack: {
          '0%': { transform: 'translateY(-1px)', opacity: '0.92' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // 指针残影淡出
        ghostFade: {
          '0%': { opacity: '0.6' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        popIn: 'popIn 0.25s ease-out',
        settleIn: 'settleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'flash-active': 'flashActive 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'flash-ok': 'flashOk 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'flash-danger': 'flashDanger 0.5s ease-out',
        'flash-text': 'flashText 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        complete: 'completeBloom 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'check-bloom': 'checkBloom 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'breath-fwd': 'breathFwd 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        'breath-back': 'breathBack 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        'ghost-fade': 'ghostFade 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}