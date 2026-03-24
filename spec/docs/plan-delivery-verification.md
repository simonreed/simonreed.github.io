# Plan — Delivery Verification

## Executive summary

After Simon delivers a phase, Liz needs a structured way to confirm each sign-off criterion has been met — separate from the earlier spec sign-off, which confirmed intent, not delivery. This feature adds a dedicated verification flow (`VerificationClient`) that Liz works through when the spec status is `delivered`, marks each criterion as confirmed or needing attention, and submits. Success is measured by: (1) Liz can complete verification without confusion, (2) Simon receives a clear email showing exactly which items passed and which need fixing, and (3) the round-trip (fix → re-verify) works without losing context.

---

## ICPs covered

**Liz Cale (client / non-technical)** — receives the URL once work is delivered, works through a checklist of criteria, marks each as "Looks good" or "Needs attention", optionally adds comments, and submits. Liz is an occasional user (once per phase, every few weeks) who will not read instructions and wants to feel confident rather than fill in a form.

**Simon (developer / tool owner)** — creates specs in YAML including `sign_off_criteria`, can annotate individual criteria with `verified_by: simon` to pre-tick infrastructure items, controls status transitions by editing the YAML and redeploying, receives verification emails, and triggers new verification rounds by bumping `verification_round`.

---

## Data model changes

### `types.ts` additions

```typescript
// Extend SpecStatus
export type SpecStatus = 'draft' | 'awaiting-sign-off' | 'signed-off' | 'delivered' | 'verified'

// New: individual criterion item structure (replaces plain string in sign_off_criteria)
export interface SignOffCriterion {
  text: string
  verified_by?: 'client' | 'simon'  // default: 'client'
}

// New: response for a single verification criterion
export interface VerificationItemResponse {
  status: 'unchecked' | 'confirmed' | 'needs-attention'
  comment: string
}

// New: full verification session progress
export interface VerificationProgress {
  version: string        // spec.version — stale-check guard
  round: number          // spec.verification_round — round-change guard
  criteria: Record<number, VerificationItemResponse>  // index → response
  submitted: boolean
  submittedAt: string | null
  submittedBy: { name: string; email: string } | null
}
```

**`Spec` interface changes:**

```typescript
export interface Spec {
  // ...existing fields...
  sign_off_criteria?: (string | SignOffCriterion)[]  // backward-compatible: plain strings still work
  verification_round?: number   // new field, default 1 if absent
}
```

### YAML schema additions

`sign_off_criteria` items may be plain strings (existing behaviour, treated as `verified_by: client`) or objects:

```yaml
sign_off_criteria:
  - "Provider user logs in and lands on a dashboard"        # plain string → client-facing
  - text: "Database migrations ran cleanly"
    verified_by: simon                                      # pre-ticked, not shown interactively to Liz
  - text: "All outbound emails use the ADAPT-branded layout"
    verified_by: client                                     # explicit client — same as plain string
```

`verification_round` (integer, default 1 if absent):

```yaml
verification_round: 1   # bump to 2, 3, etc. to trigger a new round
```

---

## New components / files

| File | Responsibility |
|---|---|
| `spec/app/[slug]/VerificationClient.tsx` | Top-level client component for the verification flow. Mirrors `SpecClient` but manages `VerificationProgress`. Step sequence (type `VerificationStepId`): always `['welcome', 'criteria', 'submit']`, except when all criteria are Simon-verified (no client items) → `['welcome', 'submit']`, and when `sign_off_criteria` is empty → `['welcome', 'submit']` with empty-criteria message on the welcome step. If `progress.submitted === true` on load, skip the step sequence entirely and render `VerificationConfirmationScreen`. Accepts `spec: Spec`. |
| `spec/components/steps/VerificationWelcomeStep.tsx` | Welcome screen for verification mode. Shows spec title, round number, and a resume banner if saved progress is found. CTA: "Begin verification" or "Continue where you left off". |
| `spec/components/steps/CriteriaStep.tsx` | The main checklist step. Renders client-facing criteria as interactive items (✓ Looks good / ✗ Needs attention + optional comment). Renders Simon-verified criteria as locked rows ("Simon has verified this" + lock icon). Auto-saves to localStorage on each change. |
| `spec/components/steps/VerificationSubmitStep.tsx` | Pre-submit summary screen. Shows count of confirmed vs needs-attention items. Name + email fields. "Send verification" CTA. Renders soft warning if zero items confirmed. |
| `spec/components/VerificationConfirmationScreen.tsx` | Post-submission read-only screen. Shows submitter name, submission date, summary counts. No "start fresh" option. |
| `spec/components/SpecReferencePanel.tsx` | Collapsible panel available throughout verification mode. Shows spec summary, assumptions list, and flows list. Helps Liz recall what was agreed without leaving the page. |
| `spec/lib/localStorage.ts` | Extended: add `initVerificationProgress`, `loadVerificationProgress`, `saveVerificationProgress` functions using the key scheme `spec-verify-${slug}-r${round}`. |
| `spec/lib/generateVerificationMarkdown.ts` | New: generates the verification email/download markdown. Produces subject line, summary counts, full criteria table, and notes for flagged items. |
| `spec/lib/parseSignOffCriteria.ts` | New: normalises `sign_off_criteria` items — converts plain strings to `SignOffCriterion` objects, separates `client` criteria (interactive) from `simon` criteria (pre-ticked). |

