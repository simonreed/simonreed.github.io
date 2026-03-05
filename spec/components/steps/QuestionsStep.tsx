'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Question, QuestionResponse } from '@/lib/types'
import QuestionItem from '@/components/QuestionItem'

interface Props {
  questions: Question[]
  responses: Record<string, QuestionResponse>
  onChange: (id: string, response: QuestionResponse) => void
  onAdvance: () => void
}

export default function QuestionsStep({ questions, responses, onChange, onAdvance }: Props) {
  if (questions.length === 0) {
    return null
  }

  const answered = questions.filter((q) => (responses[q.id]?.value ?? '').trim() !== '').length
  const allAnswered = answered === questions.length

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && allAnswered && document.activeElement?.tagName !== 'TEXTAREA') {
        onAdvance()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [allAnswered, onAdvance])

  return (
    <div className="py-8">
      <div className="text-xs text-zinc-400 mb-2 font-mono">Open questions</div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-1">
        A few decisions we need from you
      </h2>
      <p className="text-sm text-zinc-500 mb-8">
        These are open questions that need your input before we start building.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            response={responses[q.id] ?? { value: '' }}
            onChange={onChange}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onAdvance}
          disabled={!allAnswered}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Review the flows
          {allAnswered && <span className="text-zinc-400 text-xs">↵</span>}
        </button>
        {!allAnswered && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-zinc-400"
          >
            {answered} of {questions.length} answered
          </motion.span>
        )}
      </div>
    </div>
  )
}
