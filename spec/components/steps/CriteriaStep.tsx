'use client'

import { useState } from 'react'
import type { VerificationProgress, VerificationItemResponse } from '@/lib/types'
import type { ParsedCriterion } from '@/lib/parseSignOffCriteria'

interface Props {
  clientCriteria: ParsedCriterion[]
  simonCriteria: ParsedCriterion[]
  progress: VerificationProgress
  onChange: (index: number, response: VerificationItemResponse) => void
  onAdvance: () => void
}

export default function CriteriaStep({ clientCriteria, simonCriteria, progress, onChange, onAdvance }: Props) {
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set(
      clientCriteria
        .filter((c) => progress.criteria[c.index]?.status === 'needs-attention')
        .map((c) => c.index)
    )
  )

  const allClientReviewed = clientCriteria.every(
    (c) => progress.criteria[c.index]?.status !== 'unchecked'
  )

  const reviewedCount = clientCriteria.filter(
    (c) => progress.criteria[c.index]?.status !== 'unchecked'
  ).length

  function handleStatus(index: number, status: 'confirmed' | 'needs-attention') {
    const current = progress.criteria[index] ?? { status: 'unchecked', comment: '' }
    onChange(index, { ...current, status })
    if (status === 'needs-attention') {
      setExpandedComments((prev) => new Set([...prev, index]))
    } else {
      setExpandedComments((prev) => { const next = new Set(prev); next.delete(index); return next })
    }
  }

  function handleComment(index: number, comment: string) {
    const current = progress.criteria[index] ?? { status: 'unchecked', comment: '' }
    onChange(index, { ...current, comment })
  }

  return (
    <div className="py-10">
      <p className="text-xs text-zinc-400 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
        Verification checklist
      </p>
      <h2
        className="text-3xl text-zinc-900 mb-2 font-light leading-snug"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
      >
        Check each item
      </h2>
      <p className="text-base text-zinc-500 mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
        Mark each criterion as &ldquo;Looks good&rdquo; or &ldquo;Needs attention&rdquo;. Add a note if something needs fixing.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {clientCriteria.map((criterion) => {
          const response = progress.criteria[criterion.index] ?? { status: 'unchecked', comment: '' }
          const isConfirmed = response.status === 'confirmed'
          const isNeeds = response.status === 'needs-attention'
          const showComment = expandedComments.has(criterion.index)

          return (
            <div
              key={criterion.index}
              className={`rounded-2xl border px-5 py-4 transition-colors ${
                isConfirmed
                  ? 'border-green-200 bg-green-50'
                  : isNeeds
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-zinc-200 bg-white'
              }`}
            >
              <p className="text-base text-zinc-700 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                {criterion.text}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatus(criterion.index, 'confirmed')}
                  className={`text-sm px-4 py-2 rounded-xl transition-colors ${
                    isConfirmed
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:border-green-300 hover:text-green-700'
                  }`}
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  ✓ Looks good
                </button>
                <button
                  onClick={() => handleStatus(criterion.index, 'needs-attention')}
                  className={`text-sm px-4 py-2 rounded-xl transition-colors ${
                    isNeeds
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:border-amber-300 hover:text-amber-700'
                  }`}
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  ✗ Needs attention
                </button>
              </div>
              {showComment && (
                <textarea
                  className="mt-3 w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
                  style={{ fontFamily: 'var(--font-serif)' }}
                  placeholder="Describe what needs fixing…"
                  rows={2}
                  value={response.comment}
                  onChange={(e) => handleComment(criterion.index, e.target.value)}
                  autoFocus
                />
              )}
            </div>
          )
        })}
      </div>

      {simonCriteria.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-zinc-400 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
            Simon has also verified the following
          </p>
          <div className="flex flex-col gap-2">
            {simonCriteria.map((criterion) => (
              <div
                key={criterion.index}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-3 flex items-center gap-3"
              >
                <span className="text-zinc-400 shrink-0">🔒</span>
                <p className="text-sm text-zinc-500 flex-1" style={{ fontFamily: 'var(--font-serif)' }}>
                  {criterion.text}
                </p>
                <span className="text-xs text-zinc-400 shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                  Simon has verified this
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={onAdvance}
          disabled={!allClientReviewed}
          className={`px-7 py-3.5 rounded-2xl transition-colors text-base ${
            allClientReviewed
              ? 'bg-zinc-900 text-white hover:bg-zinc-700'
              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
          }`}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Continue to submit
        </button>
        {!allClientReviewed && (
          <span className="text-sm text-zinc-400" style={{ fontFamily: 'var(--font-mono)' }}>
            {reviewedCount} of {clientCriteria.length} checked
          </span>
        )}
      </div>
    </div>
  )
}
