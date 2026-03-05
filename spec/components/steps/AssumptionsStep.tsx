'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Assumption, AssumptionResponse } from '@/lib/types'
import AssumptionItem from '@/components/AssumptionItem'

interface Props {
  assumptions: Assumption[]
  responses: Record<string, AssumptionResponse>
  onChange: (id: string, response: AssumptionResponse) => void
  onAdvance: () => void
}

export default function AssumptionsStep({ assumptions, responses, onChange, onAdvance }: Props) {
  const reviewed = assumptions.filter((a) => responses[a.id]?.status !== 'unreviewed').length
  const allReviewed = reviewed === assumptions.length

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
        Assumptions
      </p>
      <h2
        className="text-3xl text-zinc-900 mb-2 font-light leading-snug"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
      >
        Confirm or flag each assumption
      </h2>
      <p className="text-base text-zinc-500 mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
        These are the decisions shaping how we build. Confirm ones you agree with — flag anything you want to change.
      </p>

      <motion.div className="flex flex-col gap-3 mb-10" layout>
        {assumptions.map((a) => (
          <AssumptionItem
            key={a.id}
            assumption={a}
            response={responses[a.id] ?? { status: 'unreviewed', comment: '' }}
            onChange={onChange}
          />
        ))}
      </motion.div>

      <div className="flex items-center gap-5">
        <button
          onClick={onAdvance}
          disabled={!allReviewed}
          className="flex items-center gap-3 bg-zinc-900 text-white px-7 py-3.5 rounded-2xl hover:bg-zinc-700 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
        >
          Continue to questions
          {allReviewed && <span className="text-zinc-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>↵</span>}
        </button>
        <span className="text-sm text-zinc-400 tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
          {reviewed} / {assumptions.length}
        </span>
      </div>
    </div>
  )
}
