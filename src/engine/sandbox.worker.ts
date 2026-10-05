/**
 * Web Worker 沙箱入口：执行插桩代码，避免阻塞 UI。
 * 安全兜底由主线程负责（超时 terminate）；这里只做转发。
 */
import { runInstrumented, type WorkerRequest, type WorkerResponse } from './protocol'

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const response: WorkerResponse = { result: runInstrumented(e.data) }
  self.postMessage(response)
}
