'use client'

import type { Spec } from '@/lib/types'

interface Props {
  spec: Spec
  isOpen: boolean
  onToggle: () => void
}

export default function SpecReferencePanel({ spec, isOpen, onToggle }: Props) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span>What we agreed</span>
        <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ↕
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 space-y-6">
          {spec.summary && (
            <div>
              <p className="text-xs text-zinc-400 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Summary</p>
              <div className="text-sm text-zinc-600 space-y-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {spec.summary.split('\n\n').map((para, i) => (
                  <p key={i}>{para.replace(/\n/g, ' ')}</p>
                ))}
              </div>
            </div>
          )}

          {spec.assumptions && spec.assumptions.length > 0 && (
            <div>
              <p className="text-xs text-zinc-400 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Assumptions</p>
              <ul className="space-y-1.5">
                {spec.assumptions.map((a) => (
                  <li key={a.id} className="text-sm text-zinc-600 flex gap-2" style={{ fontFamily: 'var(--font-serif)' }}>
                    <span className="text-zinc-300 shrink-0 mt-0.5 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{a.id}</span>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {spec.flows && spec.flows.length > 0 && (
            <div>
              <p className="text-xs text-zinc-400 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Flows</p>
              <ul className="space-y-3">
                {spec.flows.map((f) => (
                  <li key={f.id}>
                    <p className="text-sm font-medium text-zinc-700" style={{ fontFamily: 'var(--font-serif)' }}>{f.title}</p>
                    <ol className="mt-1 space-y-0.5 list-decimal list-inside">
                      {f.steps.map((step, i) => (
                        <li key={i} className="text-xs text-zinc-500" style={{ fontFamily: 'var(--font-serif)' }}>{step}</li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
