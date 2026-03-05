'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { Question, QuestionResponse } from '@/lib/types'

interface Props {
  question: Question
  totalQuestions: number
  index: number
  response: QuestionResponse
  onChange: (id: string, response: QuestionResponse) => void
  onAdvance: () => void
}

export default function QuestionStep({ question, totalQuestions, index, response, onChange, onAdvance }: Props) {
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (question.type === 'text') textRef.current?.focus()
  }, [question.id, question.type])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (question.type === 'choice' && question.options) {
        const num = parseInt(e.key)
        if (!isNaN(num) && num >= 1 && num <= question.options.length) {
          const selected = question.options[num - 1]
          onChange(question.id, { value: selected })
          setTimeout(onAdvance, 500)
        }
      }
      if (e.key === 'Enter' && question.type === 'text' && !e.shiftKey) {
        if (response.value.trim()) onAdvance()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [question, response.value, onChange, onAdvance])

  const handleChoice = (option: string) => {
    onChange(question.id, { value: option })
    setTimeout(onAdvance, 500)
  }

  return (
    <div className="py-8">
      <div className="text-xs text-zinc-400 mb-6 font-mono">
        Question {index + 1} of {totalQuestions}
      </div>
      <div className="flex items-start gap-3 mb-8">
        <span className="text-xs font-mono text-zinc-300 mt-1 shrink-0 w-7">{question.id}</span>
        <p className="text-2xl font-medium text-zinc-900 leading-snug">{question.text}</p>
      </div>

      {question.type === 'choice' && question.options ? (
        <div className="flex flex-col gap-2">
          {question.options.map((option, i) => (
            <motion.button
              key={option}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => handleChoice(option)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm text-left transition-all ${
                response.value === option
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <span className={`text-xs font-mono w-4 shrink-0 ${response.value === option ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {i + 1}
              </span>
              {option}
            </motion.button>
          ))}
        </div>
      ) : (
        <div>
          <textarea
            ref={textRef}
            value={response.value}
            onChange={(e) => onChange(question.id, { value: e.target.value })}
            placeholder="Your response..."
            className="w-full text-sm border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white resize-none mb-3"
            rows={4}
          />
          <button
            onClick={onAdvance}
            disabled={!response.value.trim()}
            className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue <span className="text-zinc-400 text-xs">↵</span>
          </button>
        </div>
      )}
    </div>
  )
}
