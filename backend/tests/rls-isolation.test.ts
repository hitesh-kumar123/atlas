import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

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

      const allEvents = await tx.event.findMany();

      expect(allEvents.length).toBeGreaterThan(0);
      expect(allEvents.every((e) => e.tenantId === tenantAId)).toBe(true);
      expect(allEvents.some((e) => e.tenantId === tenantBId)).toBe(false);
    });
  });

  it("returns zero rows when app.tenant_id is never set at all", async () => {
    await prisma.$transaction(async (tx) => {
      const events = await tx.event.findMany();
      expect(events.length).toBe(0);
    });
  });

  it("blocks cross-tenant writes via WITH CHECK", async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantAId}, true)`;
        await tx.event.create({
          data: { tenantId: tenantBId, name: "spoofed", distinctId: "attacker" },
        });
      }),
    ).rejects.toThrow();
  });
});
