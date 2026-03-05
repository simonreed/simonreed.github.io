# Plan — Spec Sign-Off Tool

## Executive Summary

A static Next.js app deployed to `simonreed.co/spec` that turns a YAML spec file into a slick, interactive client-facing sign-off experience. Clients confirm or flag assumptions, answer open questions, view Mermaid sequence diagrams of each flow, and formally sign off — generating a versioned, timestamped `.md` file as the output record. Success means: a client can go from receiving a URL to completing sign-off in under 10 minutes, with zero developer involvement, and the output can be dropped straight into a project repo.

---

## ICPs

| ICP | Description | Primary goal |
|---|---|---|
| Developer (Simon) | Solo dev building products for clients. Writes YAML specs in a Rails project, deploys to the tool, wants a clean sign-off record back. | Author fast, get structured responses, zero manual chasing |
| Client stakeholder (Liz Cale type) | Non-technical business decision-maker. Receives a URL, reviews what's being built, makes decisions, signs off. | Understand what they're agreeing to, raise concerns easily, feel confident about the process |

---

## YAML Spec Format (Input)

Every spec is a single YAML file stored at `specs/[slug].spec.yaml` in the `simonreed.github.io` repo. The format:

```yaml
slug: phase-1                         # URL: simonreed.co/spec/phase-1
title: "Phase 1 — User Roles & Permissions"
version: "1.0"
date: "2026-03-05"
client: "Liz Cale"
status: "awaiting-sign-off"           # awaiting-sign-off | signed-off | draft

summary: |
  Phase 1 adds staff and provider user types to the platform,
  sets up login routing, and prevents unauthorised access.
  No visible product features for end users yet.

assumptions:
  - id: A1
    text: "Staff accounts are created by ADAPT admin only. Staff cannot self-register."
  - id: A2
    text: "Provider accounts are created by ADAPT admin only. Linked to an existing provider company."

questions:
  - id: Q1
    text: "When admin creates a new account, should the login link go out immediately?"
    type: choice                        # choice | text
    options:
      - "Send immediately (our recommendation)"
      - "Admin sends manually when ready"
  - id: Q2
    text: "Login links currently expire after 20 minutes. We suggest 24 hours for welcome emails."
    type: choice
    options:
      - "24 hours (recommended)"
      - "48 hours"
      - "Keep 20 minutes"
      - "Other — I'll add a note"

flows:
  - id: flow-1
    title: "Admin creates a staff account"
    steps:
      - "Admin goes to Users → Staff"
      - "Clicks New Staff Account"
      - "Fills in first name, last name, email"
      - "Submits — account created, login link sent"
    errors:
      - "Email already in use: form error shown, not submitted"
      - "Welcome email fails: account created, warning shown, resend available"
    sequence: |
      sequenceDiagram
        Admin->>System: Fills in form and submits
        System->>Database: Creates staff user record
        System->>Email: Sends magic link to new user
        System-->>Admin: "Account created. Login link sent to [email]."

not_in_scope:
  - "Staff dashboard and features (Phase 3)"
  - "Provider portal features (Phases 2–3)"
  - "Per-building access controls within a provider company"

sign_off_criteria:
  - "Create a staff account → receive email → log in → land on staff placeholder"
  - "Create a provider account → receive email → log in → land on provider placeholder"
  - "Deactivate a staff account → confirm they cannot log in"
  - "Reactivate → confirm they can log in again"
  - "Confirm existing search user login is unchanged"
  - "Attempt restricted access → confirm redirect"
```

This format is the single source of truth. The `.md` output, the web UI, and the sign-off record are all generated from it.

---

## Output

### Generated `.md` File (downloaded by client on sign-off)

The output file captures everything needed for the project record:

```markdown
# Phase 1 — User Roles & Permissions
## Sign-Off Record

**Signed by:** Liz Cale <liz@adapt.com>
**Date:** 2026-03-05T14:32:00Z
**Spec version:** 1.0
**Output version:** 1.0-signed-20260305

---

## Assumptions

| ID | Assumption | Response | Notes |
|---|---|---|---|
| A1 | Staff accounts created by admin only | ✓ Confirmed | |
| A2 | Provider accounts created by admin only | ✓ Confirmed | |
| A3 | No limit on staff or provider accounts | ⚑ Flagged | "Maximum 10 staff accounts please" |

---

## Questions

| ID | Question | Response |
|---|---|---|
| Q1 | Login link timing | Send immediately |
| Q2 | Link expiry window | 24 hours |

---

## Sign-Off Checklist

- [x] Create staff account → receive email → log in → placeholder ✓
- [x] Create provider account → receive email → log in → placeholder ✓
...

---

*Signed off digitally via simonreed.co/spec/phase-1*
```

