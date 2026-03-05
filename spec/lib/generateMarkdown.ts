import type { Spec, SpecProgress } from './types'

function slugifyName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function formatDate(iso: string): string {
  return iso.split('T')[0]
}

export function generateMarkdown(spec: Spec, progress: SpecProgress): string {
  const now = progress.submittedAt ?? new Date().toISOString()
  const dateStr = formatDate(now)
  const name = progress.submittedBy?.name ?? ''
  const email = progress.submittedBy?.email ?? ''

  const lines: string[] = [
    `# ${spec.title}`,
    `## Sign-Off Record`,
    ``,
    `**Signed by:** ${name} <${email}>`,
    `**Date:** ${now}`,
    `**Spec version:** ${spec.version}`,
    `**Output version:** ${spec.version}-signed-${dateStr.replace(/-/g, '')}`,
    ``,
    `---`,
    ``,
    `## Assumptions`,
    ``,
    `| ID | Assumption | Response | Notes |`,
    `|---|---|---|---|`,
  ]

  for (const assumption of spec.assumptions) {
    const r = progress.assumptions[assumption.id]
    const status = r?.status === 'confirmed' ? '✓ Confirmed' : r?.status === 'flagged' ? '⚑ Flagged' : '— Not reviewed'
    const comment = r?.comment ?? ''
    lines.push(`| ${assumption.id} | ${assumption.text.replace(/\|/g, '\\|')} | ${status} | ${comment} |`)
  }

  if (spec.flows.length > 0) {
    lines.push(``, `---`, ``, `## Flows`, ``, `| ID | Flow | Response | Notes |`, `|---|---|---|---|`)
    for (const flow of spec.flows) {
      const r = progress.flows?.[flow.id]
      const status = r?.status === 'confirmed' ? '✓ Confirmed' : r?.status === 'noted' ? '✎ Noted' : '— Not reviewed'
      const comment = r?.comment ?? ''
      lines.push(`| ${flow.id} | ${flow.title.replace(/\|/g, '\\|')} | ${status} | ${comment} |`)
    }
  }

  if (spec.questions.length > 0) {
    lines.push(``, `---`, ``, `## Open Questions`, ``, `| ID | Question | Response |`, `|---|---|---|`)
    for (const question of spec.questions) {
      const r = progress.questions[question.id]
      const value = r?.value ?? '— Not answered'
      lines.push(`| ${question.id} | ${question.text.replace(/\|/g, '\\|')} | ${value} |`)
    }
  }

  if (spec.sign_off_criteria && spec.sign_off_criteria.length > 0) {
    lines.push(``, `---`, ``, `## Sign-Off Checklist`, ``)
    for (const criterion of spec.sign_off_criteria) {
      lines.push(`- [x] ${criterion}`)
    }
  }

  if (spec.not_in_scope && spec.not_in_scope.length > 0) {
    lines.push(``, `---`, ``, `## Not Included in This Phase`, ``)
    for (const item of spec.not_in_scope) {
      lines.push(`- ${item}`)
    }
  }

  lines.push(``, `---`, ``, `*Signed off digitally via simonreed.co/spec/${spec.slug}*`, ``)

  return lines.join('\n')
}

export function generateFilename(spec: Spec, progress: SpecProgress): string {
  const name = slugifyName(progress.submittedBy?.name ?? 'unsigned')
  const date = formatDate(progress.submittedAt ?? new Date().toISOString()).replace(/-/g, '')
  return `${spec.slug}-v${spec.version}-${name}-${date}.md`
}
