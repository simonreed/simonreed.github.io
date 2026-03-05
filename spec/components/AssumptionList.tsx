'use client'

import type { Assumption, AssumptionResponse } from '@/lib/types'
import AssumptionItem from './AssumptionItem'

interface Props {
  assumptions: Assumption[]
  responses: Record<string, AssumptionResponse>
  highlights?: string[]
  onChange: (id: string, response: AssumptionResponse) => void
}

export default function AssumptionList({ assumptions, responses, highlights = [], onChange }: Props) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-zinc-900 mb-1">Assumptions</h2>
      <p className="text-sm text-zinc-500 mb-4">
        Please confirm each of these or flag it if something needs to change.
      </p>
      <div className="flex flex-col gap-3">
        {assumptions.map((a) => (
          <AssumptionItem
            key={a.id}
            assumption={a}
            response={responses[a.id] ?? { status: 'unreviewed', comment: '' }}
            highlight={highlights.includes(a.id)}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  )
}
