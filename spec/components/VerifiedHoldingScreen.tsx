import type { Spec } from '@/lib/types'

export default function VerifiedHoldingScreen({ spec }: { spec: Spec }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <p className="text-xs text-zinc-400 mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
          {spec.title}
        </p>
        <h1
          className="text-3xl text-zinc-900 mb-4 font-light leading-snug"
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        >
          Verified
        </h1>
        <p className="text-base text-zinc-500" style={{ fontFamily: 'var(--font-serif)' }}>
          This phase has been verified — Simon will be in touch about next steps.
        </p>
      </div>
    </div>
  )
}
