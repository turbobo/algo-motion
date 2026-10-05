/**
 * 哈希表视图渲染器：键 → 值 行列表，支持命中高亮。
 * 新条目 popIn；高亮行切换做 CSS transition。
 */
import type { HashmapView as HashmapViewModel } from '../../types'
import { TONE_STYLES, ViewTitle } from './tones'

interface Props {
  view: HashmapViewModel
}

const HIT = TONE_STYLES.ok

export function HashmapView({ view }: Props) {
  const highlighted = new Set(view.highlightKeys ?? [])

  return (
    <div>
      {view.title ? <ViewTitle text={view.title} /> : null}
      {view.entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-3 py-2 font-mono text-xs text-sub">
          （空表）
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {view.entries.map(([key, value]) => {
            const isHit = highlighted.has(key)
            return (
              <div
                key={key}
                className="flex animate-popIn items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-all duration-300"
                style={{
                  borderColor: isHit ? HIT.border : 'rgba(255,255,255,0.1)',
                  background: isHit ? HIT.bg : 'rgba(255,255,255,0.03)',
                  boxShadow: isHit ? `0 0 12px ${HIT.glow}` : 'none',
                }}
              >
                <span className={isHit ? 'text-ok' : 'text-accent'}>{key}</span>
                <span className="text-sub">→</span>
                <span className={isHit ? 'text-ok' : 'text-ink'}>{value}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
