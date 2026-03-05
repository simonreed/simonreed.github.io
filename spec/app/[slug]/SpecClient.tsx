'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Spec, SpecProgress, AssumptionResponse, QuestionResponse } from '@/lib/types'
import { loadProgress, saveProgress, clearProgress, initProgress } from '@/lib/localStorage'
import { generateMarkdown, generateFilename } from '@/lib/generateMarkdown'

import StepLayout from '@/components/steps/StepLayout'
import WelcomeStep from '@/components/steps/WelcomeStep'
import AssumptionStep from '@/components/steps/AssumptionStep'
import QuestionStep from '@/components/steps/QuestionStep'
import FlowsStep from '@/components/steps/FlowsStep'
import SignOffStep from '@/components/steps/SignOffStep'
import ConfirmationScreen from '@/components/ConfirmationScreen'

type StepId = 'welcome' | `assumption-${string}` | `question-${string}` | 'flows' | 'signoff'

function buildSteps(spec: Spec): StepId[] {
  return [
    'welcome',
    ...spec.assumptions.map((a) => `assumption-${a.id}` as StepId),
    ...spec.questions.map((q) => `question-${q.id}` as StepId),
    'flows',
    'signoff',
  ]
}

export default function SpecClient({ spec }: { spec: Spec }) {
  const steps = buildSteps(spec)
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [progress, setProgress] = useState<SpecProgress>(() => initProgress(spec))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = loadProgress(spec)
    setProgress(saved)
    if (saved.submitted) {
      // Jump to confirmation — handled below
    }
    setLoaded(true)
  }, [spec])

  useEffect(() => {
    if (loaded) saveProgress(spec.slug, progress)
  }, [progress, loaded, spec.slug])

  const advance = useCallback(() => {
    setDirection(1)
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [steps.length])

  const back = useCallback(() => {
    setDirection(-1)
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const handleAssumptionChange = useCallback((id: string, response: AssumptionResponse) => {
    setProgress((prev) => ({
      ...prev,
      assumptions: { ...prev.assumptions, [id]: response },
    }))
  }, [])

  const handleQuestionChange = useCallback((id: string, response: QuestionResponse) => {
    setProgress((prev) => ({
      ...prev,
      questions: { ...prev.questions, [id]: response },
    }))
  }, [])

  const downloadMarkdown = useCallback(
    (finalProgress: SpecProgress) => {
      const md = generateMarkdown(spec, finalProgress)
      const filename = generateFilename(spec, finalProgress)
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

  const handleSignOff = useCallback(
    (name: string, email: string) => {
      const now = new Date().toISOString()
      const finalProgress: SpecProgress = {
        ...progress,
        submitted: true,
        submittedAt: now,
        submittedBy: { name, email },
      }
      setProgress(finalProgress)
      saveProgress(spec.slug, finalProgress)
      downloadMarkdown(finalProgress)
    },
    [progress, spec.slug, downloadMarkdown]
  )

  const handleStartFresh = useCallback(() => {
    clearProgress(spec.slug)
    setProgress(initProgress(spec))
    setStepIndex(0)
    setDirection(1)
  }, [spec])

  // Keyboard: Backspace to go back (unless in an input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && document.activeElement?.tagName === 'BODY') {
        back()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [back])

  const totalInteractive = spec.assumptions.length + spec.questions.length
  const reviewedCount =
    spec.assumptions.filter((a) => progress.assumptions[a.id]?.status !== 'unreviewed').length +
    spec.questions.filter((q) => (progress.questions[q.id]?.value ?? '').trim() !== '').length

  const pct = totalInteractive === 0 ? 100 : Math.round((reviewedCount / totalInteractive) * 100)

  if (!loaded) return null

  if (progress.submitted && progress.submittedBy) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <ConfirmationScreen
          name={progress.submittedBy.name}
          specTitle={spec.title}
          onDownloadAgain={() => downloadMarkdown(progress)}
          onStartFresh={handleStartFresh}
        />
      </div>
    )
  }

  const currentStep = steps[stepIndex]

  const renderStep = () => {
    if (currentStep === 'welcome') {
      return (
        <StepLayout key="welcome" stepKey="welcome" direction={direction}>
          <WelcomeStep spec={spec} onBegin={advance} />
        </StepLayout>
      )
    }

    if (currentStep.startsWith('assumption-')) {
      const id = currentStep.replace('assumption-', '')
      const assumption = spec.assumptions.find((a) => a.id === id)!
      const aIndex = spec.assumptions.findIndex((a) => a.id === id)
      return (
        <StepLayout key={currentStep} stepKey={currentStep} direction={direction}>
          <AssumptionStep
            assumption={assumption}
            totalAssumptions={spec.assumptions.length}
            index={aIndex}
            response={progress.assumptions[id] ?? { status: 'unreviewed', comment: '' }}
            onChange={handleAssumptionChange}
            onAdvance={advance}
          />
        </StepLayout>
      )
    }

    if (currentStep.startsWith('question-')) {
      const id = currentStep.replace('question-', '')
      const question = spec.questions.find((q) => q.id === id)!
      const qIndex = spec.questions.findIndex((q) => q.id === id)
      return (
        <StepLayout key={currentStep} stepKey={currentStep} direction={direction}>
          <QuestionStep
            question={question}
            totalQuestions={spec.questions.length}
            index={qIndex}
            response={progress.questions[id] ?? { value: '' }}
            onChange={handleQuestionChange}
            onAdvance={advance}
          />
        </StepLayout>
      )
    }

    if (currentStep === 'flows') {
      return (
        <StepLayout key="flows" stepKey="flows" direction={direction}>
          <FlowsStep
            flows={spec.flows}
            notInScope={spec.not_in_scope ?? []}
            onAdvance={advance}
          />
        </StepLayout>
      )
    }

    if (currentStep === 'signoff') {
      return (
        <StepLayout key="signoff" stepKey="signoff" direction={direction}>
          <SignOffStep spec={spec} progress={progress} onSignOff={handleSignOff} />
        </StepLayout>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <div className="h-0.5 bg-zinc-100">
          <div
            className="h-full bg-zinc-900 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Back button */}
      {stepIndex > 0 && (
        <button
          onClick={back}
          className="fixed top-4 left-4 z-20 text-zinc-400 hover:text-zinc-700 transition-colors text-sm flex items-center gap-1"
        >
          ← Back
        </button>
      )}

      {/* Step counter */}
      <div className="fixed top-3 right-4 z-20 text-xs text-zinc-300 font-mono">
        {stepIndex + 1} / {steps.length}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 min-h-screen">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
