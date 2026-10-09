/**
 * 首页：内置样题入口（搜索 + 分类/难度筛选） + 自定义生成表单。
 */
import { useMemo, useState } from 'react'
import { SAMPLES, type Sample } from '../samples'
import type { GenerateInput } from '../llm/client'

interface Props {
  loading: boolean
  generating: boolean
  error: string | null
  onOpenSample: (sample: Sample) => void
  onGenerate: (input: GenerateInput) => void
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'other', label: '其他（自动判断）' },
]

const INPUT_CLS =
  'w-full resize-y rounded-xl border border-white/10 bg-bg/60 px-3 py-2 text-sm ' +
  'placeholder:text-sub/50 transition-colors focus:border-accent/50 focus:outline-none'

/** Hot 100 十七类（与样题 category 取值一致） */
const CATEGORIES = [
  '全部',
  '哈希',
  '双指针',
  '滑动窗口',
  '子串',
  '普通数组',
  '矩阵',
  '链表',
  '二叉树',
  '图论',
  '回溯',
  '二分查找',
  '栈',
  '堆',
  '贪心',
  '动态规划',
  '多维动态规划',
  '技巧',
]

const DIFFICULTIES = ['全部', '简单', '中等', '困难']

/** 难度徽章配色（复用主题语义色 ok/warn/danger） */
const DIFF_STYLE: Record<string, string> = {
  简单: 'border-ok/40 bg-ok/10 text-ok',
  中等: 'border-warn/40 bg-warn/10 text-warn',
  困难: 'border-danger/40 bg-danger/10 text-danger',
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] transition-colors ${
        active
          ? 'border-accent/60 bg-accent/15 text-accent'
          : 'border-white/10 text-sub hover:border-white/25 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function HomeScreen({ loading, generating, error, onOpenSample, onGenerate }: Props) {
  const [problem, setProblem] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [difficulty, setDifficulty] = useState('全部')

  const busy = loading || generating
  const canSubmit = code.trim().length > 0 && !busy

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SAMPLES.filter(
      (s) =>
        (category === '全部' || s.category === category) &&
        (difficulty === '全部' || s.difficulty === difficulty) &&
        (q === '' || (s.title + ' ' + s.result.summary).toLowerCase().includes(q)),
    )
  }, [query, category, difficulty])

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-6 py-10">
        <div className="animate-fadeIn">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            AlgoMotion
            <span className="ml-2 text-base font-normal text-sub">把题解变成可播放的动画</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-sub">
            解法在真实沙箱里执行，每一步状态被拍成快照帧——播放、单步、拖拽进度条，
            亲眼看算法执行到底发生了什么。
          </p>
        </div>

        {/* 内置样题 */}
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="font-mono text-xs tracking-wide text-sub">内置体验</span>
            <span className="font-mono text-[11px] text-sub">
              Hot 100 · 共 {filtered.length} 道
            </span>
          </div>

          {/* 搜索 + 筛选 */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索题号 / 标题 / 关键词，如：接雨水、滑动窗口、二叉树"
            aria-label="搜索题目"
            className={`${INPUT_CLS} !resize-none`}
          />
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="mb-3 mt-1.5 flex gap-1.5">
            {DIFFICULTIES.map((d) => (
              <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                {d}
              </Chip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-surface p-6 text-center text-sm text-sub">
              没有匹配的题目——换个关键词或筛选条件试试
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  disabled={busy}
                  onClick={() => onOpenSample(sample)}
                  className="group rounded-2xl border border-white/10 bg-surface p-4 text-left transition-all hover:border-accent/40 hover:bg-surface-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium">{sample.title}</div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] ${DIFF_STYLE[sample.difficulty] ?? ''}`}
                    >
                      {sample.difficulty}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs leading-relaxed text-sub">{sample.result.summary}</div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-accent">点击播放动画 →</span>
                    <span className="text-sub/70">{sample.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 自定义生成 */}
        <div className="mt-8">
          <div className="mb-3 font-mono text-xs tracking-wide text-sub">生成你的动画</div>
          <div className="rounded-2xl border border-white/10 bg-surface p-4 md:p-5">
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              placeholder="粘贴题目描述（可选；给出描述能让讲解更准确）"
              className={INPUT_CLS}
            />
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={7}
              spellCheck={false}
              placeholder={'粘贴你的解法代码（支持 JavaScript / Python / Java）\n\n例：\nfunction twoSum(nums, target) {\n  const seen = new Map();\n  ...\n}'}
              className={`${INPUT_CLS} mt-3 font-mono text-[12.5px] leading-relaxed`}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="解法语言"
                className="rounded-lg border border-white/10 bg-bg/60 px-2.5 py-2 text-xs text-sub transition-colors focus:border-accent/50 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => onGenerate({ problem, code, language })}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
              >
                {generating ? '正在生成插桩代码…' : '生成动画'}
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-sub/80">
              流程：模型翻译并插桩 → 沙箱执行 + 测试用例校验 → 产出帧序列，通常需要 10~60 秒
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
