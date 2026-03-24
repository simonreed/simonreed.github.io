# Sequence Diagrams — Delivery Verification

These diagrams cover all permutations of the delivery verification flow for the spec sign-off tool.

---

## Liz — First-time verification, all criteria pass, submits

> Liz opens the delivered spec URL for the first time, works through all criteria marking each as "Looks good", and submits.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser
  participant LS as localStorage
  participant Worker as Cloudflare Worker

  Liz->>Browser: Opens /spec/phase-2 (status: delivered)
  Browser->>LS: Check spec-verify-phase-2-r1
  LS-->>Browser: No saved progress
  Browser-->>Liz: VerificationClient — WelcomeStep (fresh start)
  Liz->>Browser: Clicks "Begin verification"
  Browser-->>Liz: CriteriaStep — 14 checklist items (client-facing only)
  loop For each criterion
    Liz->>Browser: Marks criterion ✓ Looks good
    Browser->>LS: Save progress (spec-verify-phase-2-r1)
  end
  Browser-->>Liz: All 14 items confirmed — SubmitStep
  Liz->>Browser: Enters name + email, clicks "Send verification"
  Browser->>LS: Save progress (submitted: true)
  Browser->>Worker: POST {subject, markdown, from_name, from_email}
  Worker-->>Browser: 200 OK (fire-and-forget)
  Browser-->>Liz: ConfirmationScreen — "Thanks Liz — Simon will review your notes and be in touch."
```

---

## Liz — Partial verification (some pass, some "needs attention"), closes tab, returns later

> Liz starts verification, marks some items, closes the tab, then returns and resumes from saved progress.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser
  participant LS as localStorage

  Liz->>Browser: Opens /spec/phase-2 (status: delivered)
  Browser->>LS: Check spec-verify-phase-2-r1
  LS-->>Browser: No saved progress
  Browser-->>Liz: WelcomeStep (fresh start)
  Liz->>Browser: Begins verification
  Browser-->>Liz: CriteriaStep
  Liz->>Browser: Marks 6 of 14 items (mix of ✓ Looks good / ✗ Needs attention)
  Browser->>LS: Auto-save after each change
  Liz->>Browser: Closes tab

  Note over Liz,Browser: Time passes — Liz returns

  Liz->>Browser: Re-opens /spec/phase-2
  Browser->>LS: Check spec-verify-phase-2-r1
  LS-->>Browser: Saved progress found (6 items marked, not submitted)
  Browser-->>Liz: WelcomeStep with resume banner: "You have saved progress — continue where you left off"
  Liz->>Browser: Clicks "Continue"
  Browser-->>Liz: CriteriaStep — pre-populated with 6 saved responses
  Liz->>Browser: Completes remaining 8 items
  Browser-->>Liz: SubmitStep
  Liz->>Browser: Submits
  Browser-->>Liz: ConfirmationScreen
```

---

## Liz — Returns after localStorage cleared (progress lost, starts fresh)

> Liz had partial progress, but localStorage was cleared (e.g. browser data wipe). She starts over from scratch.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser
  participant LS as localStorage

  Note over Liz,LS: Liz had partial progress previously, but localStorage was cleared

  Liz->>Browser: Re-opens /spec/phase-2
  Browser->>LS: Check spec-verify-phase-2-r1
  LS-->>Browser: Nothing found (cleared)
  Browser-->>Liz: WelcomeStep — fresh start (no resume banner)
  Liz->>Browser: Begins verification from scratch
  Browser-->>Liz: CriteriaStep — all items unchecked
  Liz->>Browser: Works through all criteria again
  Browser-->>Liz: SubmitStep
  Liz->>Browser: Submits
  Browser-->>Liz: ConfirmationScreen
```

---

## Liz — Re-verification after Simon fixes issues (round 2)

> Simon received Liz's round-1 verification with flagged items, fixed the issues, bumped `verification_round` to 2 in the YAML, and redeployed. Liz returns to the same URL.

```mermaid
sequenceDiagram
  actor Liz
  actor Simon
  participant YAML as phase-2.spec.yaml
  participant Browser
  participant LS as localStorage
  participant Worker as Cloudflare Worker

  Note over Liz,LS: Round 1 already submitted — spec-verify-phase-2-r1 exists in localStorage

  Simon->>YAML: Fixes issues, bumps verification_round: 2, redeploys
  Liz->>Browser: Opens /spec/phase-2
  Browser->>LS: Check spec-verify-phase-2-r2 (new round key)
  LS-->>Browser: No saved progress for round 2
  Browser-->>Liz: WelcomeStep — "Round 2 verification" (fresh start, no stale data)
  Liz->>Browser: Begins verification
  Browser-->>Liz: CriteriaStep — all items unchecked
  Liz->>Browser: Marks all 14 items ✓ Looks good
  Browser-->>Liz: SubmitStep
  Liz->>Browser: Submits
  Browser->>Worker: POST {subject: "Verification round 2: Phase 2 — Liz Cale", ...}
  Worker-->>Browser: 200 OK
  Browser-->>Liz: ConfirmationScreen
