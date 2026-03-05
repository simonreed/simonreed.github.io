'use client'

import { useEffect } from 'react'
import type { Flow, FlowResponse } from '@/lib/types'
import FlowList from '@/components/FlowList'

interface Props {
  flows: Flow[]
  responses: Record<string, FlowResponse>
  notInScope: string[]
  onChange: (id: string, response: FlowResponse) => void
  onAdvance: () => void
}

export default function FlowsStep({ flows, responses, notInScope, onChange, onAdvance }: Props) {
  const reviewed = flows.filter((f) => responses[f.id]?.status !== 'unreviewed').length
  const allReviewed = reviewed === flows.length

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && allReviewed && document.activeElement?.tagName !== 'TEXTAREA') onAdvance()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [allReviewed, onAdvance])

  return (
    <div className="py-10">
      <p className="text-xs text-zinc-400 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
        Flows
      </p>
      <h2
        className="text-3xl text-zinc-900 mb-2 font-light leading-snug"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
      >
        Review each flow
      </h2>
      <p className="text-base text-zinc-500 mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
        These are the flows we will build. Confirm each one, or leave a note if you have questions.
      </p>

      <FlowList flows={flows} responses={responses} onChange={onChange} />

      {notInScope.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-medium text-zinc-400 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Not included in this phase</p>
          <ul className="flex flex-col gap-1">
            {notInScope.map((item, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="shrink-0">—</span><span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-5">
        <button
          onClick={onAdvance}
          disabled={!allReviewed}
          className="flex items-center gap-3 bg-zinc-900 text-white px-7 py-3.5 rounded-2xl hover:bg-zinc-700 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
        >
          Continue to sign off
          {allReviewed && <span className="text-zinc-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>↵</span>}
        </button>
        <span className="text-sm text-zinc-400 tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
          {reviewed} / {flows.length}
        </span>
      </div>
    </div>
  )
}
