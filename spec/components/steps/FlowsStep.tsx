'use client'

import { useEffect } from 'react'
import type { Flow } from '@/lib/types'
import FlowList from '@/components/FlowList'

interface Props {
  flows: Flow[]
  notInScope: string[]
  onAdvance: () => void
}

export default function FlowsStep({ flows, notInScope, onAdvance }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onAdvance()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onAdvance])

  return (
    <div className="py-8">
      <div className="text-xs text-zinc-400 mb-6 font-mono">Review the flows</div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">How it works</h2>
      <p className="text-sm text-zinc-500 mb-8">
        These are the flows we will build. Expand any to see the sequence diagram.
        When you are happy, continue to sign off.
      </p>
      <FlowList flows={flows} />
      {notInScope.length > 0 && (
        <div className="mt-4 mb-8">
          <p className="text-xs font-medium text-zinc-400 mb-2">Not included in this phase</p>
          <ul className="flex flex-col gap-1">
            {notInScope.map((item, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="shrink-0">—</span><span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={onAdvance}
        className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-zinc-700 transition-colors"
      >
        Continue to sign off <span className="text-zinc-400 text-xs">↵</span>
      </button>
    </div>
  )
}
