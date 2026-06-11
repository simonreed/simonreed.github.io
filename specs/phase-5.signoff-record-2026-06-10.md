# Phase 5 — Report Generation & Communications
## Sign-Off Record

**Signed by:** Liz Cale <liz@adaptworkspace.com>
**Date:** 2026-06-10T13:19:11.466Z
**Spec version:** 0.2
**Output version:** 0.2-signed-20260610

---

## Assumptions

| ID | Assumption | Response | Notes |
|---|---|---|---|
| A1 | From a project, staff can Preview a report (a curated search from Phase 4) as a branded client document inside ADAPT: a cover page, a page per building showing its curated spaces and amenities, and a consultant contact page. We recommend the consultant contact page shows the consultant's name, email, phone and photo. (Activates the Preview action reserved in Phase 3.) | ✓ Confirmed |  |
| A2 | Staff can Generate a PDF of the report. It is built from the Phase 4 snapshot data, so it reflects exactly what staff curated and is unaffected by later provider edits. Database-linked and ad-hoc spaces look the same to the client (the internal "Manual" tag is not shown). | ✓ Confirmed |  |
| A3 | A shareable link is generated per report. The client opens it without an ADAPT account, views the report online, and can download the PDF. | ✓ Confirmed |  |
| A4 | View and download counts are tracked. The report's status moves to Viewed the first time the client opens the link (surfaced on the project, which shows Draft / Sent / Viewed as in Phase 3/4). | ✓ Confirmed |  |
| A5 | A project can hold several reports over time (brief revisions or separate briefs). When a newer report supersedes an older one, the older share link no longer shows the old report. We recommend it shows a short message — a new report has been generated, please contact your consultant — rather than auto-redirecting to the latest report, so the consultant stays in the loop. | ✓ Confirmed |  |
| A6 | Staff send a report to the client in one action (Send to Client). The client receives a branded email (Phase 2c layout) with a link to view the report online and the option to attach the PDF. | ✓ Confirmed |  |
| A7 | Client replies go directly to the consultant who sent the report (reply-to is that consultant), not a shared inbox. | ✓ Confirmed |  |
| A8 | Every send is recorded in the Phase 2c communication log (recipient, time, status); failed sends retry automatically and the failure is visible in the log. | ✓ Confirmed |  |
| A9 | Sending updates the report/project status to Sent; opening the link later moves it to Viewed (A4). | ✓ Confirmed |  |
| A10 | Staff can select one or more buildings on a report and send intro lead emails to the relevant provider contacts in a single action. | ✓ Confirmed |  |
| A11 | Recipients are resolved automatically: a building's building-specific lead contacts first, falling back to the provider's global lead contacts if none are assigned to that building (contacts from Phase 2d/3c; only contacts flagged to receive leads). | ✓ Confirmed |  |
| A12 | The consultant who sent the lead is CC'd on every intro email. | ✓ Confirmed |  |
| A13 | The intro email includes the client's name, company, and requirements, but never the client's email or phone number. | ✓ Confirmed |  |
| A14 | A warning is shown before sending a repeat intro for the same client and building within 24 hours. | ✓ Confirmed |  |
| A15 | A history of intros sent (building, recipients, time) is visible to staff on the report/project. | ✓ Confirmed |  |
| A16 | From the shared report, the client can request a viewing on any building with no login. We recommend the request form captures the client's preferred date/time options and an optional note (rather than a bare "I'm interested"), so the consultant has enough to act on. | ✓ Confirmed |  |
| A17 | A viewing request notifies the consultant who created the report immediately by email. If that consultant's account is inactive, notification falls back to an admin; if none is available, to a default ADAPT address. | ✓ Confirmed |  |
| A18 | Viewing requests are linked to the report/project for tracking and are visible to staff. | ✓ Confirmed |  |
| A19 | Every intro lead email includes an unsubscribe link. | ⚑ Flagged | This is not required. If a provider wants to delist with us we will disable their account / unpublish their buildings |
| A20 | Clicking unsubscribe shows a confirmation page; confirming removes the contact from all future lead emails immediately, with no login. The change is reflected in the contact's lead flag (Phase 2d/3c) and the unsubscribe event is logged. | ⚑ Flagged | As above |

---

## Flows

| ID | Flow | Response | Notes |
|---|---|---|---|
| flow-1 | Staff previews and generates a report | ✓ Confirmed |  |
| flow-2 | Staff sends the report to the client | ✓ Confirmed |  |
| flow-3 | Client views the report and downloads the PDF | ✓ Confirmed |  |
| flow-4 | Client requests a viewing | ✓ Confirmed |  |
| flow-5 | Staff sends intro leads to providers | ✓ Confirmed |  |
| flow-6 | Provider contact unsubscribes from leads | ✎ Noted | Not required |
| flow-7 | Client opens a superseded report link | ✓ Confirmed |  |

---

## Sign-Off Checklist

- [x] Staff can preview a report as a branded document (cover, per-building pages with spaces + amenities, consultant contact page)
- [x] Staff can generate a PDF built from the Phase 4 snapshot (not affected by later provider edits)
- [x] Each report has a share link the client opens with no account; views and downloads are tracked
- [x] A superseded report's old link shows the "new report generated, contact your consultant" message
- [x] Staff can send a report to the client; the client gets a branded email with the link and optional PDF; replies go to the sending consultant
- [x] Report/project status moves Draft → Sent → Viewed
- [x] Staff can send intro leads for selected buildings; recipients resolve building-specific first then global fallback; consultant is CC'd
- [x] Intro emails include client name/company/requirements but never client email or phone
- [x] A 24-hour duplicate-intro warning is shown; a per-report intro history is visible to staff
- [x] Clients can request a viewing from the shared report with no login; the consultant is notified (fallback admin → default address); the request is tracked
- [x] Every intro lead has an unsubscribe link; confirming removes the contact from future leads with no login and is logged

---

## Not Included in This Phase

- Client accounts, login, or registration — clients access reports via the secure share link only
- Custom design or branding — the report uses the existing ADAPT style
- HubSpot sync for these new emails — report sends, intro leads and viewing requests are not synced to HubSpot; the existing search/lead sync is unchanged
- Client marketplace / direct anonymous client–provider messaging — a post-v2 future phase; the share-link + Phase 2c email architecture is designed to support it later
- Payment, deposits, invoicing, contracts, or confirming/scheduling the actual viewing appointment beyond capturing the request
- Changes to the existing consumer search flow or lead-capture forms
- Phase 6 work — end-to-end/integration testing, edge-case hardening, polish and production deployment (the contract's Integration & QA block)

---

*Signed off digitally via simonreed.co/spec/phase-5*
