/**
 * 帧压缩：仅合并完全相同的连续空转帧，保留所有有信息量的帧与顺序。
 */
import { describe, expect, it } from 'vitest'
import { compressFrames } from '../src/engine/protocol'
import type { RawFrame } from '../src/types'

const f = (msg: string, extra?: Partial<RawFrame>): RawFrame => ({
  at: 'x',
  msg,
  views: {},
  ...extra,
})

describe('compressFrames', () => {
  it('合并连续完全重复帧', () => {
    const a = f('step', { vars: { i: '1' } })
    const out = compressFrames([a, { ...a }, { ...a }, f('next')])
    expect(out.length).toBe(2)
    expect(out[0]?.msg).toBe('step')
    expect(out[1]?.msg).toBe('next')
  })

  it('不合并仅 msg 不同 / views 不同 / vars 不同的帧', () => {
    const base = f('m', { vars: { i: '1' } })
    const out = compressFrames([
      base,
      f('m2', { vars: { i: '1' } }),
      f('m', { vars: { i: '2' } }),
      f('m', { views: { a: { kind: 'array', values: [1] } } }),
    ])
    expect(out.length).toBe(4)
  })

  it('非连续重复不合并（A B A 保留 3）', () => {
    const a = f('a')
    const b = f('b')
    expect(compressFrames([a, b, { ...a }]).length).toBe(3)
  })

  it('空数组与单帧原样返回', () => {
    expect(compressFrames([])).toEqual([])
    const a = f('a')
    expect(compressFrames([a]).length).toBe(1)
  })

  it('stack 差异视为不同帧', () => {
    const a = f('m', { stack: ['f(1)'] })
    const b = f('m', { stack: ['f(1)', 'f(2)'] })
    expect(compressFrames([a, b]).length).toBe(2)
  })
})