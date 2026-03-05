'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Flow, FlowResponse } from '@/lib/types'

interface Props {
  flow: Flow
  response: FlowResponse
  onChange: (id: string, response: FlowResponse) => void
}

export default function FlowItem({ flow, response, onChange }: Props) {
  const [localComment, setLocalComment] = useState(response.comment)
  const [expanded, setExpanded] = useState(false)
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const isConfirmed = response.status === 'confirmed'
  const isNoted = response.status === 'noted'

  useEffect(() => { setLocalComment(response.comment) }, [response.comment])
  useEffect(() => { if (isNoted) commentRef.current?.focus() }, [isNoted])

  const handleComment = (val: string) => {
    setLocalComment(val)
    onChange(flow.id, { status: 'noted', comment: val })
  }

  if (isConfirmed) {
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 py-2.5 px-1 border-b border-zinc-100 group text-left"
        >
          <span className="text-xs font-mono text-zinc-300 w-14 shrink-0">{flow.id}</span>
          <p className={`flex-1 text-sm text-zinc-400 leading-relaxed ${expanded ? '' : 'truncate'}`} style={{ fontFamily: 'var(--font-serif)' }}>
            {flow.title}
          </p>
          <div className="shrink-0 flex items-center gap-1 text-green-600 opacity-60 group-hover:opacity-100 transition-opacity text-xs">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-1 py-3 flex items-center justify-between gap-4">
                <p className="text-base text-zinc-500 leading-relaxed" style={{ fontFamily: 'var(--font-serif)' }}>
                  {flow.title}
                </p>
                <button
                  onClick={() => onChange(flow.id, { status: 'unreviewed', comment: '' })}
                  className="shrink-0 text-xs text-zinc-400 hover:text-zinc-600 transition-colors underline underline-offset-2"
                >
                  Undo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-6 py-5 transition-colors ${
        isNoted ? 'border-amber-200 bg-amber-50/60' : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex gap-3 items-baseline mb-2">
        <span className="text-xs font-mono text-zinc-300 shrink-0 mt-1">{flow.id}</span>
        <h3 className="text-xl leading-relaxed text-zinc-900" style={{ fontFamily: 'var(--font-serif)' }}>
          {flow.title}
        </h3>
      </div>

      <ol className="flex flex-col gap-1 mb-3 ml-9">
        {flow.steps.map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-zinc-600">
            <span className="text-zinc-300 shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {flow.errors && flow.errors.length > 0 && (
        <div className="ml-9 mb-4 pt-3 border-t border-zinc-100">
          <p className="text-xs font-medium text-zinc-400 mb-1.5">Error states</p>
          <ul className="flex flex-col gap-1">
            {flow.errors.map((error, i) => (
              <li key={i} className="text-xs text-zinc-500 flex gap-2">
                <span className="text-zinc-300 shrink-0">—</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onChange(flow.id, { status: 'confirmed', comment: '' })}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7l3.5 3.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Confirm
        </button>
        <button
          onClick={() => onChange(flow.id, { status: isNoted ? 'unreviewed' : 'noted', comment: localComment })}
          className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl transition-colors ${
            isNoted
              ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 2h9v7H7l-3 2V9H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add note
        </button>
      </div>

      <AnimatePresence>
        {isNoted && (
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
              placeholder="Any questions or notes on this flow?"
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
