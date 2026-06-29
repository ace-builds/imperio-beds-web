# apps/web — Todo

The desktop front-desk client's slice of [implementation.md](../../implementation.md) — read that first for phase goals and definitions of done. Check items off as they land; when every item in a phase is checked across all the apps it touches, mark that phase done in `implementation.md`'s status table.

## Phase 0 — Foundation
- [x] Login screen + session handling (TanStack Query against BetterAuth endpoints)
- [x] Route auth guard (redirect to login when unauthenticated)
- [x] Current-hotel Zustand store

## Phase 1 — Hotels & Roles
- [ ] Hotel management screen (create/edit hotel, owner only)
- [ ] Hotel switcher UI
- [ ] Role-gated navigation (hide/disable modules the current role can't access)

## Phase 2 — Rooms & Room Types
- [ ] RxDB `rooms` and `room-types` collections wired in `src/lib/db.ts`, with replication against the server
- [ ] Room type management screen
- [ ] Room board/grid view with live status (Available/Occupied/Cleaning/Maintenance), subscribed to WebSocket updates
- [ ] Room notes UI (damage/issues)

## Phase 3 — Guests & Front Desk
- [ ] RxDB `guests` and `stays` collections
- [ ] Guest search (name/phone) + profile/stay-history view
- [ ] Check-in flow (assign room to guest)
- [ ] Extend stay / move room flows
- [ ] Check-out flow
- [ ] Payment entry (cash/transfer/POS) + outstanding balance display

## Phase 4 — Inventory
- [ ] Inventory item list per category
- [ ] Stock-in / stock-out forms (reason + staff attribution)
- [ ] Low-stock indicator/view

## Phase 5 — Reporting
- [ ] Daily operations report screen (check-ins/outs, occupancy, revenue, inventory usage)
- [ ] Printable/exportable view

## Phase 6 — Audit & Accountability
- [ ] Audit log viewer (owner/admin only)

## Phase 8 — Sync & Offline Hardening
- [ ] Verify RxDB replication survives offline/online transitions in a real browser
- [ ] Conflict UI/handling per the resolution policy decided in `tech_stack.md`

## Phase 9 — Deployment readiness
- [ ] Production build + static hosting deploy

## Testing
- [ ] Add Vitest + Testing Library (`pnpm add -D vitest @testing-library/react jsdom`) once there's real component/hook logic worth testing

---

Deferred post-MVP, not tracked here yet: Staff Management, Attendance & Shift Tracking, Payroll & Salary Management screens.
