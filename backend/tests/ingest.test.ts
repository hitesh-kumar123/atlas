import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createApiKey } from "../src/lib/api-keys";
import { TokenBucketRateLimiter } from "../src/lib/rate-limiter";
import { runTenantRollups } from "../src/lib/rollups";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();
let tenantId: string;
let apiKeyId: string;
let plaintextApiKey: string;

beforeAll(async () => {
  const suffix = randomBytes(4).toString("hex");
  const tenant = await prisma.tenant.create({
    data: { name: `Ingest Test Tenant ${suffix}`, slug: `ingest-test-${suffix}` },
  });
  tenantId = tenant.id;

  const keyResult = await createApiKey(tenantId, "Test Key");
  apiKeyId = keyResult.id;
  plaintextApiKey = keyResult.plaintextKey;
});

afterAll(async () => {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    await tx.hourlyEventRollup.deleteMany({ where: { tenantId } });
    await tx.dailyEventRollup.deleteMany({ where: { tenantId } });
    await tx.event.deleteMany({ where: { tenantId } });
    await tx.apiKey.deleteMany({ where: { tenantId } });
  });
  await prisma.tenant.delete({ where: { id: tenantId } });
  await prisma.$disconnect();
});

describe("Phase 2: Ingest & Aggregation Unit & Integration Tests", () => {
  it("Rate Limiter correctly allows requests under capacity and enforces 429", () => {
    const customLimiter = new TokenBucketRateLimiter(5, 5);
    const key = `test_key_${randomBytes(4).toString("hex")}`;

    for (let i = 0; i < 5; i++) {
      const res = customLimiter.consume(key, 1);
      expect(res.allowed).toBe(true);
    }

    const blockedRes = customLimiter.consume(key, 1);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("Idempotent Rollups: Running rollup job twice produces identical numbers", async () => {
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      await tx.event.createMany({
        data: [
          { tenantId, name: "page_view", distinctId: "user_1", occurredAt: now },
          { tenantId, name: "page_view", distinctId: "user_2", occurredAt: now },
          { tenantId, name: "checkout", distinctId: "user_1", occurredAt: now },
        ],
      });
    });

    await runTenantRollups(tenantId);

    const firstRunRollups = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      return tx.dailyEventRollup.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
    });

    expect(firstRunRollups.length).toBeGreaterThan(0);

    await runTenantRollups(tenantId);

    const secondRunRollups = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      return tx.dailyEventRollup.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
    });

    expect(secondRunRollups.length).toEqual(firstRunRollups.length);
    for (let i = 0; i < firstRunRollups.length; i++) {
      expect(secondRunRollups[i]?.eventCount).toEqual(firstRunRollups[i]?.eventCount);
      expect(secondRunRollups[i]?.uniqueUsers).toEqual(firstRunRollups[i]?.uniqueUsers);
    }
  });
});
