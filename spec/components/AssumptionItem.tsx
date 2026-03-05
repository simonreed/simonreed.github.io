'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Assumption, AssumptionResponse } from '@/lib/types'

interface Props {
  assumption: Assumption
  response: AssumptionResponse
  highlight?: boolean
  onChange: (id: string, response: AssumptionResponse) => void
}

export default function AssumptionItem({ assumption, response, highlight, onChange }: Props) {
  const [localComment, setLocalComment] = useState(response.comment)
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const isConfirmed = response.status === 'confirmed'
  const isFlagged = response.status === 'flagged'
  const isReviewed = isConfirmed || isFlagged

  useEffect(() => { setLocalComment(response.comment) }, [response.comment])
  useEffect(() => { if (isFlagged) commentRef.current?.focus() }, [isFlagged])

  const handleComment = (val: string) => {
    setLocalComment(val)
    onChange(assumption.id, { status: 'flagged', comment: val })
  }

  // Confirmed — collapsed single row
  if (isConfirmed) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 py-2.5 px-1 border-b border-zinc-100 group"
      >
        <span className="text-xs font-mono text-zinc-300 w-7 shrink-0">{assumption.id}</span>
        <p className="flex-1 text-sm text-zinc-400 truncate leading-relaxed" style={{ fontFamily: 'var(--font-serif)' }}>
          {assumption.text}
        </p>
        <button
          onClick={() => onChange(assumption.id, { status: 'unreviewed', comment: '' })}
          className="shrink-0 flex items-center gap-1 text-green-600 opacity-60 hover:opacity-100 transition-opacity text-xs"
          title="Undo"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1"/>
            <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">Undo</span>
        </button>
      </motion.div>
    )
  }

  // Flagged or unreviewed — full card
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-6 py-5 transition-colors ${
        highlight
          ? 'border-amber-300 bg-amber-50'
          : isFlagged
          ? 'border-amber-200 bg-amber-50/60'
          : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex gap-3 items-baseline mb-5">
        <span className="text-xs font-mono text-zinc-300 shrink-0 mt-1">{assumption.id}</span>
        <p
          className="text-xl leading-relaxed text-zinc-900"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {assumption.text}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChange(assumption.id, { status: 'confirmed', comment: '' })}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7l3.5 3.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Confirm
        </button>
        <button
          onClick={() => onChange(assumption.id, { status: isFlagged ? 'unreviewed' : 'flagged', comment: localComment })}
          className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl transition-colors ${
            isFlagged
              ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
          }`}
        >
          <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
            <path d="M2 1.5v11M2 1.5h8l-2 3.5 2 3.5H2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Flag
        </button>
      </div>

      <AnimatePresence>
        {isFlagged && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <textarea
              ref={commentRef}
              value={localComment}
              onChange={(e) => handleComment(e.target.value)}
              placeholder="What would you like to change or clarify?"
              className="mt-4 w-full text-sm border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white resize-none"
              style={{ fontFamily: 'var(--font-serif)' }}
              rows={2}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
