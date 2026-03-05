'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Spec, SpecProgress, AssumptionResponse, QuestionResponse } from '@/lib/types'
import { loadProgress, saveProgress, clearProgress, initProgress } from '@/lib/localStorage'
import { generateMarkdown, generateFilename } from '@/lib/generateMarkdown'
import { validateResponses } from '@/lib/validateResponses'

import SpecHeader from '@/components/SpecHeader'
import ProgressBar from '@/components/ProgressBar'
import AssumptionList from '@/components/AssumptionList'
import QuestionList from '@/components/QuestionList'
import FlowList from '@/components/FlowList'
import NotInScope from '@/components/NotInScope'
import SignOffForm from '@/components/SignOffForm'
import ConfirmationScreen from '@/components/ConfirmationScreen'

interface Props {
  spec: Spec
}

export default function SpecClient({ spec }: Props) {
  const [progress, setProgress] = useState<SpecProgress>(() => initProgress(spec))
  const [loaded, setLoaded] = useState(false)
  const [highlights, setHighlights] = useState<{ assumptions: string[]; questions: string[] }>({
    assumptions: [],
    questions: [],
  })
  const highlightRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Load from localStorage after mount
  useEffect(() => {
    const saved = loadProgress(spec)
    setProgress(saved)
    setLoaded(true)
  }, [spec])

  // Persist on change
  useEffect(() => {
    if (loaded) saveProgress(spec.slug, progress)
  }, [progress, loaded, spec.slug])

  const totalItems = spec.assumptions.length + spec.questions.length
  const reviewedItems =
    spec.assumptions.filter((a) => progress.assumptions[a.id]?.status !== 'unreviewed').length +
    spec.questions.filter((q) => (progress.questions[q.id]?.value ?? '').trim() !== '').length

  const handleAssumptionChange = useCallback((id: string, response: AssumptionResponse) => {
    setProgress((prev) => ({
      ...prev,
      assumptions: { ...prev.assumptions, [id]: response },
    }))
    setHighlights((prev) => ({
      ...prev,
      assumptions: prev.assumptions.filter((h) => h !== id),
    }))
  }, [])

  const handleQuestionChange = useCallback((id: string, response: QuestionResponse) => {
    setProgress((prev) => ({
      ...prev,
      questions: { ...prev.questions, [id]: response },
    }))
    setHighlights((prev) => ({
      ...prev,
      questions: prev.questions.filter((h) => h !== id),
    }))
  }, [])

  const handleValidationFail = useCallback(
    (unreviewedAssumptions: string[], unansweredQuestions: string[]) => {
      setHighlights({ assumptions: unreviewedAssumptions, questions: unansweredQuestions })
      const firstId = unreviewedAssumptions[0] ?? unansweredQuestions[0]
      if (firstId) {
        const el = document.getElementById(`item-${firstId}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    []
  )

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
    setHighlights({ assumptions: [], questions: [] })
  }, [spec])

  if (!loaded) return null

  if (progress.submitted && progress.submittedBy) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <ConfirmationScreen
            name={progress.submittedBy.name}
            specTitle={spec.title}
            onDownloadAgain={() => downloadMarkdown(progress)}
            onStartFresh={handleStartFresh}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <SpecHeader spec={spec} />
        <ProgressBar reviewed={reviewedItems} total={totalItems} />
        <div id="item-assumptions">
          <AssumptionList
            assumptions={spec.assumptions}
            responses={progress.assumptions}
            highlights={highlights.assumptions}
            onChange={handleAssumptionChange}
          />
        </div>
        {spec.questions.length > 0 && (
          <div id="item-questions">
            <QuestionList
              questions={spec.questions}
              responses={progress.questions}
              highlights={highlights.questions}
              onChange={handleQuestionChange}
            />
          </div>
        )}
        <FlowList flows={spec.flows} />
        <NotInScope items={spec.not_in_scope ?? []} />
        <SignOffForm
          spec={spec}
          progress={progress}
          onSignOff={handleSignOff}
          onValidationFail={handleValidationFail}
        />
      </div>
    </div>
  )
}
