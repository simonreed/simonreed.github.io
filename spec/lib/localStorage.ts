import type { Spec, SpecProgress, AssumptionStatus } from './types'

function key(slug: string): string {
  return `spec-progress-${slug}`
}

export function initProgress(spec: Spec): SpecProgress {
  return {
    version: spec.version,
    assumptions: Object.fromEntries(
      spec.assumptions.map((a) => [a.id, { status: 'unreviewed' as AssumptionStatus, comment: '' }])
    ),
    questions: Object.fromEntries(spec.questions.map((q) => [q.id, { value: '' }])),
    submitted: false,
    submittedAt: null,
    submittedBy: null,
  }
}

export function loadProgress(spec: Spec): SpecProgress {
  try {
    const raw = localStorage.getItem(key(spec.slug))
    if (!raw) return initProgress(spec)
    const saved: SpecProgress = JSON.parse(raw)
    if (saved.version !== spec.version) return initProgress(spec)
    return saved
  } catch {
    return initProgress(spec)
  }
}

export function saveProgress(slug: string, progress: SpecProgress): void {
  try {
    localStorage.setItem(key(slug), JSON.stringify(progress))
  } catch {
    // Private browsing or storage full — silently continue
  }
}

export function clearProgress(slug: string): void {
  try {
    localStorage.removeItem(key(slug))
  } catch {
    // ignore
  }
}
