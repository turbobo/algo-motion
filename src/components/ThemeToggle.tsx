import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      title={theme === 'dark' ? '浅色模式' : '深色模式'}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-sub transition-colors hover:border-line-strong hover:text-ink"
    >
      {theme === 'dark' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5h0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM3 11h2a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2zm16 0h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2zM5.6 4.2l1.4 1.4A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4zm12.8 12.8 1.4 1.4a1 1 0 0 1-1.4 1.4L17 18.4a1 1 0 0 1 1.4-1.4zM4.2 18.4 5.6 17A1 1 0 0 1 7 18.4l-1.4 1.4a1 1 0 0 1-1.4-1.4zM17 5.6l1.4-1.4a1 1 0 0 1 1.4 1.4L18.4 7A1 1 0 0 1 17 5.6z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}