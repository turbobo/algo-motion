/**
 * 帧舞台：渲染当前帧的全部视图快照。
 * 视图容器用 key=视图id 保持稳定，内部元素由各渲染器自行做 diff 过渡。
 */
import type { Frame } from '../../types'
import { ViewRenderer } from '../renderers/ViewRenderer'

interface Props {
  frame: Frame | null
}

export function StageView({ frame }: Props) {
  if (!frame) {
    return <div className="flex h-full items-center justify-center text-sm text-sub">暂无帧</div>
  }
  const views = Object.entries(frame.views)
  if (views.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-sub">该帧没有视图数据</div>
  }
  return (
    <div className="flex flex-col gap-4">
      {views.map(([id, view]) => (
        <section key={id} className="rounded-2xl border border-white/8 bg-surface p-3 md:p-4">
          <ViewRenderer view={view} />
        </section>
      ))}
    </div>
  )
}
