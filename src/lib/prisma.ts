import { PrismaClient } from "@prisma/client";

/**
 * ATLAS tenant-scoped Prisma client.
 *
 * Why this file exists:
 * RLS reads `current_setting('app.tenant_id')`, which has to be set with
 * `SET LOCAL` (not `SET`) so it only lives for the current transaction.
 * Under Pgbouncer in transaction-pooling mode, a plain session-level `SET`
 * would stick to the physical connection and leak into whichever request
 * grabs that connection next — silently, and only under concurrent load,
 * which is exactly the kind of bug that doesn't show up in a single-user
 * dev session. See docs/decisions/ADR-003-rls-and-connection-pooling.md.
 *
 * The fix: never run a bare query against tenant-scoped tables. Every
 * request wraps its queries in an explicit `$transaction`, and the very
 * first statement inside that transaction is `SET LOCAL app.tenant_id`.
 * Because Pgbouncer (transaction mode) hands a connection to a transaction
 * exclusively for its duration, `SET LOCAL` inside that transaction cannot
 * bleed into anyone else's request. When the transaction ends, Postgres
 * resets the setting on its own — nothing to "undo" ourselves.
 *
 * `withTenant` is the ONLY sanctioned way to touch tenant-scoped tables in
 * this codebase. If you find yourself calling `basePrisma.event.findMany`
 * directly outside this file, that's the bug the isolation test is there
 * to catch.
 */

declare global {
  // eslint-disable-next-line no-var
  var __atlasPrisma: PrismaClient | undefined;
}

// One physical client, reused across requests (standard Next.js pattern to
// avoid exhausting the connection pool with a new PrismaClient per request).
// Deliberately overrides the datasource with APP_DATABASE_URL (the
// low-privilege app_user role) rather than DATABASE_URL (the migration
// role) — this is what makes FORCE ROW LEVEL SECURITY actually bind at
// request time. See .env.example and ADR-002.
export const basePrisma =
  global.__atlasPrisma ??
  new PrismaClient({
    datasourceUrl: process.env.APP_DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__atlasPrisma = basePrisma;
}

/**
 * Runs `fn` with a Prisma transaction client that has app.tenant_id set
 * for its duration. Use this for every read or write against a
 * tenant-scoped table (Membership, ApiKey, Event, Invitation).
 *
 * tenantId is deliberately typed as `string` and NOT optional — there is
 * no "run without a tenant" escape hatch here on purpose. Ops-console
 * cross-tenant queries go through a separate, explicitly-named
 * `withOpsRole` helper (added in Phase 4) that uses a different DB role,
 * not this one.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>,
): Promise<T> {
  return basePrisma.$transaction(async (tx) => {
    // Parameterized via Prisma's tagged-template — not string interpolation,
    // so this is not SQL-injectable via tenantId.
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}
