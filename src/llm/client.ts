/**
 * 前端生成入口：调用 /api/instrument（dev 走 Vite 代理，线上走 EdgeOne 云函数）
 * 并对模型输出做深度校验，组装成 InstrumentResult。
 */
import type { InstrumentResult } from '../types'
import { stripInstrumentLines } from '../engine/protocol'

export interface GenerateInput {
  problem: string
  code: string
  language: string
}

export class GenerateError extends Error {}

export async function generateInstrumented(input: GenerateInput): Promise<InstrumentResult> {
  let res: Response
  try {
    res = await fetch('/api/instrument', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new GenerateError('无法连接生成服务（本地开发请确认 npm run dev 已启动）')
  }

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (!res.ok) {
    const msg = data && typeof data.error === 'string' ? data.error : `生成失败（HTTP ${res.status}）`
    throw new GenerateError(msg)
  }

  const fnName = typeof data?.fnName === 'string' ? data.fnName.trim() : ''
  const instrumentedCode = typeof data?.instrumentedCode === 'string' ? data.instrumentedCode : ''
  const summary = typeof data?.summary === 'string' ? data.summary.trim() : ''
  const rawClean = typeof data?.cleanCode === 'string' ? data.cleanCode.trim() : ''

  if (!/^[A-Za-z_$][\w$]*$/.test(fnName)) throw new GenerateError('模型输出缺少合法的入口函数名，请重试')
  if (!instrumentedCode.includes('__rec.step(')) throw new GenerateError('模型输出缺少插桩代码，请重试')
  if (!instrumentedCode.includes('__rec.tests(')) throw new GenerateError('模型输出缺少测试用例，请重试')

  // 展示代码：优先采用 cleanCode；缺失或混入 __rec 时从插桩代码剥离兜底
  const displayCode =
    rawClean && !rawClean.includes('__rec.') ? rawClean : stripInstrumentLines(instrumentedCode)

  return { fnName, summary, instrumentedCode, displayCode }
}
