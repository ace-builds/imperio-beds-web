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

## Phase 2 — Rooms & Room Types

- [x] RxDB `rooms` and `room-types` collections wired in `src/lib/db.ts`, with replication against the server
- [x] Room type management screen
- [x] Room board/grid view with live status (Available/Occupied/Cleaning/Maintenance), subscribed to WebSocket updates (now via RxDB's reactive queries, socket-triggered resync replacing the old direct `roomStatusChanged` invalidation)
- [x] Room notes UI (damage/issues)

## Phase 3 — Guests & Front Desk

- [x] RxDB `guests` and `stays` collections
- [ ] Guest search (name/phone) + profile/stay-history view — `routes/_authenticated/guests.tsx` is still a stub; only the inline `GuestPicker` search widget exists (used by the walk-in/reservation dialogs), not a standalone guest profile/history screen
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

## Phase 6 — Audit & Accountability

- [x] Audit log viewer (owner/admin only) — `routes/_authenticated/audit-logs.tsx`, gated via the existing nav-role pattern (server's `HotelAccessGuard` is the real enforcement)

## Phase 8 — Sync & Offline Hardening

- [ ] Verify RxDB replication survives offline/online transitions in a real browser — implemented (rooms/room-types/guests/stays collections + pull/push/resync wiring) and confirmed via `tsc -b`, lint, `vite build`, and a dev-server boot smoke test, but NOT yet exercised in an actual browser (devtools offline toggle, two-tab conflict scenario) — do this before shipping
- [x] Conflict UI/handling per the resolution policy decided in `tech_stack.md` — no dedicated UI: the server performs the real field-level merge and returns the merged doc, RxDB's default conflict handler (master-always-wins) applies it client-side, so the client never needs to render a conflict-resolution prompt. A "your edit was overridden" toast is a deferred fast-follow, not built this pass

## Phase 9 — Deployment readiness

- [ ] Production build + static hosting deploy

## Testing

- [ ] Add Vitest + Testing Library (`pnpm add -D vitest @testing-library/react jsdom`) once there's real component/hook logic worth testing

---

Deferred post-MVP, not tracked here yet: Staff Management, Attendance & Shift Tracking, Payroll & Salary Management screens.
