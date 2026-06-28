# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack, localhost:3000)
npm run build    # production build
npm run start    # serve production build
npx eslint .     # lint (next lint was removed in v16 — use ESLint CLI directly)
npx tsc --noEmit # type-check without emitting
```

There are no automated tests. Type-check and lint are the only automated quality gates.

## Next.js 16 Breaking Changes

This project runs **Next.js 16.x** with **React 19**. The following are hard rules that differ from the Next.js you know:

- **`params` and `searchParams` are async.** Every page/layout that receives them must `await` them: `const { id } = await params`. Same for `cookies()`, `headers()`, and `draftMode()` — all async.
- **`middleware.ts` is gone.** The file is `proxy.ts` at the project root (already present). Export a named `proxy` function (or default), not `middleware`.
- **`next lint` is gone.** Use `npx eslint .` instead. `next build` no longer runs linting.
- **Turbopack is the default** for both `next dev` and `next build`. No flag needed.
- Before touching any Next.js API, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

## Architecture Overview

Cactus Access is a multi-tenant SaaS for biometric attendance control. Devices at client offices send events to an n8n automation server, which writes attendance records to Supabase. The Next.js app is the management UI only — it never receives device events directly.

### Tenant model

Each customer is an **empresa** with a **licencia** (plan limits, expiry, active flag). Employees and branches belong to the empresa. The `profiles` table links Supabase auth users to their empresa and role (`cliente` | `super_admin`). All Supabase queries are scoped to `id_empresa` via RLS policies — the `profile_id_empresa()` function resolves the current user's empresa at the DB level.

### Route groups

| Group | URL prefix | Auth guard |
|---|---|---|
| `(auth)` | `/login`, `/registro`, `/c9x4j2m8` (admin), … | Redirects away if already logged in |
| `(dashboard)` | `/dashboard`, `/asistencias`, `/empleados`, … | Requires `rol = 'cliente'` + active licencia |
| `(admin)` | `/admin`, `/admin/*` | Requires `rol = 'super_admin'` |
| `(suspended)` | `/cuenta-suspendida` | Shown when licencia is inactive/expired |

The root `page.tsx` immediately redirects to the right place via `getDashboardPathForUser()`.

### Auth and session

- **Supabase Auth** handles sessions via cookies managed by `@supabase/ssr`.
- `proxy.ts` refreshes the session on every request (calls `supabase.auth.getUser()`).
- Layout-level guards (`lib/auth/guards.ts`) call `requireCliente()` or `requireSuperAdmin()` and redirect if the check fails. Never trust client-side role checks.
- **Client login flow**: cédula/RUC + password → WhatsApp OTP (via n8n) → session. OTP pending state is stored in an httpOnly cookie `__auth_pending`.
- **Admin login flow**: email + password → optional WhatsApp OTP (if admin has `whatsapp` in profile) → session. Rate-limited to 5 failed attempts per 15 min via `admin_login_attempts` table. OTP pending state stored in `__admin_pending` cookie.

### Three Supabase clients

| Import | When to use |
|---|---|
| `lib/supabase/server.ts` → `createClient()` | Server Components and Server Actions — respects RLS, session-scoped |
| `lib/supabase/client.ts` → `createClient()` | Client Components only |
| `lib/supabase/service-role.ts` → `createServiceRoleClient()` | Admin actions only (`actions/admin/**`) — bypasses RLS |

Never import the service-role client from dashboard actions or client components.

### Server Actions pattern

All mutations live in `actions/` (top-level for dashboard, `actions/admin/` for super_admin panel). Every action:
1. Starts with `"use server"` at the file top.
2. Calls a guard (`requireCliente()` or `requireSuperAdmin()`) before any DB work.
3. Validates input with a Zod schema from `lib/validations/`.
4. Returns `ActionResult` (`{ ok: true } | { ok: false; error: string }`) — never throws to the client.
5. Calls `revalidatePath()` after mutations that affect Server Component data.

`redirect()` in a Server Action throws internally — call it **outside** any `try/catch`.

### n8n integration

`lib/n8n.ts` exports `n8nSendOtp`, `n8nVerifyOtp`, and `n8nNotificarPagoEmpleado`. All calls go to `N8N_BASE_URL/webhook/<path>` authenticated with `N8N_WEBHOOK_SECRET` in the `X-Webhook-Secret` header (configurable via `N8N_WEBHOOK_SECRET_HEADER`). The n8n server owns the attendance state machine: it reads device biometric events, determines what `control_diario` column to write (entrada / salida_almuerzo / entrada_almuerzo / salida), and computes `minutos_atraso`, `minutos_salida_temprana`, `minutos_extras`.

### Attendance state machine (`control_diario`)

Each employee-day row tracks four timestamped marks: `hora_entrada_real`, `hora_salida_almuerzo_real`, `hora_entrada_almuerzo_real`, `hora_salida_real`. Derived minutes (`minutos_atraso`, `minutos_salida_temprana`, `minutos_extras`) are calculated by n8n when writing the mark. The Next.js app only reads these values.

`lib/asistencia.ts` contains:
- `buildMarcas(row)` — formats a row into the 4-step timeline for display.
- `getEstadoDia(row)` — maps a row to a `StatusBadgeStatus` for the badge.
- `rangoPeriodo()` / `hoyISO()` — date utilities for period filters.

`lib/nomina.ts` → `calcularNomina()` computes payroll from `diasTrabajados`, `minutosExtra`, `minutosAtraso`, and `faltasNoJustificadas`. It does **not** automatically receive minutes from `minutos_salida_temprana` — any deduction for early/incomplete days must be explicitly wired in.

### Database types

`lib/types/database.types.ts` is written by hand (no linked Supabase project for codegen). When adding a migration that creates or alters a table:
1. Add/update the interface in `database.types.ts`.
2. Add the table to the `Database.public.Tables` map using `Table<YourInterface>`.

The `Spread<T>` + `Table<Row>` wrappers are intentional — they work around a `@supabase/postgrest-js` inference bug where `Insert` would resolve to `never[]` when using interfaces directly.

### UI system

- `components/ui/` — shadcn/ui components backed by `@base-ui/react` primitives.
- `components/cactus/` — project-specific composites (`PageShell`, `StatusBadge`, `LoadingButton`, `MarcasTimeline`, etc.).
- Design system is documented in `cactus-style.md`. Key rules: `rounded-2xl border border-border bg-card p-5` for cards; `--primary` lime green as the only solid-background accent (max one "hero card" per view); no shadows on regular content cards.
- `StatusBadge` accepts a `StatusBadgeStatus` union type. Extend both the type and the `STATUS_STYLES`/`STATUS_LABELS`/`STATUS_ICONS` records in `components/cactus/status-badge.tsx` when adding new statuses.

### Migrations

Migrations live in `supabase/migrations/` and are named `YYYYMMDDNNNNNN_description.sql`. Run `npx supabase db push` to apply. After adding a migration, update `lib/types/database.types.ts` to match.

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
N8N_BASE_URL
N8N_WEBHOOK_SECRET
N8N_WEBHOOK_SECRET_HEADER   # optional, defaults to "X-Webhook-Secret"
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_WEBHOOK_URL
DLOCALGO_API_KEY            # payment gateway
DLOCALGO_SECRET_KEY
DLOCALGO_ENV                # "sandbox" | "production"
```
