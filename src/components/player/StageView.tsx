/**
 * 帧舞台：渲染当前帧的全部视图快照。
 * 视图容器用 key=视图id 保持稳定，内部元素由各渲染器自行做 diff 过渡；
 * flash 传入本帧变化元素集（frameDiff 产出），让「这一帧变了什么」脉冲高亮。
 */
import type { Frame } from '../../types'
import type { FrameFlash } from '../renderers/frameDiff'
import { ViewRenderer } from '../renderers/ViewRenderer'

interface Props {
  frame: Frame | null
  /** 视图名 → 变化元素标识集；无前帧/切片重置时为空（不闪） */
  flash?: FrameFlash
  /** 当前帧序号：连续变化的元素借此重新挂载以重播脉冲 */
  frameKey?: number
}

export function StageView({ frame, flash, frameKey }: Props) {
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
          <ViewRenderer view={view} flash={flash?.[id]} frameKey={frameKey} />
        </section>
      ))}
    </div>
  )
}
