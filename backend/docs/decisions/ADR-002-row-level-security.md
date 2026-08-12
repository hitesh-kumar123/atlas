# ADR-002: Tenant isolation enforced via Postgres RLS, not just query code

## Status
Accepted

## Context
A `WHERE tenantId = ...` clause in application code is a convention every
future PR has to remember to follow. One handler that forgets it is a
cross-tenant data leak, and code review won't reliably catch it at scale.

## Decision
Enable Row Level Security on every tenant-scoped table (`memberships`,
`invitations`, `api_keys`, `events`), with `FORCE ROW LEVEL SECURITY` so
even the owning role is subject to it, and a policy that compares
`"tenantId"` against `current_setting('app.tenant_id', true)`.

The app connects as a dedicated low-privilege `app_user` role — never the
migration role — so RLS is actually in force for every request-serving
query.

## Options considered
- **Application-level scoping only**: rejected — the whole point is that
  this shouldn't rely on every developer remembering every time.
- **Separate database/schema per tenant**: strong isolation but doesn't
  fit "ten million rows, one query, 300ms" — cross-tenant admin
  aggregate queries (Phase 4 ops console) become fan-out queries across N
  connections instead of one query with a WHERE/GROUP BY.
- **RLS (chosen)**: isolation enforced by the database itself, provably
  (see the isolation test in `tests/rls-isolation.test.ts`), independent
  of what any given handler remembers to do.

## Consequences
- Every tenant-scoped query must run inside a transaction that sets
  `app.tenant_id` first (see ADR-003 for how, and why `SET LOCAL`
  specifically). Forgetting this doesn't leak data — it fails closed to
  zero rows — but it will look like a bug, not a security hole, which is
  the trade-off we want.
- Ops-console cross-tenant views (Phase 4) need a deliberately different,
  narrow mechanism, not "turn RLS off" — see the `SECURITY DEFINER`
  functions in migration 0002_rls for the pattern used for pre-tenant
  lookups (login, invite acceptance) and its Phase 4 extension.
