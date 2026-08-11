# ATLAS — Phase 1: Foundation & Tenancy

Multi-tenant analytics platform. This phase covers the schema, Postgres
Row Level Security, auth flows (signup/login/org switch/invite), and API
key issuance — the pieces everything else in the project depends on.

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, generate AUTH_SECRET
npx prisma migrate dev --name init   # generates + applies the schema migration
```

The RLS migration (`prisma/migrations/0002_rls/migration.sql`) runs as
part of `migrate dev` too — it creates the `app_user` role, enables +
forces RLS on tenant-scoped tables, and adds the policies plus the two
`SECURITY DEFINER` lookup functions (see ADR-002 and ADR-004).

**After migrating**, set a real password for `app_user` (the migration
uses a placeholder) and update `APP_DATABASE_URL` in `.env` to match:

```sql
ALTER ROLE app_user WITH PASSWORD 'something-real';
```

```bash
npm run dev
```

## Running the isolation test

```bash
npm run test
```

`tests/rls-isolation.test.ts` is the phase gate: it opens a transaction
scoped to tenant A, runs a query with no `WHERE` clause at all, and
asserts zero tenant-B rows come back. Point its `DATABASE_URL` at
`app_user`, not the migration role — RLS is only forced against
non-owner roles, so running this against the migration role would pass
for the wrong reason.

## What's here vs. what's a Phase 2+ stub

- `verifyApiKey()` in `src/lib/api-keys.ts` is a stub — full ingest-time
  key verification lands in Phase 2 alongside the ingest route.
- Invitation emails aren't actually sent (`inviteMember` returns the raw
  token) — wire up a provider when ready; the flow around it is complete.
- No UI pages are built out beyond the route/action layer in this drop —
  add `app/(auth)/login/page.tsx` etc. as thin forms calling the actions
  in `src/actions/`.

## Key design decisions

See `docs/decisions/`:
- **ADR-001** — why event properties are JSONB, not a normalized table
- **ADR-002** — why isolation is enforced via Postgres RLS
- **ADR-003** — why `SET LOCAL` inside a transaction, not a session `SET`
  (the Pgbouncer transaction-pooling trap)
- **ADR-004** — how login/org-switch/invite-accept work before a tenant
  is known, without widening the RLS bypass

## Directory map

```
prisma/schema.prisma              — Tenant, User, Membership, ApiKey, Event
prisma/migrations/0002_rls/       — RLS policies + SECURITY DEFINER functions
src/lib/prisma.ts                 — withTenant() — the only sanctioned tenant-scoped query path
src/lib/auth.ts                   — Auth.js v5 config, session carries activeTenantId
src/lib/auth-queries.ts           — pre-tenant lookups (login, org switch)
src/lib/api-keys.ts               — key issuance, hashing, revocation
src/actions/signup.ts             — signup (User + Tenant + Membership, atomic)
src/actions/org.ts                — createOrg, inviteMember, acceptInvitation, switchActiveOrg
tests/rls-isolation.test.ts       — the phase gate
docs/decisions/                   — ADRs
```
