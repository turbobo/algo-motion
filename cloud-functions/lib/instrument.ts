/**
 * LLM 插桩核心（dev 代理与 EdgeOne 云函数共用，运行在 Node 侧）
 *
 * 流程：题目 + 解法 → DashScope(qwen-plus) → JSON 产物（cleanCode / instrumentedCode / tests 内联）
 * 失败重试：解析或形状校验失败时，把错误反馈给模型再试一次。
 */

const DASHSCOPE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const MODEL = 'qwen-plus'
/** 插桩产物较长，给足时间 */
const TIMEOUT_MS = 120_000
const MAX_INPUT_CHARS = 8000

export class InstrumentError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface InstrumentRequest {
  problem: string
  code: string
  language?: string
}

export interface InstrumentOutput {
  fnName: string
  summary: string
  /** 干净解法（展示用）；模型未给出时为空字符串，由前端剥离兜底 */
  cleanCode: string
  /** 插桩版代码（执行用） */
  instrumentedCode: string
}

type Role = 'system' | 'user' | 'assistant'
interface Message {
  role: Role
  content: string
}

const SYSTEM_PROMPT = `你是算法教学动画的插桩引擎，服务于一个「把题解变成逐帧动画」的播放器。

用户会给你一道算法题和一份解法代码（语言可能是 JavaScript / Python / Java）。你要把它改造成一份「带录制钩子的 JavaScript 脚本」，播放器会执行它并回放每一步的状态。

## 输出格式（严格遵守）
只输出一个 JSON 对象，不要输出任何其他文字，不要用 markdown 代码块包裹。结构：
{
  "fnName": "入口函数名（字符串）",
  "summary": "一句话概括解法思路，不超过 30 字",
  "cleanCode": "干净的 JavaScript 解法（观众看到的代码，不含任何 __rec）",
  "instrumentedCode": "插桩版 JavaScript 代码（实际执行的代码，含 __rec.step 与 __rec.tests）"
}

## cleanCode 规则
1. 若输入不是 JavaScript，先翻译为等价的 ES2020 JavaScript（LeetCode 风格：函数定义 + return）。
2. 保持原算法的逻辑与变量命名；不要加任何注释。
3. 只包含解法本身（主函数及必需的辅助函数）；不使用 import / export / TypeScript 类型。

## instrumentedCode 规则
1. 在 cleanCode 的代码基础上插入录制与测试代码。原有代码的每一行都要原样保留（播放器按代码文本锚点定位行号），插桩只能作为新的整行插入。
2. 必须插入 __rec.step 的调用：可以跨多行书写对象字面量，但起始行必须是 __rec.step( 且该行除缩进外没有别的内容。
3. __rec.step 内禁止副作用：不能赋值或修改任何变量；快照必须从当前变量构造（引用变量时立即展开成值）。
4. 文件末尾必须调用 __rec.tests([...]) 注册恰好 3 个测试用例。
5. 代码必须是纯 JavaScript 脚本：不允许 import / export / async / await / TS 语法。可以使用 const / let / 箭头函数 / Map / Set / 模板字符串。

## __rec.step 帧协议
__rec.step({
  at: string,   // 该帧对应「干净的哪一行代码」：复制该行去掉缩进后的一个连续片段（建议 8~40 字符，包含该行最有辨识度的变量或调用）；播放器会从上一帧命中位置向后做「包含」匹配
  msg: string,  // 中文讲解，像老师讲课：说清这一帧在干什么，带上具体数值。例："i=1 时，need = 9 - 7 = 2，去哈希表里找 2"
  views: {...}, // 视图快照字典：视图名 → 视图对象（见下），每次都给完整快照
  vars: {...}   // 可选：变量面板 { 变量名: 显示值字符串 }
});

### 视图对象（三种类型）
1) 数组/序列：{ kind:'array', values:[...], marks:[{index, tone}], pointers:{标签:索引}, title }
   - values：当前数组完整值的快照（用 [...arr] 拷贝）
   - tone 取值：'active'(正在处理) / 'ok'(命中或完成) / 'warn'(注意) / 'danger'(冲突) / 'muted'(已排除)
   - pointers：指针标签（i、j、left、right、slow、fast 等）
2) 哈希表/字典：{ kind:'hashmap', entries:[[key,value],...], highlightKeys:[...], title }
   - entries 与 highlightKeys 的键值全部转成字符串（如 ['7','0']）
3) 链表：{ kind:'linkedlist', nodes:[{id,value}], next:[[fromId, toId|null],...], pointers:{标签:节点id|null}, marks:[{id,tone}], title }
   - nodes 按视觉从左到右排列；id 表示节点身份，同一个节点跨帧必须保持同一个 id（在插桩代码开头用循环给原节点编号，如 const ids = new Map()，遍历时 ids.set(p, 'n'+i)）
   - next 描述当前链的形态（反转会改变它），终点写 null
   - pointers 的值可以是 null（空指针不绘制）

## 插桩节奏（决定动画质量）
1. 总帧数控制在 10~60 帧之间。
2. 循环体每圈只记 3~4 个关键帧（关键分支、指针移动、状态写入），不要每个赋值都记。
3. 第一帧：函数入口，展示初始状态；最后一帧：函数返回，用 'ok' 色调标出答案。
4. 处理新元素/新节点时用 'active' 标出当前位置。
5. 数组元素超过 12 个时只展示活跃区间（在 title 里说明是窗口）。

## __rec.tests 规则（播放器用它校验解法并生成每种输入对应的动画）
__rec.tests([
  { label: '含输入的简短说明，如 示例1: nums=[2,7,11,15], target=9', run: function () {
      const r = 入口函数(...构造的输入);
      if (与期望不符的判断) throw new Error('期望 ...，实际 ' + JSON.stringify(r));
  } },
  // 第 2 个：题目给的另一个示例（若有）
  // 第 3 个：边界场景（空 / 单元素 / 重复值 / 已满足等）
]);
1. run 必须同步执行：通过时正常返回，失败时必须 throw Error。
2. 断言信息写清期望值与实际值。
3. 链表/树题可以在这段代码里定义 build / dump 等辅助函数（不需要出现在 cleanCode 里）。`

