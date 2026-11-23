/**
 * 语法高亮 tokenizer 与括号匹配（纯逻辑）。
 */
import { describe, expect, it } from 'vitest'
import { bracketMatch, tokenize } from '../src/components/highlight'

function clsOf(line: string, text: string): string | undefined {
  return tokenize(line).find((t) => t.text === text)?.cls
}

describe('tokenize', () => {
  it('关键字 / 字符串 / 数字 / 函数名 / 注释 分类', () => {
    expect(clsOf('const x = 1', 'const')).toBe('tok-kw')
    expect(clsOf("const s = 'hi'", "'hi'" )).toBe('tok-str')
    expect(clsOf('let n = 42', '42')).toBe('tok-num')
    expect(clsOf('foo(1)', 'foo')).toBe('tok-fn')
    expect(clsOf('// note', '// note')).toBe('tok-cmt')
  })

  it('普通标识符不分类，拼接后保持原文', () => {
    const line = 'const total = a + b'
    const joined = tokenize(line).map((t) => t.text).join('')
    expect(joined).toBe(line)
    expect(clsOf(line, 'total')).toBeUndefined()
  })
})

describe('bracketMatch', () => {
  it('匹配圆括号 / 方括号 / 花括号', () => {
    expect(bracketMatch('f(a)', 1)).toEqual([1, 3]) // 光标在 ( 后
    expect(bracketMatch('[1, 2]', 0)).toEqual([0, 5])
    const code = 'function f() { return 1 }'
    const open = code.indexOf('{')
    const close = code.indexOf('}')
    expect(bracketMatch(code, open + 1)).toEqual([open, close])
  })

  it('嵌套匹配正确', () => {
    const code = 'a(b(c)d)e'
    const inner = code.indexOf('(') + 1
    expect(bracketMatch(code, inner)).toEqual([1, 7])
  })

  it('非括号位置返回 null', () => {
    expect(bracketMatch('abc', 1)).toBeNull()
  })
})