---

## Changes to existing files

| File | Changes |
|---|---|
| `spec/lib/types.ts` | Add `'delivered' \| 'verified'` to `SpecStatus`. Add `SignOffCriterion`, `VerificationItemResponse`, `VerificationProgress` interfaces. Extend `Spec` with `sign_off_criteria?: (string \| SignOffCriterion)[]` (replacing `string[]`) and `verification_round?: number`. |
| `spec/app/[slug]/page.tsx` | After fetching the spec, branch on `spec.status`: `awaiting-sign-off` → render `SpecClient`; `signed-off` → render `SignedOffHoldingScreen`; `delivered` → render `VerificationClient`; `verified` → render `VerifiedHoldingScreen`; `draft` → existing 404 or draft guard. Also update `generateMetadata`: when `status === 'delivered'` return title `${spec.title} — Verification`; when `status === 'verified'` return title `${spec.title} — Verified`. |
| `spec/lib/parseSpec.ts` | No structural change required — `js-yaml` already parses object items in arrays. The `Spec` type change makes TypeScript accept the extended `sign_off_criteria` shape. |
| `spec/lib/generateMarkdown.ts` | Minor: update the sign-off checklist section to render criterion text correctly when items are `SignOffCriterion` objects (extract `.text`). |
| `spec/components/steps/SignOffStep.tsx` | Minor: update criterion rendering to handle `SignOffCriterion` objects (same `.text` extraction). |

---

## User journeys

All scenarios reference the sequence diagrams in `sequences-delivery-verification.md`.

1. **Liz — First-time verification, all criteria pass** (Sequence 1): Liz opens the URL, `SpecPage` detects `status: delivered`, renders `VerificationClient`. `loadVerificationProgress` finds no saved data; fresh `VerificationProgress` initialised. WelcomeStep shown. Liz clicks "Begin verification", proceeds to CriteriaStep, marks all items "Looks good", reaches VerificationSubmitStep, enters name/email, clicks "Send verification". Markdown generated, emailed via Cloudflare Worker, downloaded. VerificationConfirmationScreen shown.

2. **Liz — Partial verification, closes tab, returns** (Sequence 2): Liz starts, marks 6 items, closes tab. Each change triggered `saveVerificationProgress` (key: `spec-verify-phase-2-r1`). On return, `loadVerificationProgress` finds saved data with `submitted: false`. WelcomeStep shows resume banner. Liz clicks "Continue", CriteriaStep pre-populated with 6 saved responses. She completes the rest and submits.

3. **Liz — Returns after localStorage cleared** (Sequence 3): `loadVerificationProgress` returns null; `initVerificationProgress` called. No resume banner shown. Liz starts fresh. No data loss concern beyond the already-expected risk; the plan includes the private-browsing warning for this scenario.

4. **Liz — Re-verification after Simon fixes issues (round 2)** (Sequence 4): Simon bumps `verification_round: 2` in YAML and redeploys. Liz opens the URL. `VerificationClient` reads `spec.verification_round` (now 2). `loadVerificationProgress` checks key `spec-verify-phase-2-r2` — nothing found. Fresh round-2 checklist shown. Round-1 progress remains in localStorage under `spec-verify-phase-2-r1` but is never read again (no stale contamination).

