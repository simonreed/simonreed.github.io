'use client'

interface Props {
  reviewed: number
  total: number
}

export default function ProgressBar({ reviewed, total }: Props) {
  const pct = total === 0 ? 100 : Math.round((reviewed / total) * 100)

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-zinc-100 py-3 mb-8">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-500">{reviewed} of {total} items reviewed</span>
        <span className="text-xs font-medium text-zinc-700">{pct}%</span>
      </div>
      <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-zinc-900 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
