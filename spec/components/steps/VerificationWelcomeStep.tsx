'use client'

import { useEffect } from 'react'
import type { Spec } from '@/lib/types'

interface Props {
  spec: Spec
  hasResume: boolean
  storageUnavailable: boolean
  onBegin: () => void
  onContinue: () => void
}

export default function VerificationWelcomeStep({
  spec,
  hasResume,
  storageUnavailable,
  onBegin,
  onContinue,
}: Props) {
  const round = spec.verification_round ?? 1

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') hasResume ? onContinue() : onBegin()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hasResume, onBegin, onContinue])

  return (
    <div className="py-12">
      <div className="flex items-center gap-2 mb-10">
        <span className="text-xs bg-blue-50 text-blue-700 ring-1 ring-blue-200 px-2.5 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)' }}>
          Verification{round > 1 ? ` · Round ${round}` : ''}
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

      <div className="text-xl text-zinc-600 leading-relaxed mb-10 space-y-4" style={{ fontFamily: 'var(--font-serif)' }}>
        {spec.summary.split('\n\n').map((para, i) => (
          <p key={i}>{para.replace(/\n/g, ' ')}</p>
        ))}
      </div>

      {storageUnavailable && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700" style={{ fontFamily: 'var(--font-serif)' }}>
          Your progress won&apos;t be saved between sessions. Try to complete in one go.
        </div>
      )}

      {hasResume && (
        <div className="mb-6 bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4" style={{ fontFamily: 'var(--font-serif)' }}>
          <p className="text-sm text-zinc-600 mb-3">You have saved progress — continue where you left off</p>
          <div className="flex gap-3">
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-3 bg-zinc-900 text-white px-6 py-3 rounded-xl hover:bg-zinc-700 transition-colors text-sm"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Continue where you left off
              <span className="text-zinc-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>↵</span>
            </button>
            <button
              onClick={onBegin}
              className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors px-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      {!hasResume && (
        <button
          onClick={onBegin}
          className="inline-flex items-center gap-3 bg-zinc-900 text-white px-7 py-3.5 rounded-2xl hover:bg-zinc-700 transition-colors"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
        >
          Begin verification
          <span className="text-zinc-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>↵</span>
        </button>
      )}
    </div>
  )
}