5. **Simon — Pre-verifies infrastructure criteria** (Sequence 5): Simon annotates criteria in YAML with `verified_by: simon`. `parseSignOffCriteria` separates them. CriteriaStep renders client-facing criteria first (interactive), followed by a divider, then Simon-verified items as locked rows (lock icon, "Simon has verified this" label) in a distinct section below the client items. This ordering ensures Liz sees her own items first without distraction. They are included in the `VerificationProgress.criteria` record with status `'confirmed'` from initialisation and are counted in the email summary but not interactive.

6. **Liz — Accesses URL when status is `awaiting-sign-off`** (Sequence 6): `page.tsx` sees `status: awaiting-sign-off`, renders `SpecClient` (standard spec review flow). Liz sees the original sign-off journey, not the verification flow. No special message needed — the spec review is the right experience at this stage.

7. **Liz — Accesses URL when status is `signed-off`** (Sequence 7): `page.tsx` sees `status: signed-off`, renders `SignedOffHoldingScreen`: "This phase has been signed off — delivery is in progress. Simon will share a verification link when the work is ready to review." No interactive elements. This is a simple holding component, not a full step flow.

8. **Liz — Accesses URL after verification already submitted** (Sequence 8): `loadVerificationProgress` finds `submitted: true`. `VerificationClient` skips the flow entirely and renders `VerificationConfirmationScreen` directly (read-only, showing submission date and summary). No "start fresh" option — Simon controls round resets.

9. **Liz — Wants to reference the original spec during verification** (Sequence 9): `SpecReferencePanel` is rendered inside `VerificationClient` at all steps (not just CriteriaStep). A persistent "What we agreed ↕" toggle button is visible. Clicking it expands the panel in-place, showing spec summary paragraphs, assumptions list, and flows list. Closing it restores the current step. Progress is not affected by toggling the panel.

10. **Liz — Marks all criteria as "needs attention"** (Sequence 10): All client criteria marked `needs-attention`. VerificationSubmitStep detects zero confirmed count and shows a soft warning: "You haven't confirmed any items — are you sure you want to send?" with two buttons: "Yes, send anyway" and "Go back". This is a soft warning, not a block — Liz can proceed.

11. **Simon — Receives email with mixed results, fixes issues, triggers round 2** (Sequence 11): Simon receives email subject "Verification round 1: Phase 2 — Liz Cale". Markdown body shows summary (10 ✓ confirmed, 4 ✗ need attention), full criteria table, and a "Items needing attention" section with per-item notes. Simon fixes code, edits YAML (`verification_round: 2`), deploys. Next visit by Liz uses key `spec-verify-phase-2-r2`.

---

## Routing / mode detection

`page.tsx` (server component) fetches `spec` via `getSpec(slug)`, then branches:

```typescript
if (!spec) notFound()

switch (spec.status) {
  case 'draft':
  case 'awaiting-sign-off':
    return <SpecClient spec={spec} />
  case 'signed-off':
    return <SignedOffHoldingScreen spec={spec} />
  case 'delivered':
    return <VerificationClient spec={spec} />
  case 'verified':
    return <VerifiedHoldingScreen spec={spec} />
}
```

`draft` falls through to `SpecClient` so Simon can preview. If a spec has no `status` defined, treat as `draft`. All routing decisions are made server-side before any client JS runs — no client-side mode-switching.

`SignedOffHoldingScreen` is a simple server component (no client JS needed). `VerifiedHoldingScreen` shows: "This phase has been verified — Simon will be in touch about next steps." Both are static, non-interactive.

---

## localStorage strategy

**Key scheme:** `spec-verify-${slug}-r${round}`

- `slug` comes from `spec.slug`
- `round` comes from `spec.verification_round ?? 1`
- Example: `spec-verify-phase-2-r1`, `spec-verify-phase-2-r2`

**Round isolation:** Using the round number in the key means bumping `verification_round` in the YAML automatically invalidates any previously saved progress without needing to clear it. Round-1 data remains in localStorage but is never read when round 2 is active.

**Version guard (secondary):** If `spec.version` changes between the client's save and the current load (and the round has not changed), `loadVerificationProgress` checks `saved.version === spec.version`. If mismatched, treat as no saved progress. This is a secondary guard; round bumping is the primary signal for "start fresh".

