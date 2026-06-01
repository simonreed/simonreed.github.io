# Phase 4 — Building Selection & Availability
## Sign-Off Record

**Signed by:** Liz Cale <liz@adaptworkspace.com>
**Date:** 2026-05-15T09:10:46.046Z
**Spec version:** 1.0
**Output version:** 1.0-signed-20260515

---

## Assumptions

| ID | Assumption | Response | Notes |
|---|---|---|---|
| A1 | From the proposal detail page, staff can click "Add a search" to open the staff search builder scoped to that proposal. Any buildings or spaces they pick are linked to that proposal via the search. | ✓ Confirmed |  |
| A2 | The staff search builder is a single screen with a location search at the top, a list view of matching buildings on the left, and a map view on the right. The two views are synchronised — selecting a building on the map highlights it in the list, and vice versa. | ✓ Confirmed |  |
| A3 | The search results show only buildings that are published and have at least one published space. Unpublished buildings and buildings with no available spaces are hidden so staff don't accidentally include them. | ⚑ Flagged | We need to include published buildings with no available spaces as often these will be ones where they add in custom spaces themselves. Unpublished buildings should not show that is correct |
| A4 | Filters available on the search builder: location with radius (in miles), provider, amenities (multi-select with AND logic), and desk range (min and max). Filters update both the list and the map in real time. | ✓ Confirmed |  |
| A5 | Each building card in the list shows: provider logo, building name, address, distance from the search location, the number of currently available spaces, and a select/deselect toggle. | ✓ Confirmed |  |
| A6 | The map uses provider logos as the pin where a logo is available, with a fallback marker style. Clicking a pin opens a small popup with the building name, address, and a select/deselect button. | ✓ Confirmed |  |
| A7 | Staff can reorder the selected buildings within a proposal by drag-and-drop. The order stored is the order the buildings will appear in the client report. (See Q1 on default ordering.) | ✓ Confirmed |  |
| A8 | Staff can remove a selected building at any time. Removing a building also removes any space picks and ad-hoc spaces that were attached to it on this proposal — staff are warned before this happens. | ✓ Confirmed |  |
| A9 | When a building is selected, staff see all of that provider's currently published spaces in that building. Each space row shows: name, type, floor or placement, desk range, monthly cost, and availability status. Staff tick the spaces that should appear on the client report. | ✓ Confirmed |  |
| A10 | Selected database spaces are snapshotted onto the proposal at the moment of selection. If the provider later edits or removes the space, the proposal still shows the original details. Staff see a small flag on the proposal if the underlying space has changed since selection. | ✓ Confirmed |  |
| A11 | Staff can also add ad-hoc spaces that are not yet in the database — for availability the consultant has heard about directly from a provider but that hasn't been entered yet. An ad-hoc space captures: name, type, floor or placement, desk range, monthly cost, and availability status. | ✓ Confirmed |  |
| A12 | Ad-hoc spaces are clearly distinguished from database-linked spaces in the staff UI (a small "Manual" tag) so staff always know what they've added themselves vs what came from the provider's data. | ✓ Confirmed |  |
| A13 | Staff can edit any space attached to a proposal — both database-linked snapshots and ad-hoc entries. Editing a database-linked space does not affect the original; it only changes what the client sees on this proposal. | ✓ Confirmed |  |
| A14 | Staff can remove a space from a proposal at any time. For ad-hoc spaces this deletes the entry. For database-linked snapshots this just unselects them — the original space in the provider's data is untouched. | ✓ Confirmed |  |
| A15 | Pricing on ad-hoc spaces follows the same rules as Phase 3 provider pricing: cannot be negative, maximum desks (if set) must be at least the minimum, leaving pricing blank is allowed. | ✓ Confirmed |  |

---

## Flows

