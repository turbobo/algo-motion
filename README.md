# AlgoMotion

把题解变成可播放的动画：粘贴题目 + 解法 → LLM 插桩 → 沙箱执行 → 逐帧回放。
播放、单步、拖拽进度条，代码行同步高亮，每帧带中文讲解与变量面板。

## 快速开始

```bash
npm install
# 本地生成功能需要模型 Key（仅放本地，勿提交）；商汤日日新优先，DashScope 回退
echo "SENSENOVA_API_KEY=sk-xxx" > .env.local
npm run dev            # http://localhost:5173
```

内置 3 道样题（两数之和 / 反转链表 / 最大子数组和）无需 Key 即可体验播放链路。

## 脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 本地开发（含 /api/instrument 插桩代理） |
| `npm run check` | 4 份 tsconfig 类型检查 + Vitest 链路测试 |
| `npm run build` | 类型检查 + 构建（产物 dist/） |

## 架构一句话

`/api/instrument`（Vite 中间件本地 / EdgeOne 云函数线上，共用 `cloud-functions/lib`）
调 DashScope 生成带 `__rec.step` 录制调用的插桩代码 → Web Worker 沙箱执行并跑断言
→ 帧序列交给播放器渲染。详见 [技术方案文档](./技术方案文档.md) 与 [产品设计文档](./产品设计文档.md)。

## 部署（EdgeOne Pages）

- 构建命令 `npm run build`，输出目录 `dist/`
- 云函数 `/api/instrument` 需在控制台配置环境变量 `SENSENOVA_API_KEY`（或 `DASHSCOPE_API_KEY`）
- 使用自定义域名（默认域名返回 401）
