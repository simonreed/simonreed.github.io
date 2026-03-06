'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Spec, SpecProgress, AssumptionResponse, QuestionResponse, FlowResponse } from '@/lib/types'
import { loadProgress, saveProgress, clearProgress, initProgress } from '@/lib/localStorage'
import { generateMarkdown, generateFilename } from '@/lib/generateMarkdown'

import StepLayout from '@/components/steps/StepLayout'
import WelcomeStep from '@/components/steps/WelcomeStep'
import AssumptionsStep from '@/components/steps/AssumptionsStep'
import QuestionsStep from '@/components/steps/QuestionsStep'
import FlowsStep from '@/components/steps/FlowsStep'
import SignOffStep from '@/components/steps/SignOffStep'
import ConfirmationScreen from '@/components/ConfirmationScreen'

type StepId = 'welcome' | 'assumptions' | 'questions' | 'flows' | 'signoff'

function buildSteps(spec: Spec): StepId[] {
  const steps: StepId[] = ['welcome', 'assumptions']
  if (spec.questions.length > 0) steps.push('questions')
  if (spec.flows.length > 0) steps.push('flows')
  steps.push('signoff')
  return steps
}

const stepLabels: Record<StepId, string> = {
  welcome: 'Intro',
  assumptions: 'Assumptions',
  questions: 'Questions',
  flows: 'Flows',
  signoff: 'Sign off',
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

  const handleFlowChange = useCallback((id: string, response: FlowResponse) => {
    setProgress((prev) => ({
      ...prev,
      flows: { ...prev.flows, [id]: response },
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
    async (name: string, email: string) => {
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

      const md = generateMarkdown(spec, finalProgress)
      const subject = `Sign-off: ${spec.title} v${spec.version} — ${name}`
      fetch('https://spec-signoff-mailer.simonpreed-fe9.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, markdown: md, from_name: name, from_email: email }),
      }).catch(() => {/* silently ignore — download is the primary delivery */})
    },
    [progress, spec, downloadMarkdown]
  )

  const handleStartFresh = useCallback(() => {
    clearProgress(spec.slug)
    setProgress(initProgress(spec))
    setStepIndex(0)
    setDirection(1)
  }, [spec])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && document.activeElement?.tagName === 'BODY') back()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [back])

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header bar — back | section nav | spacer */}
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
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 'welcome' && (
              <StepLayout key="welcome" stepKey="welcome" direction={direction}>
                <WelcomeStep spec={spec} onBegin={advance} />
              </StepLayout>
            )}
            {currentStep === 'assumptions' && (
              <StepLayout key="assumptions" stepKey="assumptions" direction={direction}>
                <AssumptionsStep
                  assumptions={spec.assumptions}
                  responses={progress.assumptions}
                  onChange={handleAssumptionChange}
                  onAdvance={advance}
                />
              </StepLayout>
            )}
            {currentStep === 'questions' && (
              <StepLayout key="questions" stepKey="questions" direction={direction}>
                <QuestionsStep
                  questions={spec.questions}
                  responses={progress.questions}
                  onChange={handleQuestionChange}
                  onAdvance={advance}
                />
              </StepLayout>
            )}
            {currentStep === 'flows' && (
              <StepLayout key="flows" stepKey="flows" direction={direction}>
                <FlowsStep
                  flows={spec.flows}
                  responses={progress.flows}
                  notInScope={spec.not_in_scope ?? []}
                  onChange={handleFlowChange}
                  onAdvance={advance}
                />
              </StepLayout>
            )}
            {currentStep === 'signoff' && (
              <StepLayout key="signoff" stepKey="signoff" direction={direction}>
                <SignOffStep spec={spec} progress={progress} onSignOff={handleSignOff} />
              </StepLayout>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
