'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Question, QuestionResponse } from '@/lib/types'

interface Props {
  question: Question
  response: QuestionResponse
  highlight?: boolean
  onChange: (id: string, response: QuestionResponse) => void
}

export default function QuestionItem({ question, response, highlight, onChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 transition-colors ${
        highlight
          ? 'border-amber-300 bg-amber-50'
          : response.value
          ? 'border-zinc-200 bg-zinc-50/40'
          : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex gap-4 items-start">
        <span className="text-xs font-mono text-zinc-400 mt-0.5 shrink-0 w-7">{question.id}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-800 leading-relaxed mb-3">{question.text}</p>
          {question.type === 'choice' && question.options ? (
            <div className="flex flex-col gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => onChange(question.id, { value: option })}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    response.value === option
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={response.value}
              onChange={(e) => onChange(question.id, { value: e.target.value })}
              placeholder="Your response..."
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white resize-none"
              rows={3}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