---

## User Journeys

### Journey 1 — Developer authors and deploys a spec

**Reference:** Sequences: Developer Happy Path, First-Time Use, Build Fails, CI/CD Pipeline

1. Developer writes `docs/plans/phase-1.spec.yaml` in Rails project using documented schema
2. Copies YAML to `specs/phase-1.spec.yaml` in `simonreed.github.io` repo
3. Commits and pushes to `master`
4. GitHub Actions builds Next.js static export (approx. 60s)
5. Spec is live at `simonreed.co/spec/phase-1`
6. Developer previews it, then sends URL to client

**Error states:**
- YAML is invalid → build fails, GHA notifies developer, previous version stays live
- Slug already exists → overwrites previous version (developer controls this intentionally)
- No `specs/` directory → build fails with clear error message in GHA logs

---

### Journey 2 — Client reviews and signs off (happy path)

**Reference:** Sequences: Client Happy Path, Client Confirms Everything, Mobile Device

1. Client opens URL received via email
2. Page loads: title, version, one-sentence summary, progress indicator
3. Client works through **Assumptions** section — each shown one at a time or as a scannable list with Confirm/Flag toggle
4. Any flagged assumption expands a comment field
5. Client works through **Open Questions** — choice selects or short text fields
6. Client views **Flows** — each flow shows steps + optional Mermaid diagram in expandable panel
7. Client reviews **Sign-Off Checklist** — reads each acceptance criterion
8. Client enters name + email, clicks "Sign Off"
9. `.md` file downloads automatically
10. Confirmation screen shown

---

### Journey 3 — Client flags assumptions and answers questions

**Reference:** Sequences: Client Flags Assumption, Client Answers Questions

- Each assumption has two actions: **Confirm** (green check) or **Flag** (amber flag + comment field)
- Flagging is non-blocking — client can flag and continue
- Questions support `choice` type (radio/button group) and `text` type (textarea)
- Both types required before sign-off is enabled
- All responses stored in component state + localStorage for persistence

---

### Journey 4 — Client partial completion and return

**Reference:** Sequences: Partial Completion Returns Later

- All responses persisted to `localStorage` keyed by spec slug + version
- On return visit, progress is restored automatically (no login required)
- A subtle "Progress saved" indicator shown after each interaction
- If spec version changes between visits, localStorage is cleared and client starts fresh (version mismatch)

---

### Journey 5 — Client validation error

**Reference:** Sequences: Validation Error

- Sign-off button is always visible but disabled until all items are reviewed
- On click of disabled button: smooth scroll to first unreviewed item, highlight in amber
- Summary bar shows: "3 assumptions and 1 question need your attention"
- Name and email fields validated: both required, email format checked client-side

---

### Journey 6 — Client already submitted (re-visit)

**Reference:** Sequences: Client Attempts to Submit Twice

- `localStorage` stores `{ submitted: true, date, name }` per spec slug
- On re-visit: read-only view shown, previous responses visible, "Signed off on [date]" banner
- "Download again" button regenerates the same `.md` output from localStorage
- "Start fresh review" clears localStorage and resets the form (for cases where a second person at the same company needs to review)

---

### Journey 7 — Spec not found

**Reference:** Sequences: Spec Not Found

- Next.js static export generates a page per spec slug at build time
- Non-existent slugs hit the Next.js `not-found` page
- Custom not-found page: clean message, "Contact Simon if you were sent a link"
- No stack traces or technical errors exposed

---

### Journey 8 — Multiple reviewers at same client

**Reference:** Sequences: Multiple Reviewers

- Tool is fully stateless — no server, no shared session
- Each person's browser has independent localStorage
- Each person gets their own downloaded `.md` file
- Developer receives both files and reconciles manually (acceptable for v1)
- No concurrent lock or "someone else is reviewing" notice needed

---

### Journey 9 — Developer updates spec after feedback

**Reference:** Sequences: Update Spec After Feedback

- Developer increments `version` in YAML (e.g. `1.0` → `1.1`)
- On client's next visit: version mismatch detected, localStorage cleared, fresh review required
- Page shows: "This spec has been updated (v1.1). Please review the changes."
- Changed/new items highlighted visually (diff markers in YAML-driven rendering)

---

### Journey 10 — Edge cases

**Reference:** Sequences: No Questions, No Diagrams, First-Time Use