**On first load:**
1. Call `loadVerificationProgress(spec)` — checks for key, validates version and round.
2. If found and `submitted: false`: show resume banner on WelcomeStep.
3. If found and `submitted: true`: skip flow, render `VerificationConfirmationScreen` immediately.
4. If not found: call `initVerificationProgress(spec)` — initialises all client criteria as `unchecked`, all Simon-verified criteria as `confirmed`.

**Auto-save:** Every change to `VerificationProgress` (criterion status/comment change) triggers `saveVerificationProgress`. Implemented via `useEffect([progress, loaded])` mirroring the existing `SpecClient` pattern.

**After submission:** `submitted: true` is persisted. `handleStartFresh` is not available in verification mode. `VerificationClient` renders the confirmation screen whenever `submitted: true`, regardless of how the page was reached.

**localStorage unavailable:** If `localStorage.setItem` throws (private browsing, storage full), the existing `try/catch` in `saveProgress` silently continues. A one-time inline warning is shown on the WelcomeStep: "Your progress won't be saved between sessions. Try to complete in one go." Detection: attempt `localStorage.setItem('_test', '1')` and `removeItem` on mount; if it throws, set `storageUnavailable: true` state.

---

## Spec reference panel

`SpecReferencePanel` is a collapsible section rendered within `VerificationClient`, available at all steps including CriteriaStep and SubmitStep.

**Trigger:** A fixed or sticky "What we agreed ↕" button (text + chevron icon). On mobile, anchored to the bottom of the viewport; on desktop, rendered inline above the step content.

**Content:** When expanded, shows:
- Spec summary (rendered as paragraphs, matching the existing WelcomeStep summary rendering)
- Assumptions list (text only, no response UI — read-only reference)
- Flows list (title + steps, no response UI)

**Implementation:** `SpecReferencePanel` receives `spec: Spec` and `isOpen: boolean` + `onToggle: () => void`. State is managed in `VerificationClient`. Panel expansion does not affect `VerificationProgress` — it is purely cosmetic/navigational.

**Purpose:** Addresses the disorientation risk when Liz is checking a criterion and cannot remember exactly what "the ADAPT-branded layout" means without re-reading the spec. The panel provides a zero-navigation answer.

---

## Language / UX tone

| Context | Text |
|---|---|
| Criterion confirmed | ✓ Looks good |
| Criterion flagged | ✗ Needs attention |
| Submit CTA | Send verification |
| Confirmation heading | Thanks [name] |
| Confirmation body | Simon will review your notes and be in touch. |
| Simon-verified row label | Simon has verified this |
| Simon-verified row icon | 🔒 (lock) |
| Resume banner | You have saved progress — continue where you left off |
| Zero-confirmed warning | You haven't confirmed any items — are you sure you want to send? |
| localStorage unavailable | Your progress won't be saved between sessions. Try to complete in one go. |
| Round indicator (WelcomeStep) | Round [N] verification (only shown if round > 1) |
| Signed-off holding screen | This phase has been signed off — delivery is in progress. Simon will share a verification link when the work is ready to review. |
| Verified holding screen | This phase has been verified — Simon will be in touch about next steps. |

Words and phrases to avoid: pass, fail, confirmed (as a user-facing verb), signed off (in verification context), submit (as the primary CTA), approved, rejected.

---

## Email / markdown output

Handled by `generateVerificationMarkdown.ts`.

**Subject line format:** `Verification round N: [spec title] — [client name]`
Example: `Verification round 1: Phase 2 — Foundations — Liz Cale`

**Markdown document structure:**

```markdown
# [spec title]
## Verification Round [N]

**Verified by:** [name] <[email]>
**Date:** [ISO timestamp]
**Spec version:** [version]
**Round:** [N]

---

## Summary

[X] of [Y] criteria confirmed. [Z] need attention.

---

## Criteria

| # | Criterion | Verified by | Result | Notes |
|---|---|---|---|---|
| 1 | Provider user logs in... | Liz | ✓ Looks good | |
| 2 | Database migrations... | Simon | ✓ Simon verified | |
| 3 | All emails use ADAPT layout... | Liz | ✗ Needs attention | Emails still using old layout |

---

## Items needing attention

### 3. All outbound emails use the ADAPT-branded layout
> Emails still using old layout
```

**Email delivery:** Same Cloudflare Worker endpoint (`https://spec-signoff-mailer.simonpreed-fe9.workers.dev`). Same `POST` payload shape: `{ subject, markdown, from_name, from_email }`. Same fire-and-forget pattern with silent `catch`.

