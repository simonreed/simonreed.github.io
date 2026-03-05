'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { Flow } from '@/lib/types'

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false })

interface Props {
  flow: Flow
}

export default function FlowItem({ flow }: Props) {
  const [showDiagram, setShowDiagram] = useState(false)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-zinc-400 shrink-0">{flow.id}</span>
          <h3 className="text-sm font-semibold text-zinc-900">{flow.title}</h3>
        </div>
        <ol className="flex flex-col gap-1.5 mb-3">
          {flow.steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-zinc-700">
              <span className="text-zinc-300 shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {flow.errors && flow.errors.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <p className="text-xs font-medium text-zinc-400 mb-1.5">Error states</p>
            <ul className="flex flex-col gap-1">
              {flow.errors.map((error, i) => (
                <li key={i} className="text-xs text-zinc-500 flex gap-2">
                  <span className="text-zinc-300 shrink-0">—</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {flow.sequence && (
          <button
            onClick={() => setShowDiagram((v) => !v)}
            className="mt-3 text-xs text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-1"
          >
            {showDiagram ? '▲ Hide' : '▼ Show'} sequence diagram
          </button>
        )}
      </div>
      <AnimatePresence>
        {showDiagram && flow.sequence && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-zinc-100"
          >
            <div className="px-5 py-4 bg-zinc-50">
              <MermaidDiagram chart={flow.sequence} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
