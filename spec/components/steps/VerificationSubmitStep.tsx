'use client'

import { useState } from 'react'
import type { VerificationProgress } from '@/lib/types'
import type { ParsedCriterion } from '@/lib/parseSignOffCriteria'

interface Props {
  spec: { title: string }
  progress: VerificationProgress
  clientCriteria: ParsedCriterion[]
  onSubmit: (name: string, email: string) => void
  onBack: () => void
}

export default function VerificationSubmitStep({ spec, progress, clientCriteria, onSubmit, onBack }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [showZeroWarning, setShowZeroWarning] = useState(false)

  const confirmedCount = clientCriteria.filter(
    (c) => progress.criteria[c.index]?.status === 'confirmed'
  ).length
  const needsAttentionCount = clientCriteria.filter(
    (c) => progress.criteria[c.index]?.status === 'needs-attention'
  ).length
  const totalCount = clientCriteria.length

  function validate(): boolean {
    const fieldErrors: typeof errors = {}
    if (!name.trim()) fieldErrors.name = 'Please enter your name'
    if (!email.trim()) fieldErrors.email = 'Please enter your email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Please enter a valid email address'
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return false }
    return true
  }

  function handleSend() {
    if (!validate()) return
    if (confirmedCount === 0) {
      setShowZeroWarning(true)
      return
    }
    onSubmit(name.trim(), email.trim())
  }

  function handleSendAnyway() {
    if (!validate()) return
    onSubmit(name.trim(), email.trim())
  }

  return (
    <div className="py-10">
      <p className="text-xs text-zinc-400 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
        Send verification
      </p>
      <h2
        className="text-3xl text-zinc-900 mb-2 font-light leading-snug"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
      >
        Ready to send?
      </h2>
      <p className="text-base text-zinc-500 mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
        Your verification results will be sent to Simon along with a downloadable record.
      </p>

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-4">
        <p className="text-xs text-zinc-400 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>Summary</p>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-light text-zinc-900" style={{ fontFamily: 'var(--font-serif)' }}>{confirmedCount}</p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: 'var(--font-mono)' }}>looks good</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-light ${needsAttentionCount > 0 ? 'text-amber-600' : 'text-zinc-900'}`} style={{ fontFamily: 'var(--font-serif)' }}>{needsAttentionCount}</p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: 'var(--font-mono)' }}>need{needsAttentionCount === 1 ? 's' : ''} attention</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light text-zinc-400" style={{ fontFamily: 'var(--font-serif)' }}>{totalCount}</p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: 'var(--font-mono)' }}>total</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mb-6">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>Your name</label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
            placeholder="Liz Cale"
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300 ${errors.name ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
            style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>Your email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            placeholder="liz@adaptoffices.co.uk"
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300 ${errors.email ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
            style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{errors.email}</p>}
        </div>
      </div>

      {showZeroWarning ? (
        <div className="max-w-sm">
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-700" style={{ fontFamily: 'var(--font-serif)' }}>
            You haven&apos;t confirmed any items — are you sure you want to send?
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSendAnyway}
              className="bg-zinc-900 text-white py-3 px-6 rounded-2xl hover:bg-zinc-700 transition-colors text-sm"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Yes, send anyway
            </button>
            <button
              onClick={() => { setShowZeroWarning(false); onBack() }}
              className="text-zinc-500 hover:text-zinc-800 transition-colors text-sm px-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Go back
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSend}
          className="max-w-sm w-full bg-zinc-900 text-white py-3.5 px-4 rounded-2xl hover:bg-zinc-700 transition-colors"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
        >
          Send verification — {spec.title}
        </button>
      )}
    </div>
  )
}
