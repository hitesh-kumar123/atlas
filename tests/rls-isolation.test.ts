import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

/**
 * This is the test the phase 1 "done" bar is built around:
 *
 *   "a test exists that opens a connection as the app role with tenant A
 *   set, runs SELECT * FROM Event with no WHERE clause at all, and
 *   asserts zero rows belonging to tenant B."
 *
 * It deliberately does NOT use withTenant() or any of our safe helpers —
 * the whole point is to simulate a buggy handler that forgot to scope its
 * query, and prove the database stops it anyway. If this test ever fails,
 * isolation is a convention, not a guarantee, and nothing else in this
 * codebase can be trusted.
 */

// IMPORTANT: DATABASE_URL for this test suite should point at the
// `app_user` role, not the migration/superuser role — that's the role
// FORCE ROW LEVEL SECURITY actually restricts in production. Running this
// against a superuser connection would pass for the wrong reason. See
// docs/decisions/ADR-002-row-level-security.md.
const prisma = new PrismaClient();

let tenantAId: string;
let tenantBId: string;

beforeAll(async () => {
  const suffix = randomBytes(4).toString("hex");
  const tenantA = await prisma.tenant.create({
    data: { name: `RLS Test A ${suffix}`, slug: `rls-test-a-${suffix}` },
  });
  const tenantB = await prisma.tenant.create({
    data: { name: `RLS Test B ${suffix}`, slug: `rls-test-b-${suffix}` },
  });
  tenantAId = tenantA.id;
  tenantBId = tenantB.id;

  // Insert events for both tenants, each via its own correctly-scoped
  // transaction (using the app's real path), so we know tenant B's data
  // genuinely exists before we try to leak it.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;
    await tx.event.create({
      data: { tenantId: tenantAId, name: "signup", distinctId: "user-a-1" },
    });
  });

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantBId}, true)`;
    await tx.event.create({
      data: { tenantId: tenantBId, name: "signup", distinctId: "user-b-1" },
    });
  });
});

afterAll(async () => {
  // Cleanup runs with each tenant correctly set, same as any real delete.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;
    await tx.event.deleteMany({ where: { tenantId: tenantAId } });
  });
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantBId}, true)`;
    await tx.event.deleteMany({ where: { tenantId: tenantBId } });
  });
  await prisma.tenant.delete({ where: { id: tenantAId } });
  await prisma.tenant.delete({ where: { id: tenantBId } });
  await prisma.$disconnect();
});

describe("RLS tenant isolation", () => {
  it("returns zero foreign rows even with no WHERE clause, as tenant A", async () => {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;

      // THE BUGGY HANDLER: no `where: { tenantId }` anywhere.
      const allEvents = await tx.event.findMany();

      expect(allEvents.length).toBeGreaterThan(0); // tenant A's own row is visible
      expect(allEvents.every((e) => e.tenantId === tenantAId)).toBe(true);
      expect(allEvents.some((e) => e.tenantId === tenantBId)).toBe(false);
    });
  });

  it("returns zero rows when app.tenant_id is never set at all", async () => {
    await prisma.$transaction(async (tx) => {
      // No set_config call — simulates a request path that skipped
      // withTenant() entirely. current_setting(..., true) is NULL, the
      // policy compares tenant_id = NULL, which is never true. Fail closed.
      const events = await tx.event.findMany();
      expect(events.length).toBe(0);
    });
  });

  it("blocks cross-tenant writes via WITH CHECK", async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;
        // Trying to insert a row claiming to belong to tenant B while the
        // session is scoped to tenant A. WITH CHECK on the policy rejects it.
        await tx.event.create({
          data: { tenantId: tenantBId, name: "spoofed", distinctId: "attacker" },
        });
      }),
    ).rejects.toThrow();
  });
});
