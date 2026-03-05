'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    setLocalComment(response.comment)
  }, [response.comment])

  const handleComment = (value: string) => {
    setLocalComment(value)
    onChange(assumption.id, { ...response, comment: value })
  }

  const isConfirmed = response.status === 'confirmed'
  const isFlagged = response.status === 'flagged'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 transition-colors ${
        highlight
          ? 'border-amber-300 bg-amber-50'
          : isConfirmed
          ? 'border-green-200 bg-green-50/40'
          : isFlagged
          ? 'border-amber-200 bg-amber-50/40'
          : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex gap-4 items-start">
        <span className="text-xs font-mono text-zinc-400 mt-0.5 shrink-0 w-7">{assumption.id}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-800 leading-relaxed mb-3">{assumption.text}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onChange(assumption.id, { ...response, status: isConfirmed ? 'unreviewed' : 'confirmed' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isConfirmed
                  ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              <span>✓</span> Confirm
            </button>
            <button
              onClick={() => onChange(assumption.id, { ...response, status: isFlagged ? 'unreviewed' : 'flagged' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isFlagged
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              <span>⚑</span> Flag
            </button>
          </div>
          <AnimatePresence>
            {isFlagged && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  value={localComment}
                  onChange={(e) => handleComment(e.target.value)}
                  placeholder="What would you like to change or clarify?"
                  className="mt-3 w-full text-sm border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white resize-none"
                  rows={2}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
