import type { Spec, VerificationProgress } from './types'
import { parseSignOffCriteria } from './parseSignOffCriteria'

function slugifyName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function formatDate(iso: string): string {
  return iso.split('T')[0]
}

export function generateVerificationMarkdown(spec: Spec, progress: VerificationProgress): string {
  const now = progress.submittedAt ?? new Date().toISOString()
  const dateStr = formatDate(now)
  const name = progress.submittedBy?.name ?? ''
  const email = progress.submittedBy?.email ?? ''
  const round = progress.round

  const { all, clientCriteria, simonCriteria } = parseSignOffCriteria(spec)

  const confirmedCount = clientCriteria.filter(
    (c) => progress.criteria[c.index]?.status === 'confirmed'
  ).length
  const needsAttentionCount = clientCriteria.filter(
    (c) => progress.criteria[c.index]?.status === 'needs-attention'
  ).length
  const totalClient = clientCriteria.length

  const lines: string[] = [
    `# ${spec.title}`,
    `## Verification Round ${round}`,
    ``,
    `**Verified by:** ${name} <${email}>`,
    `**Date:** ${now}`,
    `**Spec version:** ${spec.version}`,
    `**Round:** ${round}`,
    ``,
    `---`,
    ``,
    `## Summary`,
    ``,
    `${confirmedCount} of ${totalClient} criteria confirmed. ${needsAttentionCount} need${needsAttentionCount === 1 ? 's' : ''} attention.`,
  ]

  if (simonCriteria.length > 0) {
    lines.push(`${simonCriteria.length} criteria pre-verified by Simon.`)
  }

  lines.push(``, `---`, ``, `## Criteria`, ``)
  lines.push(`| # | Criterion | Verified by | Result | Notes |`)
  lines.push(`|---|---|---|---|---|`)

  for (const c of all) {
    const r = progress.criteria[c.index]
    const verifiedByLabel = c.verifiedBy === 'simon' ? 'Simon' : name || 'Client'
    let result: string
    if (c.verifiedBy === 'simon') {
      result = '✓ Simon verified'
    } else {
      result =
        r?.status === 'confirmed'
          ? '✓ Looks good'
          : r?.status === 'needs-attention'
          ? '✗ Needs attention'
          : '— Not checked'
    }
    const comment = r?.comment ?? ''
    lines.push(
      `| ${c.index + 1} | ${c.text.replace(/\|/g, '\\|')} | ${verifiedByLabel} | ${result} | ${comment} |`
    )
  }

  const flaggedItems = clientCriteria.filter(
    (c) => progress.criteria[c.index]?.status === 'needs-attention' && progress.criteria[c.index]?.comment
  )

  if (flaggedItems.length > 0) {
    lines.push(``, `---`, ``, `## Items needing attention`, ``)
    for (const c of flaggedItems) {
      const comment = progress.criteria[c.index]?.comment ?? ''
      lines.push(`### ${c.index + 1}. ${c.text}`)
      lines.push(`> ${comment}`)
      lines.push(``)
    }
  }

  lines.push(`---`, ``, `*Verified digitally via simonreed.co/spec/${spec.slug}*`, ``)

  return lines.join('\n')
}

export function generateVerificationFilename(spec: Spec, progress: VerificationProgress): string {
  const name = slugifyName(progress.submittedBy?.name ?? 'unsigned')
  const date = formatDate(progress.submittedAt ?? new Date().toISOString()).replace(/-/g, '')
  const round = progress.round
  return `${spec.slug}-verify-r${round}-${name}-${date}.md`
}

export function generateVerificationSubject(spec: Spec, progress: VerificationProgress): string {
  const name = progress.submittedBy?.name ?? 'Unknown'
  return `Verification round ${progress.round}: ${spec.title} — ${name}`
}
