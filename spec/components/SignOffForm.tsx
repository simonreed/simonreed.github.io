'use client'

import { useState } from 'react'
import type { Spec, SpecProgress } from '@/lib/types'
import { validateResponses } from '@/lib/validateResponses'

interface Props {
  spec: Spec
  progress: SpecProgress
  onSignOff: (name: string, email: string) => void
  onValidationFail: (unreviewedAssumptions: string[], unansweredQuestions: string[]) => void
}

export default function SignOffForm({ spec, progress, onSignOff, onValidationFail }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [attempted, setAttempted] = useState(false)

  const handleSubmit = () => {
    setAttempted(true)
    const fieldErrors: typeof errors = {}
    if (!name.trim()) fieldErrors.name = 'Please enter your name'
    if (!email.trim()) fieldErrors.email = 'Please enter your email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Please enter a valid email address'

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    const result = validateResponses(spec, progress)
    if (!result.valid) {
      onValidationFail(result.unreviewedAssumptions, result.unansweredQuestions)
      return
    }

    onSignOff(name.trim(), email.trim())
  }

  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-zinc-900 mb-1">Sign Off</h2>
      {spec.sign_off_criteria && spec.sign_off_criteria.length > 0 && (
        <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="text-xs font-medium text-zinc-500 mb-2">We will walk through these with you before release:</p>
          <ul className="flex flex-col gap-1.5">
            {spec.sign_off_criteria.map((criterion, i) => (
              <li key={i} className="text-sm text-zinc-700 flex gap-2">
                <span className="text-zinc-300 shrink-0">✓</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-zinc-500 mb-4">
        Signing off confirms the assumptions, flows, and access rules above are correct and
        development can proceed. Any changes after sign-off will be picked up in a future phase.
      </p>
      <div className="flex flex-col gap-3 max-w-md">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })) }}
            placeholder="Liz Cale"
            className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300 ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-zinc-200'
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Your email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })) }}
            placeholder="liz@adapt.com"
            className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300 ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-zinc-200'
            }`}
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
    </section>
  )
}
