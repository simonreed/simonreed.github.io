'use client'

import type { Question, QuestionResponse } from '@/lib/types'
import QuestionItem from './QuestionItem'

interface Props {
  questions: Question[]
  responses: Record<string, QuestionResponse>
  highlights?: string[]
  onChange: (id: string, response: QuestionResponse) => void
}

export default function QuestionList({ questions, responses, highlights = [], onChange }: Props) {
  if (questions.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-zinc-900 mb-1">Open Questions</h2>
      <p className="text-sm text-zinc-500 mb-4">
        These need a decision from you before we start building.
      </p>
      <div className="flex flex-col gap-3">
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            response={responses[q.id] ?? { value: '' }}
            highlight={highlights.includes(q.id)}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  )
}
