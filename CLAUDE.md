# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend (Next.js) — run from repo root
bun install              # install dependencies
bun run dev              # dev server on :3000 (proxied through Next.js)
bun run build            # production build
bun run lint             # eslint (next config)
bunx tsc --noEmit        # typecheck frontend

# Server (SpacetimeDB module) — run from server/
cd server && bun install # separate package.json
spacetime start          # start local SpacetimeDB (separate terminal)
spacetime publish payslip-gen --project-path server/
spacetime generate --lang typescript --out-dir src/module_bindings --project-path server/

# shadcn/ui components
bunx shadcn@latest add <component>
```

No test framework is configured.

## Architecture

Two-tier app: **SpacetimeDB server module** (TypeScript) + **Next.js 16 frontend** (React 19, shadcn/ui).

### Server (`server/src/`)

SpacetimeDB v2 TypeScript module. All state lives in SpacetimeDB tables — no REST API, no separate database.

- `schema.ts` — 9 tables defined with `table()` / `t.*()` builders, exported via `schema({...})`. Tables are **private by default**; clients access data through views.
- `index.ts` — All reducers (auth, CRUD, signing) and **views** (identity-aware server-side filters that enforce data security). Auth uses pure-JS SHA-256 (no Node crypto in SpacetimeDB runtime).

Key SpacetimeDB v2 patterns:

- Schema: `const tbl = table({ name: "x", indexes: [...] }, { col: t.type() })`
- Reducers: `spacetimedb.reducer({ param: t.type() }, (ctx, args) => { ... })`
- Views: `spacetimedb.view({ name: "x_view", public: true }, returnType, (ctx) => { ... })` — these are the security boundary; all tables are private and clients only see view results scoped to their identity.
- Singleton pattern: company and field_visibility use `id: 1n` as a fixed row.

### Frontend (`src/`)

- `module_bindings/` — **Auto-generated** by `spacetime generate`. Do not hand-edit. Contains typed table accessors, reducer call wrappers, and view types.
- `providers/` — Three nested providers: `StdbProvider` (WebSocket connection + subscriptions) → `AuthProvider` (identity-based auth, deferred data subscriptions) → `ClientProviders` (wraps both + layout).
- `hooks/use-db.ts` — All data hooks. Uses a `useRevision` pattern: subscribes to SpacetimeDB table events (onInsert/onUpdate/onDelete) and bumps a revision counter to trigger re-renders. Hooks iterate view tables via `conn.db.<viewName>.iter()`.
- `types/index.ts` — Frontend-side interfaces mirroring DB row shapes (Db\* types). All monetary values are `bigint` (cents). Convert with `centsToAmount()`/`amountToCents()` from `use-db.ts`.
- `lib/constants.ts` — SpacetimeDB connection config (`STDB_URI`, `STDB_DATABASE`), localStorage keys, field visibility defaults.
- `components/` — Organized by domain: `auth/`, `boss/`, `employee/`, `company/`, `payslip/`, `pdf/`, `layout/`, `ui/` (shadcn).

### Data flow

1. Frontend connects via WebSocket, subscribes to `users_view` only.
2. On login, reducer binds `ctx.sender` identity to user row → user appears in `users_view` → AuthProvider detects login → calls `subscribeAll()` for remaining views.
3. Views re-evaluate server-side per identity: boss sees all data, employees see only their own.
4. PDF generation: `@react-pdf/renderer` client-side. Boss signature stored in localStorage (`SIGNATURE_KEY`), baked into PDF before signing reducer stores base64.

### Routes (App Router)

- `/` — Login page
- `/boss` — Dashboard (all submissions), `/boss/employees`, `/boss/settings`, `/boss/payslip/[id]`
- `/employee` — Dashboard (own submissions), `/employee/profile`, `/employee/submit`, `/employee/payslip/[id]`

## Conventions

- Path alias: `@/*` → `./src/*`
- shadcn/ui: new-york style, neutral base, Tailwind CSS v4, lucide icons
- Monetary values: stored as u64 cents in SpacetimeDB, `bigint` in TS. Display by dividing by 100.
- JSON-in-columns: `earningsJson`, `deductionsJson`, `customFieldsJson` are stringified arrays parsed with `parseJsonPayComponents()` / `parseJsonCustomFields()`.
- SpacetimeDB timestamps: `{ microsSinceUnixEpoch: bigint }` — convert with `stdbTimestampToDate()`.
- Roles: `"boss"` | `"employee"` — checked server-side via `assertBoss()`/`assertEmployee()` helpers.
- Default boss credentials after `spacetime publish`: admin/admin.
- ESLint ignores `server/` directory (separate TS project with its own tsconfig).
