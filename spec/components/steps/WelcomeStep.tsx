'use client'

import { useEffect } from 'react'
import type { Spec } from '@/lib/types'

interface Props {
  spec: Spec
  onBegin: () => void
}

export default function WelcomeStep({ spec, onBegin }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onBegin()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBegin])

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2.5 py-1 rounded-full font-medium">
          Awaiting sign-off
        </span>
        <span className="text-xs text-zinc-400">v{spec.version} · {spec.date}</span>
      </div>
      <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight leading-tight mb-3">
        {spec.title}
      </h1>
      <p className="text-sm text-zinc-500 mb-6">Prepared for {spec.client}</p>
      <p className="text-base text-zinc-600 leading-relaxed mb-10 whitespace-pre-line">
        {spec.summary}
      </p>
      <div className="text-sm text-zinc-500 mb-3">
        {spec.assumptions.length} assumptions · {spec.questions.length} questions · {spec.flows.length} flows
      </div>
      <button
        onClick={onBegin}
        className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-zinc-700 transition-colors"
      >
        Begin review
        <span className="text-zinc-400 text-xs">↵</span>
      </button>
    </div>
  )
}
