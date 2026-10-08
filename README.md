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

内置 67 道样题（含 Hot 100 的哈希/双指针/滑动窗口/子串/普通数组/矩阵/链表/二叉树/图论/回溯/技巧十一类全量 +
DP/网格经典题），无需 Key 即可体验全部 7 种视图动画。

## 脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 本地开发（含 /api/instrument 插桩代理） |
| `npm run check` | 4 份 tsconfig 类型检查 + Vitest 链路测试 |
| `npm run build` | 类型检查 + 构建（产物 dist/） |

## 架构一句话

`/api/instrument`（Vite 中间件本地 / EdgeOne 云函数线上，共用 `cloud-functions/lib`）
调模型（商汤日日新优先）生成带 `__rec.step` 录制调用的插桩代码 → Web Worker 沙箱执行并跑断言
→ 帧数据过清洗层归一后交给播放器渲染。详见 [技术方案文档](./技术方案文档.md) 与 [产品设计文档](./产品设计文档.md)。

## 部署（EdgeOne Pages）

- 构建命令 `npm run build`，输出目录 `dist/`
- 云函数 `/api/instrument` 需在控制台配置环境变量 `SENSENOVA_API_KEY`（或 `DASHSCOPE_API_KEY`）
- 使用自定义域名（默认域名返回 401）
- **配额保护**：该端点消耗你的模型额度，默认只允许同源调用并按客户端限流
  - `INSTRUMENT_ALLOWED_ORIGINS`：额外允许跨源调用的站点（逗号分隔），默认空
  - `INSTRUMENT_RATE_LIMIT_PER_HOUR`：每客户端每小时上限，默认 30
  - 需要硬配额请在 EdgeOne 侧叠加频次控制 / WAF（进程内计数不跨实例）