function buildUserPrompt(problem: string, code: string, language?: string): string {
  return [
    '题目描述：',
    problem.trim() || '（未提供题目描述，请从代码推断题意）',
    '',
    `解法代码（原语言：${language?.trim() || '未指定，请自行判断'}）：`,
    code.trim(),
    '',
    '请按系统提示的要求，只输出一个 JSON 对象。',
  ].join('\n')
}

async function callModel(apiKey: string, messages: Message[]): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(DASHSCOPE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new InstrumentError(502, `模型调用失败（HTTP ${res.status}）：${text.slice(0, 200)}`)
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string' || !content.trim()) {
      throw new InstrumentError(502, '模型返回内容为空')
    }
    return content
  } catch (e) {
    if (e instanceof InstrumentError) throw e
    if (e instanceof Error && e.name === 'AbortError') {
      throw new InstrumentError(504, `模型调用超时（> ${TIMEOUT_MS / 1000}s）`)
    }
    throw new InstrumentError(502, `模型调用失败：${e instanceof Error ? e.message : String(e)}`)
  } finally {
    clearTimeout(timer)
  }
}

/** 解析模型输出（容忍 markdown 围栏与前后杂文本），导出供测试 */
export function parseModelOutput(content: string): Record<string, unknown> {
  let text = content.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence?.[1]) text = fence[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new InstrumentError(502, '模型输出不是合法 JSON（找不到 JSON 对象）')
  }
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('不是对象')
    }
    return parsed as Record<string, unknown>
  } catch {
    throw new InstrumentError(502, '模型输出不是合法 JSON')
  }
}

/** 校验并挑出必要字段（导出供测试） */
export function pickOutput(raw: Record<string, unknown>): InstrumentOutput {
  const fnName = typeof raw.fnName === 'string' ? raw.fnName.trim() : ''
  if (!/^[A-Za-z_$][\w$]*$/.test(fnName)) {
    throw new InstrumentError(502, '模型输出缺少合法的入口函数名')
  }
  const instrumentedCode = typeof raw.instrumentedCode === 'string' ? raw.instrumentedCode : ''
  if (!instrumentedCode.includes('__rec.step(')) {
    throw new InstrumentError(502, '模型输出缺少 __rec.step 插桩代码')
  }
  if (!instrumentedCode.includes('__rec.tests(')) {
    throw new InstrumentError(502, '模型输出缺少 __rec.tests 测试注册')
  }
  const rawClean = typeof raw.cleanCode === 'string' ? raw.cleanCode.trim() : ''
  const cleanCode = rawClean && !rawClean.includes('__rec.') ? rawClean : ''
  const summary = typeof raw.summary === 'string' ? raw.summary.trim().slice(0, 60) : ''
  return { fnName, summary, cleanCode, instrumentedCode }
}

export async function instrumentSolution(
  apiKey: string | undefined,
  req: InstrumentRequest,
): Promise<InstrumentOutput> {
  if (!apiKey) {
    throw new InstrumentError(500, '服务端未配置 DASHSCOPE_API_KEY 环境变量')
  }
  const problem = (req.problem ?? '').trim()
  const code = (req.code ?? '').trim()
  if (!code) throw new InstrumentError(400, '缺少解法代码')
  if (code.length > MAX_INPUT_CHARS) throw new InstrumentError(400, `代码过长（上限 ${MAX_INPUT_CHARS} 字符）`)
  if (problem.length > MAX_INPUT_CHARS) {
    throw new InstrumentError(400, `题目描述过长（上限 ${MAX_INPUT_CHARS} 字符）`)
  }

  const messages: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(problem, code, req.language) },
  ]

  let lastError: unknown = null
  for (let attempt = 0; attempt < 2; attempt++) {
    const content = await callModel(apiKey, messages)
    try {
      return pickOutput(parseModelOutput(content))
    } catch (e) {
      lastError = e
      messages.push({
        role: 'user',
        content: `你上一次的输出不合格：${e instanceof Error ? e.message : String(e)}。请重新完整输出一次，确保是可直接 JSON.parse 的单个 JSON 对象（所有字段齐全，instrumentedCode 含 __rec.step 与 __rec.tests）。`,
      })
    }
  }
  throw lastError instanceof InstrumentError
    ? lastError
    : new InstrumentError(502, '模型连续两次输出不合格，请重试')
}