**Download:** Markdown file also offered as download (same pattern as sign-off). Filename: `${slug}-verify-r${round}-${slugifiedName}-${date}.md`.

**X/Y count:** Y = total client-facing criteria (Simon-verified items counted separately and noted). X = count of client criteria with status `confirmed`.

---

## Round trip / re-verification flow

1. Liz submits round-1 verification. Simon receives email.
2. Simon identifies flagged items from the "Items needing attention" section.
3. Simon fixes the code issues.
4. Simon edits `phase-2.spec.yaml`: sets `verification_round: 2`. Optionally annotates newly-fixed items with `verified_by: simon` if they are infrastructure items Liz cannot verify herself.
5. Simon commits and deploys. Next.js rebuilds static pages.
6. Liz opens the same URL. `VerificationClient` reads `spec.verification_round = 2`, uses localStorage key `spec-verify-phase-2-r2`. No saved progress exists for round 2 → fresh checklist.
7. Round-2 WelcomeStep shows "Round 2 verification" label so Liz knows this is a re-check.
8. Liz completes checklist. Submits. Simon receives "Verification round 2: ..." email.
9. If all items confirmed, Simon flips `status: verified` in YAML and redeploys. `page.tsx` now renders `VerifiedHoldingScreen`.

**Simon does not need to notify Liz manually** that round 2 is ready — she opens the same URL and the UI automatically shows the fresh round. Simon may optionally send a Slack message or email out-of-band.

---

## Status transitions

```
draft
  └─→ awaiting-sign-off     (Simon edits YAML: status changes)
        └─→ signed-off      (Liz submits spec sign-off)
              └─→ delivered  (Simon delivers work, edits YAML: status: delivered)
                    └─→ verified   (Simon confirms all criteria met, edits YAML: status: verified)
                    ↑
              (verification_round bumped for round 2+)
```

All transitions are controlled exclusively by Simon editing the YAML and redeploying. Liz's actions (sign-off, verification submission) do not change the YAML status — they only affect localStorage and trigger email/download. Simon reads the email and decides whether to advance the status.

There is no automated status transition. Simon manually sets `status: verified` after reviewing a satisfactory verification submission.

---

## Error states

| Error | Handling |
|---|---|
| localStorage unavailable (private browsing) | Detect on mount via try/catch test write. Show inline warning on WelcomeStep: "Your progress won't be saved between sessions. Try to complete in one go." Allow verification to proceed — progress is held in React state for the session duration. |
| Spec not found (bad slug) | Existing `notFound()` call in `page.tsx` — renders Next.js 404 page. No change needed. |
| Email delivery failure | Silent `catch` (same as existing sign-off). Markdown download is the primary delivery mechanism and completes regardless. Simon receives download even if email fails. |
| `sign_off_criteria` missing entirely | See Edge cases: fall back to message "No checklist items defined for this phase." |
| All criteria are Simon-verified (none client-facing) | See Edge cases: show "Simon has pre-verified all items" message + direct Liz to sign-off confirmation. |
| Spec version changes without round bump | `loadVerificationProgress` detects `saved.version !== spec.version`, treats as no saved data. Liz starts fresh; no stale data shown. |
| Network failure on Worker POST | Silent `catch`. Download already triggered before fetch. No retry logic on the client (mirrors existing sign-off behaviour). |

---

## Edge cases

| Case | Handling |
|---|---|
| All criteria pre-verified by Simon | `parseSignOffCriteria` returns an empty `clientCriteria` array. `VerificationClient` skips `CriteriaStep` entirely and renders a message on `VerificationWelcomeStep`: "Simon has pre-verified all items for this phase. Nothing further is needed from you — we're ready to proceed." A single "Confirm" button advances directly to `VerificationSubmitStep` with all items pre-confirmed. |
| No `sign_off_criteria` defined in YAML | `VerificationClient` detects `spec.sign_off_criteria` is undefined or empty. Renders a message: "No checklist items have been defined for this phase." Does not show `CriteriaStep`. Does not prevent submission — Liz can still submit a verification with no criteria (zero items checked). |
| Liz submits with all items still "unchecked" | `VerificationSubmitStep` detects all client criteria have status `unchecked`. Shows soft warning: "You haven't checked any items yet — are you sure?" with "Yes, send anyway" and "Go back" options. Not a hard block — Liz can proceed. |
| Multiple browser tabs open | Last-write-wins on localStorage. Acceptable given low concurrency (one client, once per phase). No cross-tab sync implemented. |
| `verification_round` absent from YAML | Treated as `1`. Key: `spec-verify-${slug}-r1`. No migration needed — all existing specs default to round 1. |
| Simon-verified criteria count in email | The email summary distinguishes: "X of Y client criteria confirmed" and "Z criteria pre-verified by Simon". Both are included in the criteria table for full auditability. |
| Liz opens verification URL on mobile | No mobile-specific changes needed beyond ensuring `SpecReferencePanel` toggle is accessible. The panel uses the same responsive layout as existing steps. |
| spec.version changes between round 1 and round 2 | Both the version guard and the round guard trigger a fresh start. Whichever fires first wins. In practice, Simon should bump `verification_round` when redeploying fixes; a version bump alone is also acceptable as a "start fresh" signal. |

