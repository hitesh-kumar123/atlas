# ADR-003: RLS session variables vs. transaction-mode connection pooling

## Status
Accepted

## Context
RLS policies read `current_setting('app.tenant_id')`. Setting that value
needs a session variable — but under Pgbouncer in **transaction mode**
(the mode that actually scales), there's no such thing as "your session":
a physical connection is handed to a transaction only for that
transaction's duration, then returned to the pool and picked up by
someone else's next transaction. A plain `SET app.tenant_id = 'x'`
persists at the *connection* level and would leak into whichever request
happens to reuse that connection next. This is the kind of bug that is
invisible in local dev (one connection, one user) and only shows up under
concurrent production load — which makes it a bad one to get wrong.

## Decision
Always use `SET LOCAL` (via `set_config(..., true)`), and always issue it
as the first statement inside an explicit `$transaction`, via a single
chokepoint helper (`withTenant()` in `src/lib/prisma.ts`). `SET LOCAL` is
scoped to the current transaction only and Postgres resets it
automatically when the transaction ends — there is nothing to leak,
because pgbouncer transaction-mode pooling already guarantees the
connection is exclusively ours for exactly as long as the setting is valid.

## Options considered
- **Session-level `SET`**: rejected outright — leaks across requests
  under transaction-mode pooling, confirmed via the failure mode above.
- **Connection-mode pooling instead of transaction-mode**: sidesteps the
  problem but caps concurrency at "one connection per active request",
  which doesn't hold up at the ingest volumes Phase 2 targets.
- **`SET LOCAL` inside `$transaction` (chosen)**: safe under transaction
  pooling by construction, at the cost of every tenant-scoped query
  needing to go through the `withTenant()` wrapper rather than a bare
  Prisma call.

## Consequences
- `withTenant()` is the only sanctioned entry point for tenant-scoped
  queries; a bare `basePrisma.event.findMany()` outside it either runs
  with no `app.tenant_id` set (fails closed, zero rows, per ADR-002) or is
  a code smell to flag in review.
- Every tenant-scoped write is implicitly wrapped in a transaction, which
  is fine for single-statement operations but is a deliberate constraint
  to keep in mind for Phase 2 batch ingest — batches insert inside one
  transaction, not N.
