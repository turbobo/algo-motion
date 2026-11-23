/**
 * 把帧序列绘制到 canvas 并编码为 GIF（浏览器侧）。
 * 覆盖 array / hashmap / stack / matrix / grid 的简化绘制，其他视图以讲解卡兜底。
 */
import type { AlgorithmCase, Frame, Tone, View } from '../types'
import { encodeGifFromRgba, type RgbaFrame } from './gif'

const W = 720
const H = 460
const PAD = 24

const C = {
  bg: '#1a1a1a',
  surface: '#282828',
  cell: '#333333',
  cellDim: '#2b2b2b',
  ink: '#f5f5f5',
  sub: '#a8a8a8',
  line: '#3a3a3a',
  black: '#111111',
}
const TONE: Record<Tone, string> = {
  active: '#ffa116',
  ok: '#2cbb5d',
  warn: '#ffb700',
  danger: '#ef4743',
  muted: '#777777',
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const lines: string[] = []
  let cur = ''
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width > maxW) {
      lines.push(cur)
      cur = ch
      if (lines.length >= maxLines) break
    } else {
      cur += ch
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur)
  return lines
}

function drawArray(ctx: CanvasRenderingContext2D, view: Extract<View, { kind: 'array' }>, top: number): number {
  const cell = 44
  const gap = 8
  const maxCols = Math.min(view.values.length, Math.floor((W - PAD * 2) / (cell + gap)))
  const marks = new Map((view.marks ?? []).map((m) => [m.index, m.tone]))
  const ptrAt = new Map<number, string[]>()
  for (const [label, idx] of Object.entries(view.pointers ?? {})) {
    const list = ptrAt.get(idx) ?? []
    list.push(label)
    ptrAt.set(idx, list)
  }
  const startX = PAD
  ctx.font = '13px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < maxCols; i++) {
    const x = startX + i * (cell + gap)
    const tone = marks.get(i)
    const color = tone ? TONE[tone] : null
    // pointer
    const ptrs = ptrAt.get(i)
    if (ptrs) {
      ctx.fillStyle = color ?? '#ffa116'
      ctx.font = '11px monospace'
      ctx.fillText(ptrs.join(','), x + cell / 2, top)
    }
    ctx.fillStyle = color ?? C.cell
    roundRect(ctx, x, top + 18, cell, cell, 8)
    ctx.fill()
    ctx.strokeStyle = color ?? C.line
    ctx.stroke()
    ctx.fillStyle = color ?? C.ink
    ctx.font = '14px monospace'
    const v = view.values[i]
    ctx.fillText(v === null || v === undefined ? '∅' : String(v), x + cell / 2, top + 18 + cell / 2)
    ctx.fillStyle = C.sub
    ctx.font = '10px monospace'
    ctx.fillText(String(i), x + cell / 2, top + 18 + cell + 10)
  }
  if (view.values.length > maxCols) {
    ctx.fillStyle = C.sub
    ctx.textAlign = 'left'
    ctx.fillText(`…共 ${view.values.length} 个`, PAD, top + 18 + cell + 26)
    ctx.textAlign = 'center'
  }
  return top + 18 + cell + 26
}