| Edge case | Behaviour |
|---|---|
| Spec has no `questions` | Questions section hidden entirely, sign-off unlocks after assumptions only |
| Spec has no Mermaid in flows | Flow shows steps only, no diagram panel rendered |
| Spec has no flows | Flows section hidden |
| Spec has no `not_in_scope` | Section hidden |
| Very long spec (20+ assumptions) | All shown in scrollable list; progress bar at top tracks completion |
| Client on mobile | Full responsive layout; Mermaid diagrams scroll horizontally; touch targets ≥44px |

---

## Component Architecture (Next.js)

```
spec/
  app/
    page.tsx                        ← Index: list of all specs (or redirect)
    [slug]/
      page.tsx                      ← Spec review page (generated statically per slug)
    not-found.tsx                   ← Custom 404
  components/
    SpecHeader.tsx                  ← Title, version, client name, status badge
    AssumptionList.tsx              ← List of assumptions with Confirm/Flag controls
    AssumptionItem.tsx              ← Single assumption: text + confirm/flag + comment
    QuestionList.tsx                ← List of open questions
    QuestionItem.tsx                ← Single question: choice or text input
    FlowList.tsx                    ← List of flows
    FlowItem.tsx                    ← Flow: steps + collapsible Mermaid diagram
    MermaidDiagram.tsx              ← Client-side Mermaid renderer
    SignOffForm.tsx                 ← Name, email, sign-off button + validation
    ProgressBar.tsx                 ← X of Y items reviewed
    ConfirmationScreen.tsx          ← Post-submission confirmation
    NotInScope.tsx                  ← Collapsible not-in-scope list
  lib/
    parseSpec.ts                    ← Load and validate YAML spec at build time
    generateMarkdown.ts             ← Generate .md output from responses
    localStorage.ts                 ← Read/write progress to localStorage
    validateResponses.ts            ← Pre-submission validation logic
  specs/
    phase-1.spec.yaml               ← Spec files live here
```

### Static generation

At build time, `generateStaticParams` reads all files in `specs/` and generates one page per slug. No runtime server required — purely static.

```ts
// app/[slug]/page.tsx
export async function generateStaticParams() {
  const specs = fs.readdirSync('specs').filter(f => f.endsWith('.spec.yaml'))
  return specs.map(f => ({ slug: f.replace('.spec.yaml', '') }))
}
```

---

## Data Model

No database. All state is:

| Store | What | Where |
|---|---|---|
| Build-time | Spec content (assumptions, questions, flows) | YAML file → static props |
| Client-side runtime | Review progress (confirmed/flagged/answered) | React state + localStorage |
| Output | Signed-off record with all responses | Generated `.md` file (downloaded) |

localStorage schema (per spec):

```json
{
  "phase-1": {
    "version": "1.0",
    "assumptions": {
      "A1": { "status": "confirmed", "comment": "" },
      "A3": { "status": "flagged", "comment": "Max 10 accounts please" }
    },
    "questions": {
      "Q1": { "value": "Send immediately" },
      "Q2": { "value": "24 hours" }
    },
    "submitted": false,
    "submittedAt": null,
    "submittedBy": { "name": "", "email": "" }
  }
}
```

---

## TypeScript Types

```ts
// lib/types.ts

export type QuestionType = 'choice' | 'text'

export interface Assumption {
  id: string        // e.g. "A1"
  text: string
}

export interface Question {
  id: string        // e.g. "Q1"
  text: string
  type: QuestionType
  options?: string[]  // required when type === 'choice'
}

export interface FlowStep {
  text: string
}

export interface Flow {
  id: string        // e.g. "flow-1"
  title: string
  steps: string[]
  errors?: string[]
  sequence?: string  // raw Mermaid sequenceDiagram string
}

export interface Spec {
  slug: string
  title: string
  version: string
  date: string
  client: string
  status: 'draft' | 'awaiting-sign-off' | 'signed-off'
  summary: string
  assumptions: Assumption[]
  questions: Question[]
  flows: Flow[]
  not_in_scope?: string[]
  sign_off_criteria?: string[]
}

// localStorage state types
export type AssumptionStatus = 'unreviewed' | 'confirmed' | 'flagged'

export interface AssumptionResponse {
  status: AssumptionStatus
  comment: string
}

export interface QuestionResponse {
  value: string  // selected option or typed text
}

export interface SpecProgress {
  version: string
  assumptions: Record<string, AssumptionResponse>
  questions: Record<string, QuestionResponse>
  submitted: boolean
  submittedAt: string | null  // ISO 8601
  submittedBy: { name: string; email: string } | null
}
```

---

## generateMarkdown Specification

```ts
// lib/generateMarkdown.ts
export function generateMarkdown(spec: Spec, progress: SpecProgress): string
```

