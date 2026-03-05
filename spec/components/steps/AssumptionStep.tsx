'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Assumption, AssumptionResponse } from '@/lib/types'

interface Props {
  assumption: Assumption
  totalAssumptions: number
  index: number
  response: AssumptionResponse
  onChange: (id: string, response: AssumptionResponse) => void
  onAdvance: () => void
}

export default function AssumptionStep({ assumption, totalAssumptions, index, response, onChange, onAdvance }: Props) {
  const [localComment, setLocalComment] = useState(response.comment)
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const isFlagged = response.status === 'flagged'
  const isConfirmed = response.status === 'confirmed'

  useEffect(() => {
    setLocalComment(response.comment)
  }, [assumption.id, response.comment])

  useEffect(() => {
    if (isFlagged) commentRef.current?.focus()
  }, [isFlagged])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isFlagged && !isConfirmed) {
        onChange(assumption.id, { status: 'confirmed', comment: '' })
        setTimeout(onAdvance, 300)
      } else if (e.key === 'Enter' && isConfirmed) {
        onAdvance()
      } else if (e.key === 'f' || e.key === 'F') {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          onChange(assumption.id, { status: isFlagged ? 'unreviewed' : 'flagged', comment: localComment })
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [assumption.id, isFlagged, isConfirmed, localComment, onChange, onAdvance])

  const handleConfirm = () => {
    onChange(assumption.id, { status: 'confirmed', comment: '' })
    setTimeout(onAdvance, 300)
  }

  const handleFlag = () => {
    onChange(assumption.id, { status: isFlagged ? 'unreviewed' : 'flagged', comment: localComment })
  }

  const handleCommentChange = (val: string) => {
    setLocalComment(val)
    onChange(assumption.id, { status: 'flagged', comment: val })
  }

  return (
    <div className="py-8">
      <div className="text-xs text-zinc-400 mb-6 font-mono">
        Assumption {index + 1} of {totalAssumptions}
      </div>
      <div className="flex items-start gap-3 mb-8">
        <span className="text-xs font-mono text-zinc-300 mt-1 shrink-0 w-7">{assumption.id}</span>
        <p className="text-2xl font-medium text-zinc-900 leading-snug">{assumption.text}</p>
      </div>
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleConfirm}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            isConfirmed
              ? 'bg-zinc-900 text-white'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <span>✓</span> Confirm
          {!isConfirmed && <span className="text-zinc-400 text-xs ml-1">↵</span>}
        </button>
        <button
          onClick={handleFlag}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            isFlagged
              ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <span>⚑</span> Flag
          {!isFlagged && <span className="text-zinc-400 text-xs ml-1">F</span>}
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
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="What would you like to change or clarify?"
              className="w-full text-sm border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-amber-50 resize-none mb-3"
              rows={3}
            />
            <button
              onClick={onAdvance}
              className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Continue <span className="text-zinc-400 text-xs">↵</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {isConfirmed && !isFlagged && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={onAdvance}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            Next <span className="text-xs">→</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}
