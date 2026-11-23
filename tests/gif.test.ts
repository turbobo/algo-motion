/**
 * GIF 编码封装（gifenc）：结构校验（头/尾/NETSCAPE/尺寸）。
 */
import { describe, expect, it } from 'vitest'
import { encodeGifFromRgba } from '../src/export/gif'

function solid(w: number, h: number, r: number, g: number, b: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    out[i * 4] = r
    out[i * 4 + 1] = g
    out[i * 4 + 2] = b
    out[i * 4 + 3] = 255
  }
  return out
}

describe('encodeGifFromRgba', () => {
  it('输出合法 GIF89a 头/尾与 NETSCAPE 循环', () => {
    const gif = encodeGifFromRgba([
      { data: solid(4, 4, 26, 26, 26), width: 4, height: 4 },
      { data: solid(4, 4, 255, 161, 22), width: 4, height: 4 },
    ])
    expect(String.fromCharCode(...gif.slice(0, 6))).toBe('GIF89a')
    expect(gif[gif.length - 1]).toBe(0x3b)
    const all = String.fromCharCode(...Array.from(gif))
    expect(all.includes('NETSCAPE2.0')).toBe(true)
    // 逻辑屏幕宽高
    expect(gif[6]! | (gif[7]! << 8)).toBe(4)
    expect(gif[8]! | (gif[9]! << 8)).toBe(4)
  })
})