**Mapping logic:**

1. Header: `# {spec.title}\n## Sign-Off Record`
2. Metadata block: signed-by name/email, date (ISO), spec version, output version (`{version}-signed-{YYYYMMDD}`)
3. Assumptions table: one row per assumption — `id | text | status emoji | comment`
   - confirmed → `✓ Confirmed`
   - flagged → `⚑ Flagged`
4. Questions table: one row per question — `id | question text | response value`
5. Sign-off checklist: each `sign_off_criteria` item as `- [x] {text}`
6. Not in scope: each `not_in_scope` item as a bullet, under `## Not Included`
7. Footer: `*Signed off digitally via simonreed.co/spec/{slug}*`

Output is a plain UTF-8 string. Filename: `{slug}-v{version}-{slugified-name}-{YYYYMMDD}.md`

---

## Integration Points

| Integration | How |
|---|---|
| Mermaid.js | Client-side only. `MermaidDiagram.tsx` must be wrapped in `dynamic(() => import(...), { ssr: false })` at the call site to prevent Next.js App Router SSR hydration mismatch. The component calls `mermaid.initialize()` once on mount via `useEffect`, then renders the diagram into a `<div>` ref using `mermaid.render()`. |
| js-yaml | Used at build time in `parseSpec.ts` to parse YAML into typed objects |
| Framer Motion | Page transitions, assumption reveal animations, confirmation screen |
| localStorage | Browser API, wrapped in `lib/localStorage.ts` with try/catch for private browsing |
| GitHub Actions | Builds and deploys on push to master; `workflow_dispatch` for manual triggers |
| File download | `generateMarkdown.ts` produces a string; `Blob` + `URL.createObjectURL` triggers download |

No external API calls at runtime. No analytics, no tracking, no server.

---

## Error States

| Error | Handling |
|---|---|
| YAML parse failure at build time | Build fails; GHA surfaces error; previous deployment stays live |
| Invalid spec schema (missing required fields) | Build-time validation in `parseSpec.ts` throws with field path |
| Mermaid render failure | Caught in `MermaidDiagram.tsx`; shows "Diagram unavailable" placeholder |
| localStorage unavailable (private browsing) | Wrapped in try/catch; progress not saved, user warned once |
| File download blocked (mobile Safari) | Falls back to opening `.md` content in a new tab |
| Spec not found (unknown slug) | Custom not-found page |
| Version mismatch (localStorage vs YAML) | Clears localStorage, shows "spec has been updated" notice |
| Name/email missing on sign-off | Inline validation, scroll to field |
| Email format invalid | Client-side regex validation before submit |

---

## Open Questions

**OQ1.** Should the index page (`simonreed.co/spec`) list all specs, or redirect/show nothing? (Specs may be client-confidential — listing them may not be desirable.)

**OQ2.** Should the developer be notified when a client signs off? If so, how — email via a serverless function, or is the downloaded `.md` file sufficient?

**OQ3.** Should the tool support a `draft` status that renders a watermark and blocks sign-off? Useful for sharing a work-in-progress spec for early feedback.

**OQ4.** Is there a copy-to-clipboard option needed for the `.md` output, in addition to or instead of download? (Some mobile browsers block downloads.)

**OQ5.** ~~Should flagged assumptions block sign-off?~~ **Resolved: non-blocking.** Flagging is the client's mechanism to raise a concern. Blocking sign-off would prevent the record from being created. Flagged items are clearly surfaced in the output `.md` for the developer to act on.

---

## Phased Delivery

### Phase A — Foundation (PoC → Real)
- YAML schema defined and documented
- `parseSpec.ts` with build-time validation
- Static page generation per slug
- `SpecHeader`, `AssumptionList`, `QuestionList` rendering (read-only)
- Basic Tailwind styling

### Phase B — Interactivity
- Confirm/Flag controls on assumptions with comment fields
- Question inputs (choice + text)
- `localStorage` persistence
- Progress bar and completion tracking

### Phase C — Flows + Diagrams
- `FlowList` + `FlowItem` with collapsible steps
- `MermaidDiagram` client-side rendering with Framer Motion reveal
- Not-in-scope and sign-off checklist sections

### Phase D — Sign-Off + Output
- `SignOffForm` with validation
- `generateMarkdown.ts` producing full output `.md`
- File download (with mobile fallback)
- Confirmation screen
- Version mismatch detection + localStorage reset

### Phase E — Polish
- Framer Motion page transitions and micro-interactions
- Mobile optimisation pass
- Custom not-found page
- Index page decision (OQ1)
- `workflow_dispatch` + local validation script
