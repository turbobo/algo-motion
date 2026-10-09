/**
 * 学习进度：localStorage 持久化「已播完的样题 + 最近打开」。
 * - learned：播到最后一帧（含拖拽直达）即视为已学，只记账不校验归属
 * - last：最近打开的样题 id（首页「继续上次」入口）
 * 存储不可用（隐私模式等）时静默降级为纯内存状态。
 */
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'algomotion:progress'

interface ProgressState {
  learned: Set<string>
  last: string | null
}

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { learned: new Set(), last: null }
    const data = JSON.parse(raw) as { learned?: unknown; last?: unknown }
    const learned = Array.isArray(data.learned)
      ? new Set(data.learned.filter((x): x is string => typeof x === 'string'))
      : new Set<string>()
    return { learned, last: typeof data.last === 'string' ? data.last : null }
  } catch {
    return { learned: new Set(), last: null }
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(loadProgress)

  // state 变化后持久化（setState updater 保持纯函数；写入失败静默降级为内存态）
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ learned: [...progress.learned], last: progress.last }),
      )
    } catch {
      /* 存储不可用：仅内存记录 */
    }
  }, [progress])

  const markLearned = useCallback((id: string) => {
    setProgress((prev) => {
      if (prev.learned.has(id)) return prev
      const learned = new Set(prev.learned)
      learned.add(id)
      return { ...prev, learned }
    })
  }, [])

  const markOpened = useCallback((id: string) => {
    setProgress((prev) => (prev.last === id ? prev : { ...prev, last: id }))
  }, [])

  return { learned: progress.learned, last: progress.last, markLearned, markOpened }
}
