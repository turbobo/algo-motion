import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 本地开发代理：/api/instrument 直连模型服务插桩（复用云函数的 lib/instrument），
 * 传入完整 env：SENSENOVA_API_KEY（商汤日日新，优先）或 DASHSCOPE_API_KEY（回退）。
 * 生产环境该路由由 EdgeOne Cloud Functions 提供，本插件仅在 `vite dev`（apply: 'serve'）生效。
 */
function instrumentDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'instrument-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/instrument', async (req, res) => {
        const send = (status: number, payload: unknown) => {
          res.statusCode = status
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(payload))
        }
        if (req.method !== 'POST') {
          send(405, { error: '仅支持 POST' })
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
            problem?: string
            code?: string
            language?: string
          }
          const mod = await import('./cloud-functions/lib/instrument')
          const result = await mod.instrumentSolution(env, {
            problem: body.problem ?? '',
            code: body.code ?? '',
            language: body.language,
          })
          send(200, result)
        } catch (err) {
          const mod = await import('./cloud-functions/lib/instrument').catch(() => null)
          if (mod && err instanceof mod.InstrumentError) {
            send(err.status, { error: err.message })
          } else {
            send(502, { error: err instanceof Error ? err.message : '插桩失败' })
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), instrumentDevProxy(env)],
    build: { target: 'es2020' },
    worker: { format: 'es' },
  }
})