| ID | Flow | Response | Notes |
|---|---|---|---|
| flow-1 | Staff adds buildings to a proposal via search | ✎ Noted | Dicsussed with Chris Mahon the max buildings they can add to a proposal is 12 so need to show a warning once they reach this limit |
| flow-2 | Staff curates spaces on a selected building | ✎ Noted | Staff need to be able to add ad-hoc spaces to ones which have database spaces aswell |
| flow-3 | Staff adds an ad-hoc space | ✓ Confirmed |  |
| flow-4 | Staff reorders selected buildings within a proposal | ✓ Confirmed |  |
| flow-5 | Staff removes a building from a proposal | ✓ Confirmed |  |
| flow-6 | Staff sees a flag when underlying space data has changed | ✓ Confirmed |  |

---

## Open Questions

| ID | Question | Response |
|---|---|---|
| Q1 | On selected buildings within a proposal (A7), how should they be ordered by default before staff manually reorders? Our recommendation is by distance from the search location (closest first). Alternatives: alphabetical by building name, or selection order. | By distance from search location, closest first (our recommendation) |
| Q2 | When a proposal has multiple searches (e.g. one for Soho and one for Aldgate), should the client report combine all selected buildings into one ordered list, or group them by search? Our recommendation is one combined list — clients see a single sequence of options regardless of how staff assembled them. | One combined list, staff-orderable across all searches (our recommendation) |
| Q3 | When the underlying space data changes after staff has selected it (A10) — e.g. a provider raises the price — how should staff be notified? Our recommendation is a small flag on the staff proposal view ("3 spaces have changed since you added them") with a one-click "refresh snapshots" action. Liz can decide whether to refresh or keep the originals. | Flag + manual refresh (our recommendation) |
| Q4 | Ad-hoc spaces (A11) — should they appear in the client report mixed with database spaces, or in a separate "Additional options" section? Our recommendation is mixed — the client doesn't need to know which came from where, only what's available. | Mixed in with database spaces (our recommendation) |

---

## Sign-Off Checklist

- [x] From a proposal, staff can launch a search builder scoped to that proposal
- [x] Staff search builder shows results in synchronised list and map views
- [x] Filters work for location/radius, provider, amenities, and desk range
- [x] Search results include only published buildings with at least one published space
- [x] Building cards show provider logo, name, address, distance, available-space count, and a select toggle
- [x] Map pins use provider logos where available, with a fallback marker; clicking a pin opens a popup with select/deselect
- [x] Staff can select and deselect buildings; the count updates and the proposal's search is updated immediately
- [x] Selected buildings can be reordered by drag-and-drop; the order is preserved
- [x] Removing a building prompts for confirmation and also removes any space picks or ad-hoc entries on that building
- [x] Staff can see all of a building's currently published spaces and tick which ones go on the report
- [x] Selected database spaces are snapshotted — provider edits afterwards do not alter what's on the proposal
- [x] Staff can add ad-hoc spaces with a small form (name, type, desks, pricing, availability)
- [x] Ad-hoc spaces are visually distinguished from database-linked spaces ("Manual" tag)
- [x] Staff can edit any space attached to a proposal; edits to database-linked snapshots do not affect the original
- [x] Staff can remove a space from a proposal; ad-hoc spaces are deleted, snapshotted spaces are simply unselected
- [x] Ad-hoc space pricing follows the same rules as Phase 3 (no negatives, max desks ≥ min desks, blank pricing allowed)
- [x] Staff are alerted when underlying space data has changed since selection, with a one-click refresh option per space

---

## Not Included in This Phase

- Generating or sending PDF reports to clients — Phase 5
- Sending intro leads to provider contacts — Phase 5
- Viewing request forms on the public proposal page — Phase 5
- Provider unsubscribe flow — Phase 5
- Staff editing the underlying building data — staff are read-only on building information
- Staff publishing or unpublishing buildings or spaces — admin-only
- Custom branding per client or per proposal — the report uses the existing ADAPT style
- Saved searches that staff can rerun later — out of scope for Phase 4
- Multi-select bulk actions on selected buildings (e.g. "remove all from London")
- Comparison view side-by-side between buildings on the proposal — out of scope

---

*Signed off digitally via simonreed.co/spec/phase-4*
