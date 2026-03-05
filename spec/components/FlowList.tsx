import type { Flow, FlowResponse } from '@/lib/types'
import FlowItem from './FlowItem'

interface Props {
  flows: Flow[]
  responses: Record<string, FlowResponse>
  onChange: (id: string, response: FlowResponse) => void
}

export default function FlowList({ flows, responses, onChange }: Props) {
  if (flows.length === 0) return null

  return (
    <div className="flex flex-col gap-3 mb-10">
      {flows.map((f) => (
        <FlowItem
          key={f.id}
          flow={f}
          response={responses[f.id] ?? { status: 'unreviewed', comment: '' }}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