---

## Open questions

1. **`status: verified` transition — who controls it?** Currently: Simon manually sets `status: verified` in YAML after reviewing a satisfactory submission. Should there be a way for Liz's all-confirmed submission to automatically signal "ready to mark verified"? Current plan says no — Simon retains full control. Revisit if the round-trip friction proves too high.

2. **Notification to Liz that round 2 is ready** — The plan assumes Liz opens the same URL and the UI shows the new round automatically. There is no in-tool notification mechanism. Simon currently notifies Liz out-of-band (Slack, email). Is this sufficient or should the tool generate a "round 2 ready" email to Liz?

3. **Download vs email as primary** — For verification, is markdown download still the right primary delivery, or should email be primary? The current plan mirrors sign-off (download primary, email secondary/fire-and-forget). If email deliverability is a concern, consider reversing the priority.

4. **CriteriaStep layout on long checklists** — phase-2 has 14 criteria. Future phases may have more. Should criteria be paginated (one per screen, like the existing Flows step) or shown as a single scrollable list? Current plan assumes a single scrollable list: client-facing items first, then a divider ("Simon has also verified the following"), then Simon-verified locked rows at the bottom. If Liz finds this overwhelming, pagination may be preferable.

5. **Comment field visibility** — Should the comment input field for each criterion be always-visible, or only appear after selecting "Needs attention"? Current plan: comment field shown only when "Needs attention" is selected (to reduce visual noise for the happy path). Confirm this UX preference before building `CriteriaStep`.

6. **`verified` status page content** — What should `VerifiedHoldingScreen` contain beyond "this phase is verified"? Could it link to the next phase spec, or show a summary of what was built? Leaving as minimal for now.

---

## Phased delivery

### Phase A — Types + YAML schema + routing logic (no UI)

- Extend `types.ts` with new interfaces and status values
- Update `parseSpec.ts` type annotations (no logic change needed)
- Add `parseSignOffCriteria.ts`
- Update `page.tsx` routing switch
- Add stub `SignedOffHoldingScreen` and `VerifiedHoldingScreen` components (static text only)
- Add `verification_round` and `verified_by` fields to a test spec YAML
- All existing tests pass; no visible UI change for existing specs

### Phase B — VerificationClient + CriteriaStep + localStorage

- Add `initVerificationProgress`, `loadVerificationProgress`, `saveVerificationProgress` to `localStorage.ts`
- Build `VerificationWelcomeStep`, `CriteriaStep`, `VerificationSubmitStep`, `VerificationConfirmationScreen`
- Build `VerificationClient` — wires steps together, manages progress state, handles sign-off callback
- localStorage unavailable detection + warning
- Resume banner logic
- Soft warning for all-unchecked submission
- Liz can complete a full verification round end-to-end

### Phase C — Spec reference panel

- Build `SpecReferencePanel`
- Integrate into `VerificationClient`
- Panel accessible at all steps

### Phase D — Email / markdown output

- Build `generateVerificationMarkdown.ts`
- Wire into `VerificationClient.handleVerify` callback
- Download triggered on submit
- Cloudflare Worker POST with new subject format
- Verify email arrives with correct subject and formatted body

### Phase E — Round 2 flow

- Test `verification_round` bump end-to-end
- Verify localStorage key isolation between rounds
- Verify `VerificationWelcomeStep` shows "Round 2 verification" label when `round > 1`
- Test all-Simon-verified edge case
- Test no-criteria edge case
