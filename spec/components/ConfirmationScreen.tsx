'use client'

import { motion } from 'framer-motion'

interface Props {
  name: string
  specTitle: string
  onDownloadAgain: () => void
  onStartFresh: () => void
}

export default function ConfirmationScreen({ name, specTitle, onDownloadAgain, onStartFresh }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Signed off</h2>
        <p className="text-sm text-zinc-500 mb-1">
          Thank you, {name}. Your sign-off has been recorded and the document has downloaded.
        </p>
        <p className="text-sm text-zinc-400 mb-8">
          Simon has everything he needs to proceed with {specTitle}.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onDownloadAgain}
            className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors underline underline-offset-2"
          >
            Download again
          </button>
          <button
            onClick={onStartFresh}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Start a fresh review
          </button>
        </div>
      </div>
    </motion.div>
  )
}
