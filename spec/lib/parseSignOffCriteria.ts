import type { Spec } from './types'

export interface ParsedCriterion {
  index: number
  text: string
  verifiedBy: 'client' | 'simon'
}

export interface ParsedCriteria {
  all: ParsedCriterion[]
  clientCriteria: ParsedCriterion[]
  simonCriteria: ParsedCriterion[]
}

export function parseSignOffCriteria(spec: Spec): ParsedCriteria {
  const raw = spec.sign_off_criteria ?? []
  const all: ParsedCriterion[] = raw.map((item, index) => {
    if (typeof item === 'string') {
      return { index, text: item, verifiedBy: 'client' }
    }
    return { index, text: item.text, verifiedBy: item.verified_by ?? 'client' }
  })

  return {
    all,
    clientCriteria: all.filter((c) => c.verifiedBy === 'client'),
    simonCriteria: all.filter((c) => c.verifiedBy === 'simon'),
  }
}
