import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

// APP_DATABASE_URL connects as the app_user role (which RLS actually restricts)
const appPrisma = new PrismaClient({
  datasourceUrl: process.env.APP_DATABASE_URL ?? process.env.DATABASE_URL,
});
// Admin client for tenant provisioning/cleanup
const adminPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

let tenantAId: string;
let tenantBId: string;

beforeAll(async () => {
  const suffix = randomBytes(4).toString("hex");
  const tenantA = await adminPrisma.tenant.create({
    data: { name: `RLS Test A ${suffix}`, slug: `rls-test-a-${suffix}` },
  });
  const tenantB = await adminPrisma.tenant.create({
    data: { name: `RLS Test B ${suffix}`, slug: `rls-test-b-${suffix}` },
  });
  tenantAId = tenantA.id;
  tenantBId = tenantB.id;

  await appPrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;
    await tx.event.create({
      data: { tenantId: tenantAId, name: "signup", distinctId: "user-a-1" },
    });
  });

  await appPrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantBId}, true)`;
    await tx.event.create({
      data: { tenantId: tenantBId, name: "signup", distinctId: "user-b-1" },
    });
  });
});

afterAll(async () => {
  await appPrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;
    await tx.event.deleteMany({ where: { tenantId: tenantAId } });
  });
  await appPrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantBId}, true)`;
    await tx.event.deleteMany({ where: { tenantId: tenantBId } });
  });
  await adminPrisma.tenant.delete({ where: { id: tenantAId } });
  await adminPrisma.tenant.delete({ where: { id: tenantBId } });
  await appPrisma.$disconnect();
  await adminPrisma.$disconnect();
});

describe("RLS tenant isolation", () => {
  it("returns zero foreign rows even with no WHERE clause, as tenant A", async () => {
    await appPrisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;

      const allEvents = await tx.event.findMany();

      expect(allEvents.length).toBeGreaterThan(0);
      expect(allEvents.every((e) => e.tenantId === tenantAId)).toBe(true);
      expect(allEvents.some((e) => e.tenantId === tenantBId)).toBe(false);
    });
  });

  it("returns zero rows when app.tenant_id is never set at all", async () => {
    await appPrisma.$transaction(async (tx) => {
      const events = await tx.event.findMany();
      expect(events.length).toBe(0);
    });
  });

  it("blocks cross-tenant writes via WITH CHECK", async () => {
    await expect(
      appPrisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;
        await tx.event.create({
          data: { tenantId: tenantBId, name: "spoofed", distinctId: "attacker" },
        });
      }),
    ).rejects.toThrow();
  });
});

