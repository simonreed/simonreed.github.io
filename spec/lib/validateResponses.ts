import type { Spec, SpecProgress } from './types'

export interface ValidationResult {
  valid: boolean
  unreviewedAssumptions: string[]
  unansweredQuestions: string[]
}

export function validateResponses(spec: Spec, progress: SpecProgress): ValidationResult {
  const unreviewedAssumptions = spec.assumptions
    .filter((a) => {
      const r = progress.assumptions[a.id]
      return !r || r.status === 'unreviewed'
    })
    .map((a) => a.id)

  const unansweredQuestions = spec.questions
    .filter((q) => {
      const r = progress.questions[q.id]
      return !r || r.value.trim() === ''
    })
    .map((q) => q.id)

  return {
    valid: unreviewedAssumptions.length === 0 && unansweredQuestions.length === 0,
    unreviewedAssumptions,
    unansweredQuestions,
  }
}
