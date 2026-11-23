/**
 * GIF 编码（基于开源 gifenc，MIT）：把 RGBA 帧序列编码为 GIF89a。
 * 纯逻辑（不依赖 DOM），便于单测；绘制在 exportFrames.ts 中完成。
 */
// @ts-expect-error gifenc 未随包提供类型声明；运行时 API 由本文件的封装约束
import { GIFEncoder, applyPalette, quantize } from 'gifenc'

export interface RgbaFrame {
  data: Uint8ClampedArray | Uint8Array
  width: number
  height: number
}

/** 编码 GIF，帧间隔 delayMs 毫秒，无限循环 */
export function encodeGifFromRgba(frames: RgbaFrame[], delayMs = 500): Uint8Array {
  const enc = GIFEncoder()
  for (const f of frames) {
    const palette = quantize(f.data, 256)
    const index = applyPalette(f.data, palette)
    enc.writeFrame(index, f.width, f.height, { palette, delay: delayMs, repeat: 0 })
  }
  enc.finish()
  return enc.bytes()
}