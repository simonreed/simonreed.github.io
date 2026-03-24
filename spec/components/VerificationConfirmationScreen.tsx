'use client'

import { motion } from 'framer-motion'

interface Props {
  name: string
  submittedAt: string
  confirmedCount: number
  needsAttentionCount: number
  totalCount: number
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function VerificationConfirmationScreen({
  name,
  submittedAt,
  confirmedCount,
  needsAttentionCount,
  totalCount,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">✓</div>
        <h2
          className="text-2xl font-light text-zinc-900 mb-2"
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        >
          Thanks {name}
        </h2>
        <p className="text-sm text-zinc-500 mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
          Simon will review your notes and be in touch.
        </p>
        <p className="text-xs text-zinc-400 mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
          Submitted on {formatDate(submittedAt)} · {confirmedCount} of {totalCount} confirmed
          {needsAttentionCount > 0 && ` · ${needsAttentionCount} need${needsAttentionCount === 1 ? 's' : ''} attention`}
        </p>
      </div>
    </motion.div>
  )
}
