# apps/web — Todo

The desktop front-desk client's slice of [implementation.md](../implementation.md) — read that first for phase goals and definitions of done. Check items off as they land; when every item in a phase is checked across all the apps it touches, mark that phase done in `implementation.md`'s status table.

## Phase 0 — Foundation

- [x] Login screen + session handling (TanStack Query against BetterAuth endpoints)
- [x] Route auth guard (redirect to login when unauthenticated)
- [x] Current-hotel Zustand store

## Phase 1 — Hotels & Roles

- [x] Hotel management screen (create/edit hotel, owner only)
- [x] Hotel switcher UI
- [x] Role-gated navigation (hide/disable modules the current role can't access)
- [x] Staff Management screen (`/staff`, owner_admin only) — roster (name/avatar/role/phone/status/shift), search + role filter, invite-based "Add Staff Member" flow, edit role/phone/status, suspend/reactivate, on-duty toggle, remove, pending-invite rows with cancel (2026-07-01, shipped ahead of `implementation.md`'s original phasing)
- [x] Payroll screen (`/payroll`, owner_admin + accountant) — month picker, stat cards (total/pending/paid/deductions), roster with base salary/adjustments/net payable/payment status, "Set Salary" and "Run Payroll" actions, per-entry payslip/edit dialog, quick "Pay" action, CSV export (2026-07-01, shipped immediately after Staff Management)
- [x] Sidebar active nav item now highlighted with the primary color (`sidebar-primary` token) instead of the neutral `sidebar-accent` — the token already existed in `index.css` for this exact purpose but `ui/sidebar.tsx`'s `data-active` styling wasn't using it
- [x] Settings screen (`/settings`, owner_admin) — vertical sub-nav (General/Room Types/Users & Roles/Notifications/Billing & Plan) via `Tabs orientation="vertical"`. General is a new Hotel Profile + Operational Preferences form (name/address/phone/email/website, currency/timezone — the last four are new `Hotel` fields added server-side for this, see server's `todo.md` Phase 1 note). Room Types and Users & Roles tabs reuse the existing `RoomTypesTab`/`StaffTable` components as-is rather than duplicating them. Notifications/Billing & Plan are `ComingSoon` placeholders — no backend concept for either yet (2026-07-01)

## Phase 2 — Rooms & Room Types

- [x] RxDB `rooms` and `room-types` collections wired in `src/lib/db.ts`, with replication against the server
- [x] Room type management screen
- [x] Room board/grid view with live status (Available/Occupied/Cleaning/Maintenance), subscribed to WebSocket updates (now via RxDB's reactive queries, socket-triggered resync replacing the old direct `roomStatusChanged` invalidation)
- [x] Room notes UI (damage/issues)

## Phase 3 — Guests & Front Desk

- [x] RxDB `guests` and `stays` collections
- [x] Guest search (name/phone) + profile/stay-history view — `routes/_authenticated/guests.tsx` now lists guests (RxDB-backed search/stats joined against `stays`) with a detail sheet (`guest-detail-sheet.tsx`, REST via `useGuest`) showing stay history and notes; add/edit guest dialog and add-note form are wired to existing/new hooks
- [x] Check-in flow (assign room to guest)
- [x] Extend stay / move room flows (now RxDB-backed — optimistic local writes, offline-capable; check-in/check-out stay REST-only, see server's `todo.md` Phase 8 note)
- [x] Check-out flow
- [x] Payment entry (cash/transfer/POS) + outstanding balance display
- [x] Reservations & events calendar — monthly/weekly view showing reservations, expected check-ins, expected check-outs, and room blocks; clicking an event opens the relevant detail panel — `routes/_authenticated/calendar.tsx`, reusing existing reservation/stay/room data (no new endpoints needed: reservations and rooms already return full unfiltered lists, filtered client-side by day); "room blocks" surfaced as rooms in `maintenance` status (the existing block mechanism — see `room-card.tsx`), not a new date-ranged model

## Phase 4 — Inventory

- [x] Inventory item list per category
- [x] Stock-in / stock-out forms (reason + staff attribution)
- [x] Low-stock indicator/view

## Phase 5 — Reporting

- [x] Daily operations report screen (check-ins/outs, occupancy, revenue, inventory usage)
- [x] Printable/exportable view (browser print via Cmd+P / Ctrl+P)
- [x] Redesigned report screen: Today/Yesterday/This Week/This Month period tabs, revenue breakdown by payment method, room status snapshot bar, attendance issues card, inventory alerts card, Download PDF (reuses the browser print dialog's "Save as PDF" — no PDF-rendering dependency added)

## Phase 6 — Audit & Accountability

- [x] Audit log viewer (owner/admin only) — `routes/_authenticated/audit-logs.tsx`, gated via the existing nav-role pattern (server's `HotelAccessGuard` is the real enforcement)

## Phase 8 — Sync & Offline Hardening

- [ ] Verify RxDB replication survives offline/online transitions in a real browser — implemented (rooms/room-types/guests/stays collections + pull/push/resync wiring) and confirmed via `tsc -b`, lint, `vite build`, and a dev-server boot smoke test, but NOT yet exercised in an actual browser (devtools offline toggle, two-tab conflict scenario) — do this before shipping
- [x] Conflict UI/handling per the resolution policy decided in `tech_stack.md` — no dedicated UI: the server performs the real field-level merge and returns the merged doc, RxDB's default conflict handler (master-always-wins) applies it client-side, so the client never needs to render a conflict-resolution prompt. A "your edit was overridden" toast is a deferred fast-follow, not built this pass

## Phase 9 — Deployment readiness

- [ ] Production build + static hosting deploy

## Testing

- [ ] Add Vitest + Testing Library (`pnpm add -D vitest @testing-library/react jsdom`) once there's real component/hook logic worth testing

## Phase 10 — Attendance & Shift Tracking

- [ ] Shift definition screen (create/edit morning/afternoon/night templates)
- [ ] Shift assignment UI (assign a shift to a staff member for a given day)
- [ ] Staff self clock-in/clock-out UI
- [ ] Manual clock-entry correction UI (owner/manager, required reason)

The report screen (Phase 5 above) already reads the daily report's `staffAttendance` field, but nothing in web can create the `Shift`/`ShiftAssignment` rows it depends on yet — so Attendance Issues/Staff On Duty show empty until this phase's UI exists (server API is done — see `imperio-beds-server/todo.md` Phase 10).

---

Staff Management and Payroll screens both shipped 2026-07-01 — see Phase 1 above.