```

---

## Simon — Pre-verifies infrastructure criteria in YAML

> Simon annotates certain sign_off_criteria items with `verified_by: simon` in the YAML before sending the URL to Liz. Those items are pre-ticked and hidden from Liz's checklist.

```mermaid
sequenceDiagram
  actor Simon
  participant YAML as phase-2.spec.yaml
  participant Server as Next.js (build)
  actor Liz
  participant Browser

  Simon->>YAML: Annotates infrastructure criteria with verified_by: simon
  Simon->>Server: Redeploys / rebuilds
  Server->>YAML: parseSpec() — reads verified_by field per criterion
  Liz->>Browser: Opens /spec/phase-2
  Browser-->>Liz: WelcomeStep
  Liz->>Browser: Begins verification
  Browser-->>Liz: CriteriaStep — simon-verified items shown as locked ("Simon has verified this") and pre-confirmed; client items shown as interactive
  Note over Liz,Browser: Liz only sees and interacts with her items
  Liz->>Browser: Marks client-facing items
  Browser-->>Liz: SubmitStep
  Liz->>Browser: Submits
```

---

## Liz — Accesses URL when status is `awaiting-sign-off` (spec review mode)

> The URL is shared before delivery is confirmed. The spec is still in `awaiting-sign-off` status, so the standard SpecClient review flow is shown — not the verification flow.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser
  participant Server as Next.js

  Liz->>Browser: Opens /spec/phase-2 (status: awaiting-sign-off)
  Browser->>Server: GET /spec/phase-2
  Server-->>Browser: spec.status === "awaiting-sign-off"
  Browser-->>Liz: SpecClient (standard spec review flow — not VerificationClient)
  Note over Liz,Browser: Liz sees the original spec review, assumptions, flows, sign-off step
```

---

## Liz — Accesses URL when status is `signed-off` (not yet delivered)

> The spec has been signed off but Simon has not yet deployed the delivered work. Liz sees a "not yet delivered" holding screen.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser
  participant Server as Next.js

  Liz->>Browser: Opens /spec/phase-2 (status: signed-off)
  Browser->>Server: GET /spec/phase-2
  Server-->>Browser: spec.status === "signed-off"
  Browser-->>Liz: Holding screen: "This phase has been signed off — delivery is in progress. Simon will share a verification link when the work is ready to review."
```

---

## Liz — Accesses URL after verification is fully complete (already submitted)

> Liz has already submitted her verification. If she returns to the URL, she sees a read-only confirmation screen.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser
  participant LS as localStorage

  Liz->>Browser: Re-opens /spec/phase-2 (status: delivered)
  Browser->>LS: Check spec-verify-phase-2-r1
  LS-->>Browser: Saved progress found (submitted: true)
  Browser-->>Liz: ConfirmationScreen (read-only) — "You submitted your verification on [date]. Simon will review your notes and be in touch."
  Note over Liz,Browser: No option to re-submit or start fresh — Simon controls round resets
```

---

## Liz — Wants to reference the original spec while doing verification

> Liz is mid-checklist and wants to remind herself what was agreed before marking a criterion.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser

  Liz->>Browser: Is on CriteriaStep, unsure about a criterion
  Liz->>Browser: Clicks "What we agreed" panel / toggle
  Browser-->>Liz: Collapsible panel expands — shows spec summary, assumptions, flows
  Liz->>Browser: Reads the relevant section
  Liz->>Browser: Closes panel
  Browser-->>Liz: Returns focus to CriteriaStep — saved progress intact
  Liz->>Browser: Marks criterion
```

---

## Liz — Marks all criteria as "needs attention" (worst-case)

> Liz is unhappy with everything. She marks all client-facing criteria as "Needs attention" and submits.

```mermaid
sequenceDiagram
  actor Liz
  participant Browser
  participant LS as localStorage
  participant Worker as Cloudflare Worker

  Liz->>Browser: Opens /spec/phase-2, begins verification
  Browser-->>Liz: CriteriaStep
  loop For each client criterion
    Liz->>Browser: Marks criterion ✗ Needs attention
    Liz->>Browser: (Optionally) adds comment
    Browser->>LS: Auto-save progress
  end
  Browser-->>Liz: SubmitStep — shows summary: "0 confirmed, 14 need attention"
  Liz->>Browser: Enters name + email
  Liz->>Browser: Clicks "Send verification"
  Browser-->>Liz: Soft warning: "You haven't confirmed any items — are you sure you want to send?"
  Liz->>Browser: Confirms send
  Browser->>LS: Save (submitted: true)
  Browser->>Worker: POST — full markdown with all items flagged
  Worker-->>Browser: 200 OK
  Browser-->>Liz: ConfirmationScreen
```

---

## Simon — Receives verification email with mixed results, fixes issues, flips YAML for round 2

> Simon gets the email showing 10 confirmed and 4 needing attention, fixes the code, updates the YAML, and triggers a new verification round.

```mermaid
sequenceDiagram
  actor Simon
  participant Email as Email Inbox
  participant YAML as phase-2.spec.yaml
  participant Repo as Git / Deployment

  Email-->>Simon: "Verification round 1: Phase 2 — Liz Cale" email arrives
  Simon->>Email: Reviews markdown — sees 10 ✓ confirmed, 4 ✗ needs attention with notes
  Simon->>Repo: Fixes the 4 flagged issues in code
  Simon->>YAML: Sets verification_round: 2, optionally annotates fixed criteria with verified_by: simon
  Simon->>Repo: Commits and deploys
  Note over Simon,Repo: Next.js rebuilds — spec now has verification_round: 2

  Note over Simon: Simon shares URL with Liz again (or Liz checks same URL)
  Note over Simon: VerificationClient detects round 2, shows fresh checklist
```
