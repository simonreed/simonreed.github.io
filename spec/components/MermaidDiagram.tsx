'use client'

import { useEffect, useRef } from 'react'

interface Props {
  chart: string
}

let mermaidInitialized = false

export default function MermaidDiagram({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      const mermaid = (await import('mermaid')).default

      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#f4f4f5',
            primaryTextColor: '#18181b',
            primaryBorderColor: '#d4d4d8',
            lineColor: '#a1a1aa',
            secondaryColor: '#fafafa',
            tertiaryColor: '#f4f4f5',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '13px',
          },
          sequence: {
            actorMargin: 40,
            boxMargin: 10,
            mirrorActors: false,
          },
        })
        mermaidInitialized = true
      }

      if (!ref.current || cancelled) return

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, chart)
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg
        }
      } catch {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = '<p class="text-xs text-zinc-400 italic">Diagram unavailable</p>'
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  return (
    <div
      ref={ref}
      className="overflow-x-auto text-xs [&>svg]:max-w-full [&>svg]:h-auto"
    />
  )
}
