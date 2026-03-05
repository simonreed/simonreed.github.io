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
      if (e.key === 'Enter' && allReviewed && document.activeElement?.tagName !== 'TEXTAREA') {
        onAdvance()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [allReviewed, onAdvance])

  return (
    <div className="py-8">
      <div className="text-xs text-zinc-400 mb-2 font-mono">Assumptions</div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-1">
        Confirm or flag each assumption
      </h2>
      <p className="text-sm text-zinc-500 mb-8">
        These are the decisions shaping how we build. Confirm ones you agree with — flag anything you want to change.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {assumptions.map((a) => (
          <AssumptionItem
            key={a.id}
            assumption={a}
            response={responses[a.id] ?? { status: 'unreviewed', comment: '' }}
            onChange={onChange}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onAdvance}
          disabled={!allReviewed}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue to questions
          {allReviewed && <span className="text-zinc-400 text-xs">↵</span>}
        </button>
        {!allReviewed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-zinc-400"
          >
            {reviewed} of {assumptions.length} reviewed
          </motion.span>
        )}
      </div>
    </div>
  )
}
