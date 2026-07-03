# CLAUDE.md — imperio-beds-web

This is the Vite + React desktop front-desk client for **imperiobeds**, a multi-tenant hotel-ops SaaS. It's one of three app repos (server/web/mobile) split out from an original monorepo on 2026-06-29 so each app's git history stays readable on its own — see [ace-builds/imperio-beds](https://github.com/ace-builds/imperio-beds) for the product PRD (`project_scope.md`), full architecture rationale (`tech_stack.md`), and phase sequencing (`implementation.md`). That repo is docs-only; this repo is self-contained for code.

## Commands

```bash
npm install      # install dependencies
npm run dev      # vite dev server
npm run build    # tsr generate && tsc -b && vite build
npm run lint     # oxlint
```

`src/routeTree.gen.ts` is auto-generated and gitignored. `dev` regenerates it via the TanStack Router Vite plugin as a side effect of starting the dev server. `build` can't rely on that: `tsc -b` runs before Vite ever starts, so on a fresh clone it would fail with "Cannot find module './routeTree.gen'" — the `build` script therefore runs `tsr generate` (the `@tanstack/router-cli` package, configured via `tsr.config.json`) first to produce the file explicitly before typechecking.

## Code practices

- **State, by layer — don't blur these:**
  - **RxDB** owns offline-first, replicated domain data (rooms, stays, guests, inventory — once those collections exist). See `src/lib/db.ts`.
  - **TanStack Query** owns everything else fetched from the server that doesn't need offline replication (auth calls, on-demand reports, one-off mutations).
  - **Zustand** is for client-only UI state. Default to local component state (`useState`) or props/composition first; only lift state into a Zustand store once two or more components that aren't in a parent/child relationship need to share it (e.g. current hotel context, a cross-page sidebar/modal state). Don't create a store before a second consumer actually needs it.
  - **TanStack Router** owns URL state (search params, route params) — don't duplicate that into Zustand or component state.
- **Components: shadcn/ui conventions.** Check existing components (`components.json`, `src/components/ui/`) and search the registry (`npx shadcn@latest search`) before writing custom markup. Follow the shadcn skill's rules when adding or using components (semantic color tokens, `gap-*` not `space-y-*`, `size-*` for equal dimensions, `cn()` for conditional classes, etc.).
- **Routing: file-based, one route per file in `src/routes/`.** Prefer a loader over fetching in a `useEffect` when a route needs data before it renders.
- **File naming: kebab-case.** `room-card.tsx`, `use-room-status.ts` — matches what's already in the repo (`button.tsx`, `db.ts`, `index.css`).
- **Exports: named, by convention already in use here.** Route files export `Route` (required by the file-based routing convention) plus the route's component — don't add a default export alongside it.
- **Validation:** Zod for forms and route search-params — TanStack Router has built-in Zod support for `validateSearch`; use it instead of hand-rolled parsing.
- **Errors:** rely on TanStack Query's `isError`/`error` states for data-fetching, and plain `try/catch` for one-off async actions (e.g. a mutation's `onError`). Throw exceptions, not Results — same convention across all three apps.

## Testing

Vitest is the intended test runner (shares Vite's config/transform pipeline) but isn't installed yet — add it (`npm install -D vitest @testing-library/react jsdom`) when there's real component/hook logic worth testing, rather than scaffolding empty test files now.

## Current state

Login + auth-gated routing being wired up (`src/routes/login.tsx`, `src/routes/_authenticated.tsx`, `src/lib/auth-client.ts`, `src/stores/`) on top of the shadcn/ui + TanStack Router/Query/RxDB/Zustand scaffolding — no domain routes/collections (rooms, stays, guests, inventory) yet.

See [todo.md](todo.md) for the current task breakdown — check items off (and update `implementation.md` in the docs repo) as features land.
