/**
 * 沙箱调度（主线程侧）：创建 Worker、执行、超时保护。
 * 插桩代码来自 LLM 生成，必须假设不可信：
 * - Worker 隔离全局环境
 * - 超时 terminate 防死循环
 */
import type { Frame, InstrumentResult, RunResult } from '../types'
import { resolveLineNumbers, type WorkerRequest, type WorkerResponse } from './protocol'

/** 执行超时（毫秒） */
const RUN_TIMEOUT_MS = 4000

export function runInSandbox(req: WorkerRequest): Promise<RunResult> {
  return new Promise((resolve) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('./sandbox.worker.ts', import.meta.url), { type: 'module' })
    } catch (e) {
      resolve({ ok: false, frameGroups: [], tests: [], error: `无法创建沙箱：${String(e)}` })
      return
    }
    const timer = window.setTimeout(() => {
      worker.terminate()
      resolve({
        ok: false,
        frameGroups: [],
        tests: [],
        error: `执行超时（> ${RUN_TIMEOUT_MS / 1000}s），可能存在死循环`,
      })
    }, RUN_TIMEOUT_MS)
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve(e.data.result)
    }
    worker.onerror = (e) => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve({ ok: false, frameGroups: [], tests: [], error: `沙箱错误：${e.message}` })
    }
    worker.postMessage(req)
  })
}

/** 执行插桩产物并解析帧行号（framesByTest 下标与 run.tests 对应） */
export async function executeInstrumentResult(
  result: InstrumentResult,
): Promise<{ run: RunResult; framesByTest: Frame[][] }> {
  const run = await runInSandbox({ instrumentedCode: result.instrumentedCode, fnName: result.fnName })
  const framesByTest = run.frameGroups.map((group) => resolveLineNumbers(group, result.displayCode))
  return { run, framesByTest }
}
