'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  items: string[]
}

export default function NotInScope({ items }: Props) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <section className="mb-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <span>{open ? '▲' : '▼'}</span>
        <span className="font-medium">Not included in this phase</span>
        <span className="text-xs">({items.length} items)</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 flex flex-col gap-1.5 pl-1"
          >
            {items.map((item, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  )
}
