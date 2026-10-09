/**
 * 播放状态机：帧游标 + 播放/暂停 + 倍速。
 * 自动播放用「推进一步再调度下一步」的 setTimeout 链（速度变化即时生效，
 * 且不会因页面卡顿堆积帧）。
 */
import { useCallback, useEffect, useState } from 'react'

/** 1x 速度下每帧停留时长（毫秒）——调得偏慢，留给讲解的阅读时间 */
const BASE_INTERVAL_MS = 1500

export const SPEED_OPTIONS = [0.5, 1, 2, 4] as const

/** 倍速偏好本地记忆（白名单校验：脏数据回退 1x） */
const SPEED_KEY = 'algomotion:speed'

function loadSpeed(): number {
  try {
    const n = Number(localStorage.getItem(SPEED_KEY))
    return (SPEED_OPTIONS as readonly number[]).includes(n) ? n : 1
  } catch {
    return 1
  }
}

export function usePlayer(totalFrames: number) {
  const [cursor, setCursor] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeedState] = useState<number>(loadSpeed)

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s)
    try {
      localStorage.setItem(SPEED_KEY, String(s))
    } catch {
      /* 存储不可用：仅内存生效 */
    }
  }, [])

  const clamp = useCallback(
    (n: number) => Math.max(0, Math.min(Math.max(totalFrames - 1, 0), n)),
    [totalFrames],
  )

  // 帧序列切换时回到起点
  useEffect(() => {
    setCursor(0)
    setPlaying(false)
  }, [totalFrames])

  // 自动播放：每步调度下一次推进
  useEffect(() => {
    if (!playing) return
    if (cursor >= totalFrames - 1) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => {
      setCursor((c) => Math.min(c + 1, Math.max(totalFrames - 1, 0)))
    }, BASE_INTERVAL_MS / speed)
    return () => window.clearTimeout(timer)
  }, [playing, cursor, totalFrames, speed])

  const next = useCallback(() => setCursor((c) => clamp(c + 1)), [clamp])
  const prev = useCallback(() => setCursor((c) => clamp(c - 1)), [clamp])
  const seek = useCallback((n: number) => setCursor(clamp(n)), [clamp])
  const toggle = useCallback(() => {
    if (!playing && cursor >= totalFrames - 1) setCursor(0)
    setPlaying((p) => !p)
  }, [playing, cursor, totalFrames])

  return { cursor, playing, speed, setSpeed, next, prev, seek, toggle, setPlaying }
}
