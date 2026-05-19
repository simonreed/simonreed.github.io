export type QuestionType = 'choice' | 'text'
export type SpecStatus = 'draft' | 'awaiting-sign-off' | 'signed-off' | 'delivered' | 'verified'
export type AssumptionStatus = 'unreviewed' | 'confirmed' | 'flagged'

export interface SignOffCriterion {
  text: string
  verified_by?: 'client' | 'simon'
  url?: string
  note?: string
}

export interface Assumption {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  options?: string[]
}

export interface Flow {
  id: string
  title: string
  steps: string[]
  errors?: string[]
  sequence?: string
}

export interface Spec {
  slug: string
  title: string
  version: string
  date: string
  client: string
  status: SpecStatus
  summary: string
  assumptions: Assumption[]
  questions: Question[]
  flows: Flow[]
  not_in_scope?: string[]
  sign_off_criteria?: (string | SignOffCriterion)[]
  verification_round?: number
  // Criterion indices (0-based, by sign_off_criteria order) confirmed in a
  // prior verification round. Seeded as 'confirmed' server-side so a re-test
  // round only surfaces the still-open items, independent of the verifier's
  // browser localStorage.
  carried_confirmed?: number[]
}

export interface AssumptionResponse {
  status: AssumptionStatus
  comment: string
}

export interface QuestionResponse {
  value: string
}

export type FlowStatus = 'unreviewed' | 'confirmed' | 'noted'

export interface FlowResponse {
  status: FlowStatus
  comment: string
}

export interface SpecProgress {
  version: string
  assumptions: Record<string, AssumptionResponse>
  questions: Record<string, QuestionResponse>
  flows: Record<string, FlowResponse>
  submitted: boolean
  submittedAt: string | null
  submittedBy: { name: string; email: string } | null
}

export interface VerificationItemResponse {
  status: 'unchecked' | 'confirmed' | 'needs-attention'
  comment: string
}

export interface VerificationProgress {
  version: string
  round: number
  criteria: Record<number, VerificationItemResponse>
  submitted: boolean
  submittedAt: string | null
  submittedBy: { name: string; email: string } | null
}
