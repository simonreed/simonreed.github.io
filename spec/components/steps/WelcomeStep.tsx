'use client'

import { useEffect } from 'react'
import type { Spec } from '@/lib/types'

interface Props {
  spec: Spec
  onBegin: () => void
}

export default function WelcomeStep({ spec, onBegin }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter') onBegin() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBegin])

  return (
    <div className="py-12">
      <div className="flex items-center gap-2 mb-10">
        <span className="text-xs bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2.5 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)' }}>
          Awaiting sign-off
        </span>
        <span className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-mono)' }}>v{spec.version} · {spec.date}</span>
      </div>

      <h1
        className="text-4xl leading-tight text-zinc-900 mb-3 font-light"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
      >
        {spec.title}
      </h1>

      <p className="text-sm text-zinc-400 mb-8" style={{ fontFamily: 'var(--font-mono)' }}>
        Prepared for {spec.client}
      </p>

      <p
        className="text-xl text-zinc-600 leading-relaxed mb-12"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {spec.summary}
      </p>

      <div className="flex items-center gap-6">
        <button
          onClick={onBegin}
          className="inline-flex items-center gap-3 bg-zinc-900 text-white px-7 py-3.5 rounded-2xl hover:bg-zinc-700 transition-colors"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
        >
          Begin review
          <span className="text-zinc-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>↵</span>
        </button>
        <span className="text-sm text-zinc-400" style={{ fontFamily: 'var(--font-mono)' }}>
          {spec.assumptions.length} assumptions · {spec.questions.length} questions
        </span>
      </div>
    </div>
  )
}
