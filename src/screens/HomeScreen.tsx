/**
 * 首页：内置样题入口 + 自定义生成表单。
 */
import { useState } from 'react'
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

export function HomeScreen({ loading, generating, error, onOpenSample, onGenerate }: Props) {
  const [problem, setProblem] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  const busy = loading || generating
  const canSubmit = code.trim().length > 0 && !busy

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
          <div className="mb-3 font-mono text-xs tracking-wide text-sub">内置体验</div>
          <div className="grid gap-3 md:grid-cols-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                disabled={busy}
                onClick={() => onOpenSample(sample)}
                className="group rounded-2xl border border-white/10 bg-surface p-4 text-left transition-all hover:border-accent/40 hover:bg-surface-2 active:scale-[0.99] disabled:opacity-50"
              >
                <div className="text-sm font-medium">{sample.title}</div>
                <div className="mt-1.5 text-xs leading-relaxed text-sub">{sample.result.summary}</div>
                <div className="mt-3 font-mono text-[11px] text-accent">点击播放动画 →</div>
              </button>
            ))}
          </div>
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
