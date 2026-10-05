/**
 * 错误边界：把「一处渲染异常 → 整页白屏」降级为局部可恢复的提示。
 *
 * 两层用法：
 * 1. main.tsx 包住整棵树 —— 全局兜底（崩溃至少能看到中文提示与重试入口）
 * 2. PlayerScreen 包住舞台 —— 单帧视图崩溃只影响舞台区域，
 *    代码面板/播放条仍可用，且 resetKey（帧游标）变化时自动恢复
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** 变化时自动清除错误状态（用于「翻一帧就恢复」） */
  resetKey?: unknown
  /** 出错区域的语境，用于提示文案与控制台定位 */
  label?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 保留原始堆栈到控制台（本项目无远端上报）
    console.error(`[${this.props.label ?? 'app'}] 渲染异常`, error, info.componentStack)
  }

  componentDidUpdate(prev: Props): void {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  private reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    const label = this.props.label ?? '页面'
    return (
      <div className="flex h-full min-h-[8rem] flex-col items-center justify-center gap-3 p-4 text-center">
        <div className="text-sm text-ink/90">{label}渲染出错，已停止该区域绘制</div>
        <p className="max-w-sm font-mono text-[11px] leading-relaxed text-sub">
          {String(error.message ?? error).slice(0, 200)}
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="rounded-lg border border-accent/50 bg-accent/15 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/25"
        >
          重试
        </button>
      </div>
    )
  }
}
