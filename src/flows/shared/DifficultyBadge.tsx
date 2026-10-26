import type { SolveProblem } from './types'
import { DIFFICULTY_STYLE } from './solve-ui'

export function DifficultyBadge({
  difficulty,
  className = '',
}: {
  difficulty: SolveProblem['difficulty']
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[10px] ${DIFFICULTY_STYLE[difficulty]} ${className}`}
    >
      {difficulty}
    </span>
  )
}
