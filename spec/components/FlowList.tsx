import type { Flow } from '@/lib/types'
import FlowItem from './FlowItem'

interface Props {
  flows: Flow[]
}

export default function FlowList({ flows }: Props) {
  if (flows.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-zinc-900 mb-1">Flows</h2>
      <p className="text-sm text-zinc-500 mb-4">
        Each flow describes what the system does. You can expand the sequence diagram for each one.
      </p>
      <div className="flex flex-col gap-3">
        {flows.map((f) => (
          <FlowItem key={f.id} flow={f} />
        ))}
      </div>
    </section>
  )
}
