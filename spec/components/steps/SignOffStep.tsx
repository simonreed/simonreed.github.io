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
  const notedCount = Object.values(progress.flows ?? {}).filter((f) => f.status === 'noted').length

  const handleSubmit = () => {
    const fieldErrors: typeof errors = {}
    if (!name.trim()) fieldErrors.name = 'Please enter your name'
    if (!email.trim()) fieldErrors.email = 'Please enter your email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Please enter a valid email address'
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    onSignOff(name.trim(), email.trim())
  }

  return (
    <div className="py-10">
      <p className="text-xs text-zinc-400 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
        Sign off
      </p>
      <h2
        className="text-3xl text-zinc-900 mb-2 font-light leading-snug"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
      >
        Ready to proceed?
      </h2>
      <p className="text-base text-zinc-500 mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
        Signing off confirms that the assumptions and flows above are correct and development can begin. Any changes after this point will be scoped into a future phase.
      </p>

      {(flaggedCount > 0 || notedCount > 0) && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-sm text-amber-700" style={{ fontFamily: 'var(--font-serif)' }}>
          {flaggedCount > 0 && <p>You flagged {flaggedCount} assumption{flaggedCount !== 1 ? 's' : ''}.</p>}
          {notedCount > 0 && <p>You added notes to {notedCount} flow{notedCount !== 1 ? 's' : ''}.</p>}
          <p className="mt-1 text-amber-600 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>Simon will review these before building.</p>
        </div>
      )}

      {spec.sign_off_criteria && spec.sign_off_criteria.length > 0 && (
        <div className="mb-10 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5">
          <p className="text-xs text-zinc-400 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>Before release, we will confirm:</p>
          <ul className="flex flex-col gap-2.5">
            {spec.sign_off_criteria.map((criterion, i) => (
              <li key={i} className="text-base text-zinc-700 flex gap-3" style={{ fontFamily: 'var(--font-serif)' }}>
                <span className="text-zinc-300 shrink-0 mt-0.5">✓</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-sm">
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="liz@adaptoffices.co.uk"
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300 ${errors.email ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
            style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{errors.email}</p>}
        </div>
        <button
          onClick={handleSubmit}
          className="mt-2 w-full bg-zinc-900 text-white py-3.5 px-4 rounded-2xl hover:bg-zinc-700 transition-colors"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}
        >
          Sign off — {spec.title}
        </button>
      </div>
    </div>
  )
}
