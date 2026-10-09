import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

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
    plugins: [
      react(),
      instrumentDevProxy(env),
      /** PWA：离线可用（主包预缓存；题库 chunk 保持按需并做运行时缓存） */
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          name: 'AlgoMotion · 算法动画',
          short_name: 'AlgoMotion',
          description: '把 LeetCode 题解变成可播放的逐帧动画',
          theme_color: '#0f1419',
          background_color: '#0f1419',
          display: 'standalone',
          lang: 'zh-CN',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
          // 题库 chunk 不强制预缓存（保持首页按需加载的初衷）
          globIgnores: ['**/samples-*.js'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              // 访问过的题库 chunk 进运行时缓存：离线可回看已学过的题
              urlPattern: /\/assets\/samples-.*\.js$/,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'algomotion-samples' },
            },
          ],
        },
      }),
    ],
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          // 题库内容（含插桩代码）单独成 chunk 并固定命名前缀：
          // ① 与主包缓存解耦；② PWA 可按 "samples-*" 精确区隔预缓存与运行时缓存
          manualChunks(id: string) {
            if (id.includes('/src/samples/raw/') || id.includes('/src/samples/index.ts')) {
              return 'samples'
            }
            return undefined
          },
        },
      },
    },
    worker: { format: 'es' },
  }
})
