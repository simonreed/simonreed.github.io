'use client'

import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  stepKey: string
  direction: number // 1 = forward, -1 = backward
}

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

export default function StepLayout({ children, stepKey, direction }: Props) {
  return (
    <motion.div
      key={stepKey}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      {children}
    </motion.div>
  )
}
