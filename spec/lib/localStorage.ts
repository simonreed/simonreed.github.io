import type { Spec, SpecProgress, AssumptionStatus, FlowStatus, VerificationProgress, VerificationItemResponse } from './types'
import { parseSignOffCriteria } from './parseSignOffCriteria'

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
    flows: Object.fromEntries(
      spec.flows.map((f) => [f.id, { status: 'unreviewed' as FlowStatus, comment: '' }])
    ),
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

function verifyKey(slug: string, round: number): string {
  return `spec-verify-${slug}-r${round}`
}

export function initVerificationProgress(spec: Spec): VerificationProgress {
  const round = spec.verification_round ?? 1
  const { clientCriteria, simonCriteria, all } = parseSignOffCriteria(spec)
  const criteria: Record<number, VerificationItemResponse> = {}
  for (const c of all) {
    criteria[c.index] = {
      status: simonCriteria.some(s => s.index === c.index) ? 'confirmed' : 'unchecked',
      comment: '',
    }
  }
  return {
    version: spec.version,
    round,
    criteria,
    submitted: false,
    submittedAt: null,
    submittedBy: null,
  }
  // suppress unused warning
  void clientCriteria
}

export function loadVerificationProgress(spec: Spec): VerificationProgress | null {
  const round = spec.verification_round ?? 1
  try {
    const raw = localStorage.getItem(verifyKey(spec.slug, round))
    if (!raw) return null
    const saved: VerificationProgress = JSON.parse(raw)
    if (saved.version !== spec.version) return null
    if (saved.round !== round) return null
    return saved
  } catch {
    return null
  }
}

export function saveVerificationProgress(spec: Spec, progress: VerificationProgress): void {
  const round = spec.verification_round ?? 1
  try {
    localStorage.setItem(verifyKey(spec.slug, round), JSON.stringify(progress))
  } catch {
    // Private browsing or storage full — silently continue
  }
}
