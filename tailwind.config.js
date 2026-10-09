/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f1419',
        surface: '#1a2332',
        'surface-2': '#222d3d',
        ink: '#e6e6e6',
        sub: '#8b95a5',
        accent: '#f59e0b',
        ok: '#4ade80',
        warn: '#fbbf24',
        danger: '#ef4444',
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
        /** 帧间变化脉冲：琥珀色光圈扩散 + 轻微放大（注意：不透明度归零靠 boxShadow spread，不动元素背景） */
        flash: {
          '0%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.65)', transform: 'scale(1.1)' },
          '60%': { boxShadow: '0 0 0 7px rgba(245, 158, 11, 0)', transform: 'scale(1)' },
          '100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0)', transform: 'scale(1)' },
        },
        flashText: {
          from: { color: '#f59e0b' },
          to: { color: '#e6e6e6' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        popIn: 'popIn 0.25s ease-out',
        flash: 'flash 0.75s ease-out',
        'flash-text': 'flashText 0.9s ease-out',
      },
    },
  },
  plugins: [],
}
