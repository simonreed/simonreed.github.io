import type { Spec } from '@/lib/types'

const statusLabel: Record<string, { text: string; classes: string }> = {
  'awaiting-sign-off': { text: 'Awaiting sign-off', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  'signed-off': { text: 'Signed off', classes: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  draft: { text: 'Draft', classes: 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200' },
}

export default function SpecHeader({ spec }: { spec: Spec }) {
  const badge = statusLabel[spec.status] ?? statusLabel['draft']

  return (
    <div className="border-b border-zinc-100 pb-8 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.classes}`}>{badge.text}</span>
        <span className="text-xs text-zinc-400">v{spec.version} · {spec.date}</span>
      </div>
      <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-2">{spec.title}</h1>
      <p className="text-sm text-zinc-500">Prepared for {spec.client}</p>
      <p className="mt-4 text-zinc-600 leading-relaxed whitespace-pre-line text-sm">{spec.summary}</p>
    </div>
  )
}
