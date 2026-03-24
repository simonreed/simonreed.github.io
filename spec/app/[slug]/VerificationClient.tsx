'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Spec, VerificationProgress, VerificationItemResponse } from '@/lib/types'
import {
  initVerificationProgress,
  loadVerificationProgress,
  saveVerificationProgress,
} from '@/lib/localStorage'
import { parseSignOffCriteria } from '@/lib/parseSignOffCriteria'
import {
  generateVerificationMarkdown,
  generateVerificationFilename,
  generateVerificationSubject,
} from '@/lib/generateVerificationMarkdown'

import StepLayout from '@/components/steps/StepLayout'
import VerificationWelcomeStep from '@/components/steps/VerificationWelcomeStep'
import CriteriaStep from '@/components/steps/CriteriaStep'
import VerificationSubmitStep from '@/components/steps/VerificationSubmitStep'
import VerificationConfirmationScreen from '@/components/VerificationConfirmationScreen'
import SpecReferencePanel from '@/components/SpecReferencePanel'

type VerificationStepId = 'welcome' | 'criteria' | 'submit'

const stepLabels: Record<VerificationStepId, string> = {
  welcome: 'Intro',
  criteria: 'Checklist',
  submit: 'Submit',
}

function buildSteps(spec: Spec): VerificationStepId[] {
  const { clientCriteria } = parseSignOffCriteria(spec)
  if (clientCriteria.length === 0) return ['welcome', 'submit']
  return ['welcome', 'criteria', 'submit']
}

export default function VerificationClient({ spec }: { spec: Spec }) {
  const steps = buildSteps(spec)
  const { clientCriteria, simonCriteria } = parseSignOffCriteria(spec)

  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [progress, setProgress] = useState<VerificationProgress>(() => initVerificationProgress(spec))
  const [loaded, setLoaded] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    // Detect localStorage availability
    try {
      localStorage.setItem('_test', '1')
      localStorage.removeItem('_test')
    } catch {
      setStorageUnavailable(true)
    }

    const saved = loadVerificationProgress(spec)
    if (saved) {
      setProgress(saved)
      if (!saved.submitted) {
        setHasResume(true)
      }
    } else {
      setProgress(initVerificationProgress(spec))
    }
    setLoaded(true)
  }, [spec])

  useEffect(() => {
    if (loaded) saveVerificationProgress(spec, progress)
  }, [progress, loaded, spec])

  const advance = useCallback(() => {
    setDirection(1)
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [steps.length])

  const back = useCallback(() => {
    setDirection(-1)
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const handleBegin = useCallback(() => {
    setHasResume(false)
    setProgress(initVerificationProgress(spec))
    advance()
  }, [spec, advance])

  const handleContinue = useCallback(() => {
    setHasResume(false)
    advance()
  }, [advance])

  const handleCriterionChange = useCallback((index: number, response: VerificationItemResponse) => {
    setProgress((prev) => ({
      ...prev,
      criteria: { ...prev.criteria, [index]: response },
    }))
  }, [])

  const downloadMarkdown = useCallback(
    (finalProgress: VerificationProgress) => {
      const md = generateVerificationMarkdown(spec, finalProgress)
      const filename = generateVerificationFilename(spec, finalProgress)
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    [spec]
  )

  const handleSubmit = useCallback(
    async (name: string, email: string) => {
      const now = new Date().toISOString()
      const finalProgress: VerificationProgress = {
        ...progress,
        submitted: true,
        submittedAt: now,
        submittedBy: { name, email },
      }
      setProgress(finalProgress)
      saveVerificationProgress(spec, finalProgress)
      downloadMarkdown(finalProgress)

      const md = generateVerificationMarkdown(spec, finalProgress)
      const subject = generateVerificationSubject(spec, finalProgress)
      fetch('https://spec-signoff-mailer.simonpreed-fe9.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, markdown: md, from_name: name, from_email: email }),
      }).catch(() => {/* silently ignore */})
    },
    [progress, spec, downloadMarkdown]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && document.activeElement?.tagName === 'BODY') back()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [back])

  if (!loaded) return null

  // Already submitted — show read-only confirmation
  if (progress.submitted && progress.submittedBy) {
    const confirmedCount = clientCriteria.filter(
      (c) => progress.criteria[c.index]?.status === 'confirmed'
    ).length
    const needsAttentionCount = clientCriteria.filter(
      (c) => progress.criteria[c.index]?.status === 'needs-attention'
    ).length
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <VerificationConfirmationScreen
          name={progress.submittedBy.name}
          submittedAt={progress.submittedAt!}
          confirmedCount={confirmedCount}
          needsAttentionCount={needsAttentionCount}
          totalCount={clientCriteria.length}
        />
      </div>
    )
  }

  const currentStep = steps[stepIndex]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header bar */}
      <div className="fixed top-0 left-0 right-0 z-20 grid grid-cols-[80px_1fr_80px] items-center px-4 py-3 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div>
          {stepIndex > 0 && (
            <button
              onClick={back}
              className="text-zinc-400 hover:text-zinc-700 transition-colors text-sm flex items-center gap-1"
            >
              ← Back
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-1">
          {steps.map((step, i) => (
            <button
              key={step}
              onClick={() => { if (i < stepIndex) { setDirection(-1); setStepIndex(i) } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all ${
                i === stepIndex
                  ? 'text-zinc-900 font-medium cursor-default'
                  : i < stepIndex
                  ? 'text-zinc-400 hover:text-zinc-600'
                  : 'text-zinc-200 cursor-default pointer-events-none'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                i === stepIndex ? 'bg-zinc-900' : i < stepIndex ? 'bg-zinc-300' : 'bg-zinc-100'
              }`} />
              {stepLabels[step]}
            </button>
          ))}
        </div>
        <div />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 pt-20 pb-16 min-h-screen overflow-y-auto">
        <div className="w-full max-w-xl">
          {currentStep !== 'welcome' && (
            <SpecReferencePanel spec={spec} isOpen={panelOpen} onToggle={() => setPanelOpen((o) => !o)} />
          )}
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 'welcome' && (
              <StepLayout key="welcome" stepKey="welcome" direction={direction}>
                <VerificationWelcomeStep
                  spec={spec}
                  hasResume={hasResume}
                  storageUnavailable={storageUnavailable}
                  onBegin={handleBegin}
                  onContinue={handleContinue}
                />
              </StepLayout>
            )}
            {currentStep === 'criteria' && (
              <StepLayout key="criteria" stepKey="criteria" direction={direction}>
                <CriteriaStep
                  clientCriteria={clientCriteria}
                  simonCriteria={simonCriteria}
                  progress={progress}
                  onChange={handleCriterionChange}
                  onAdvance={advance}
                />
              </StepLayout>
            )}
            {currentStep === 'submit' && (
              <StepLayout key="submit" stepKey="submit" direction={direction}>
                <VerificationSubmitStep
                  spec={spec}
                  progress={progress}
                  clientCriteria={clientCriteria}
                  onSubmit={handleSubmit}
                  onBack={back}
                />
              </StepLayout>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