function drawHashmap(ctx: CanvasRenderingContext2D, view: Extract<View, { kind: 'hashmap' }>, top: number): number {
  const hit = new Set(view.highlightKeys ?? [])
  let y = top
  for (const [k, v] of view.entries.slice(0, 8)) {
    const isHit = hit.has(k)
    ctx.fillStyle = isHit ? '#1f3a2a' : C.cell
    roundRect(ctx, PAD, y, 260, 26, 6)
    ctx.fill()
    ctx.strokeStyle = isHit ? TONE.ok : C.line
    ctx.stroke()
    ctx.fillStyle = isHit ? TONE.ok : TONE.active
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${k} → ${v}`, PAD + 10, y + 13)
    y += 32
  }
  ctx.textAlign = 'center'
  return y
}

function drawStack(ctx: CanvasRenderingContext2D, view: Extract<View, { kind: 'stack' }>, top: number): number {
  const marks = new Map((view.marks ?? []).map((m) => [m.index, m.tone]))
  let y = top
  const items = view.items.slice(-8)
  for (let i = items.length - 1; i >= 0; i--) {
    const idx = view.items.length - items.length + i
    const tone = marks.get(idx)
    ctx.fillStyle = tone ? TONE[tone] : C.cell
    roundRect(ctx, PAD, y, 90, 24, 5)
    ctx.fill()
    ctx.fillStyle = tone ? C.black : C.ink
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(items[i] ?? ''), PAD + 45, y + 12)
    y += 28
  }
  return y
}

function drawMatrix(
  ctx: CanvasRenderingContext2D,
  rowsData: (string | number | null)[][],
  top: number,
): number {
  const cell = 22
  const rows = rowsData.length
  const cols = Math.max(...rowsData.map((r) => r.length), 0)
  const rMax = Math.min(rows, 10)
  const cMax = Math.min(cols, Math.floor((W - PAD * 2) / cell))
  for (let r = 0; r < rMax; r++) {
    for (let c = 0; c < cMax; c++) {
      ctx.fillStyle = C.cellDim
      ctx.fillRect(PAD + c * cell, top + r * cell, cell - 1, cell - 1)
      ctx.fillStyle = C.ink
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const val = rowsData[r]?.[c]
      ctx.fillText(val === null || val === undefined ? '·' : String(val).slice(0, 3), PAD + c * cell + cell / 2, top + r * cell + cell / 2)
    }
  }
  return top + rMax * cell + 8
}

function drawFrame(ctx: CanvasRenderingContext2D, frame: Frame): void {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  let y = PAD + 8
  const entries = Object.entries(frame.views).slice(0, 2)
  for (const [name, view] of entries) {
    ctx.fillStyle = C.sub
    ctx.font = '11px monospace'
    ctx.fillText(name, PAD, y)
    y += 18
    if (view.kind === 'array') y = drawArray(ctx, view, y)
    else if (view.kind === 'hashmap') y = drawHashmap(ctx, view, y)
    else if (view.kind === 'stack') y = drawStack(ctx, view, y)
    else if (view.kind === 'matrix') y = drawMatrix(ctx, view.values, y)
    else if (view.kind === 'grid') y = drawMatrix(ctx, view.cells, y)
    else {
      ctx.fillStyle = C.cell
      roundRect(ctx, PAD, y, 280, 40, 8)
      ctx.fill()
      ctx.fillStyle = C.sub
      ctx.font = '12px monospace'
      ctx.fillText(`（${view.kind} 视图，详见应用内动画）`, PAD + 10, y + 24)
      y += 52
    }
    y += 10
    if (y > H - 120) break
  }

  // 讲解（底部，最多 3 行）
  const lines = wrap(ctx, frame.msg || '', W - PAD * 2, 3)
  let ty = H - PAD - lines.length * 20
  ctx.fillStyle = C.ink
  ctx.font = '13px monospace'
  ctx.textAlign = 'left'
  for (const line of lines) {
    ctx.fillText(line, PAD, ty)
    ty += 20
  }
}

/** 把一道题的某个用例帧序列导出为 GIF Blob */
export function exportCaseToGif(algoCase: AlgorithmCase, testIdx: number, delayMs = 600): Blob {
  const frames = algoCase.framesByTest[testIdx] ?? []
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建绘图上下文')

  const rgbaFrames: RgbaFrame[] = []
  const stride = Math.max(1, Math.ceil(frames.length / 48))
  for (let i = 0; i < frames.length; i += stride) {
    const frame = frames[i]
    if (!frame) continue
    drawFrame(ctx, frame)
    const img = ctx.getImageData(0, 0, W, H)
    rgbaFrames.push({ data: img.data, width: W, height: H })
  }
  if (rgbaFrames.length === 0) throw new Error('没有可导出的帧')
  const bytes = encodeGifFromRgba(rgbaFrames, delayMs)
  return new Blob([bytes], { type: 'image/gif' })
}

/** 触发浏览器下载 */
export function downloadGif(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}