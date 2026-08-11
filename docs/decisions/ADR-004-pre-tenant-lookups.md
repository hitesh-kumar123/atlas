# ADR-004: Pre-tenant lookups (login, org switch, invite accept) via narrow SECURITY DEFINER functions

## Status
Accepted

## Context
RLS assumes we already know which tenant we're scoped to. Three flows in
Phase 1 don't have that yet by definition:
- Login / "which orgs does this user belong to" (before any org is chosen)
- Switching active org (need to verify membership in the *target* tenant
  before trusting it)
- Accepting an invitation by token (invitee doesn't know the tenant id)

A query with no `app.tenant_id` set returns zero rows under our RLS
policies (by design, per ADR-002) — so these flows can't just run a normal
`withTenant()`-style query.

## Decision
Add narrow, single-purpose Postgres functions marked `SECURITY DEFINER`
(`get_memberships_for_user(user_id)`, `get_invitation_by_token(token)`)
that run with the privileges of the function's owner rather than the
caller, bypassing RLS — but only to return rows matching the exact
parameter passed in. `app_user` is granted `EXECUTE` on these functions
specifically, not a broader bypass.

## Options considered
- **Superuser/admin connection for these flows**: rejected — too easy for
  "the connection used at login" to quietly become "the connection used
  for other things" over time, since it's a second connection pool a
  future developer has to remember exists and remember to restrict.
- **Store `app.tenant_id`-independent copies of membership data
  elsewhere**: rejected, denormalization for a problem that has a smaller
  fix.
- **`SECURITY DEFINER` functions with a fixed, auditable shape (chosen)**:
  the bypass is scoped to exactly what each function's SQL body does —
  "rows for this one user_id" or "the one row matching this token" — and
  is visible in a single migration file, not a role-permissions
  configuration spread across the app.

## Consequences
- Any new "look this up before we know the tenant" requirement should add
  a new function of this shape, not widen an existing one or reach for
  the migration role.
- These functions are the highest-scrutiny code in the migration — a bug
  here is a genuine cross-tenant read, unlike a bug in `withTenant()`
  callers which fails closed. Reviewed accordingly.
