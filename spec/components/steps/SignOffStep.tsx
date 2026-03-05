'use client'

import { useState } from 'react'
import type { Spec, SpecProgress } from '@/lib/types'

interface Props {
  spec: Spec
  progress: SpecProgress
  onSignOff: (name: string, email: string) => void
}

export default function SignOffStep({ spec, progress, onSignOff }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const flaggedCount = Object.values(progress.assumptions).filter((a) => a.status === 'flagged').length

  const handleSubmit = () => {
    const fieldErrors: typeof errors = {}
    if (!name.trim()) fieldErrors.name = 'Please enter your name'
    if (!email.trim()) fieldErrors.email = 'Please enter your email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Please enter a valid email address'
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    onSignOff(name.trim(), email.trim())
  }

  return (
    <div className="py-8">
      <div className="text-xs text-zinc-400 mb-6 font-mono">Final step</div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-3">Sign off</h2>

      {flaggedCount > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          You flagged {flaggedCount} assumption{flaggedCount > 1 ? 's' : ''}. Your notes are included in the output and Simon will address them before building.
        </div>
      )}

      {spec.sign_off_criteria && spec.sign_off_criteria.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="text-xs font-medium text-zinc-500 mb-3">We will walk through these with you before release:</p>
          <ul className="flex flex-col gap-2">
            {spec.sign_off_criteria.map((criterion, i) => (
              <li key={i} className="text-sm text-zinc-700 flex gap-2">
                <span className="text-zinc-300 shrink-0">✓</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-zinc-500 mb-6">
        Signing off confirms the assumptions, flows, and access rules above are correct and development can proceed. Any changes after sign-off will be picked up in a future phase.
      </p>

      <div className="flex flex-col gap-3 max-w-sm">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Your name</label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
            placeholder="Liz Cale"
            className={`w-full text-sm border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300 ${errors.name ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Your email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="liz@adapt.com"
            className={`w-full text-sm border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300 ${errors.email ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <button
          onClick={handleSubmit}
          className="mt-1 w-full bg-zinc-900 text-white text-sm font-medium py-3 px-4 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          I agree — sign off {spec.title}
        </button>
      </div>
    </div>
  )
}
