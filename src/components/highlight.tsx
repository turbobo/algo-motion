/**
 * 轻量语法高亮（无依赖）：按行把 JS 代码切成 token，供代码面板与编辑器叠加层复用。
 * 仅做展示，不解析语义；括号匹配为轻量扫描（不进入字符串/注释）。
 */
import type { ReactNode } from 'react'

const RE =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|while|do|break|continue|new|class|extends|switch|case|default|typeof|instanceof|in|of|this|null|undefined|true|false|async|await|try|catch|finally|throw)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()/g

export interface Token {
  text: string
  cls: string
}

export function tokenize(line: string): Token[] {
  const out: Token[] = []
  let last = 0
  RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = RE.exec(line))) {
    if (m.index > last) out.push({ text: line.slice(last, m.index), cls: '' })
    const cls = m[1] ? 'tok-cmt' : m[2] ? 'tok-str' : m[3] ? 'tok-kw' : m[4] ? 'tok-num' : m[5] ? 'tok-fn' : ''
    out.push({ text: m[0], cls })
    last = m.index + m[0].length
  }
  if (last < line.length) out.push({ text: line.slice(last), cls: '' })
  return out
}

export function renderTokens(line: string): ReactNode {
  return tokenize(line).map((t, i) =>
    t.cls ? (
      <span key={i} className={t.cls}>
        {t.text}
      </span>
    ) : (
      <span key={i}>{t.text}</span>
    ),
  )
}

/** 带高亮标记（括号匹配）的渲染：marks 为绝对字符下标集合 */
export function renderTokensMarked(
  line: string,
  lineStart: number,
  marks?: ReadonlySet<number> | null,
): ReactNode {
  if (!marks || marks.size === 0) return renderTokens(line)
  const tokens = tokenize(line)
  const out: ReactNode[] = []
  let off = lineStart
  let key = 0
  for (const t of tokens) {
    const text = t.text
    let i = 0
    while (i < text.length) {
      if (marks.has(off + i)) {
        out.push(
          <span key={key++} className={`${t.cls} rounded bg-accent/45`.trim()}>
            {text[i]}
          </span>,
        )
        i++
      } else {
        let j = i + 1
        while (j < text.length && !marks.has(off + j)) j++
        out.push(
          <span key={key++} className={t.cls || undefined}>
            {text.slice(i, j)}
          </span>,
        )
        i = j
      }
    }
    off += text.length
  }
  return out
}

const OPEN = '([{'
const CLOSE = ')]}'
const PAIR: Record<string, string> = { '(': ')', '[': ']', '{': '}', ')': '(', ']': '[', '}': '{' }

/** 光标邻接括号时，返回匹配的另一半的绝对下标（无则 null） */
export function bracketMatch(code: string, pos: number): [number, number] | null {
  for (const at of [pos, pos - 1]) {
    if (at < 0 || at >= code.length) continue
    const ch = code[at]
    if (!ch || !(OPEN.includes(ch) || CLOSE.includes(ch))) continue
    const match = scanMatch(code, at, ch)
    if (match >= 0) return at < match ? [at, match] : [match, at]
  }
  return null
}

function scanMatch(code: string, at: number, ch: string): number {
  const forward = OPEN.includes(ch)
  const target = PAIR[ch]
  if (!target) return -1
  let depth = 0
  let i = at
  while (i >= 0 && i < code.length) {
    const c = code[i]
    if (c === ch) depth++
    else if (c === target) {
      depth--
      if (depth === 0) return i
    }
    i += forward ? 1 : -1
  }
  return -1
}