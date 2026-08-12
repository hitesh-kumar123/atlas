import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { runTenantRollups } from "../src/lib/rollups";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const TOTAL_EVENTS = 5_000_000;
const BATCH_SIZE = 25_000;
const DAYS_SPAN = 95;

const TENANTS_CONFIG = [
  { name: "Acme Corp", slug: "acme-corp", share: 0.5 },
  { name: "Globex Inc", slug: "globex-inc", share: 0.35 },
  { name: "Initech LLC", slug: "initech-llc", share: 0.15 },
];

const EVENT_TYPES = [
  "page_view",
  "button_click",
  "search",
  "signup_step",
  "checkout_start",
  "checkout_complete",
];

const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge"];
const OS_LIST = ["macOS", "Windows", "iOS", "Android", "Linux"];
const COUNTRIES = ["US", "GB", "DE", "IN", "CA", "FR", "JP"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function main() {
  console.log(`Starting ATLAS 5M realistic event seed script...`);
  const startTime = Date.now();

  const passwordHash = await argon2.hash("password123!");
  const tenantIds: string[] = [];

  for (const config of TENANTS_CONFIG) {
    let tenant = await prisma.tenant.findUnique({ where: { slug: config.slug } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: config.name, slug: config.slug },
      });

      const user = await prisma.user.create({
        data: {
          email: `admin@${config.slug}.com`,
          name: `${config.name} Admin`,
          passwordHash,
        },
      });

      await prisma.membership.create({
        data: { tenantId: tenant.id, userId: user.id, role: "owner" },
      });

      const secret = randomBytes(24).toString("base64url");
      const plaintextKey = `atlas_live_${secret}`;
      const keyHash = await argon2.hash(plaintextKey);
      await prisma.apiKey.create({
        data: {
          tenantId: tenant.id,
          name: "Default Ingest Key",
          keyPrefix: plaintextKey.slice(0, 19),
          keyHash,
        },
      });
    }

    tenantIds.push(tenant.id);
  }

  console.log(`Tenants initialized: ${tenantIds.join(", ")}`);

  const now = Date.now();
  const ninetyDaysMs = DAYS_SPAN * 24 * 60 * 60 * 1000;
  let totalInserted = 0;

  console.log(`Generating ${TOTAL_EVENTS.toLocaleString()} events in batches of ${BATCH_SIZE.toLocaleString()}...`);

  while (totalInserted < TOTAL_EVENTS) {
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_EVENTS - totalInserted);
    const eventsBatch: Array<{
      id: string;
      tenantId: string;
      name: string;
      distinctId: string;
      properties: string;
      occurredAt: Date;
      receivedAt: Date;
    }> = [];

    for (let i = 0; i < currentBatchSize; i++) {
      const rand = Math.random();
      let tenantIndex = 0;
      if (rand > 0.85) tenantIndex = 2;
      else if (rand > 0.50) tenantIndex = 1;
      else tenantIndex = 0;

      const tenantId = tenantIds[tenantIndex]!;

      const timeOffsetMs = Math.pow(Math.random(), 1.5) * ninetyDaysMs;
      const occurredAt = new Date(now - timeOffsetMs);

      const eventName = getRandomItem(EVENT_TYPES);
      const userNum = Math.floor(Math.random() * 50_000) + 1;
      const distinctId = `user_${tenantIndex}_${userNum}`;

      const props = {
        browser: getRandomItem(BROWSERS),
        os: getRandomItem(OS_LIST),
        country: getRandomItem(COUNTRIES),
        session_duration: Math.floor(Math.random() * 300),
      };

      eventsBatch.push({
        id: `evt_${totalInserted + i}_${Math.random().toString(36).slice(2, 8)}`,
        tenantId,
        name: eventName,
        distinctId,
        properties: JSON.stringify(props),
        occurredAt,
        receivedAt: occurredAt,
      });
    }

    const valuesSql = eventsBatch
      .map(
        (e) =>
          `('${e.id}', '${e.tenantId}', '${e.name}', '${e.distinctId}', '${e.properties}'::jsonb, '${e.occurredAt.toISOString()}'::timestamptz, '${e.receivedAt.toISOString()}'::timestamptz)`
      )
      .join(",");

    await prisma.$executeRawUnsafe(
      `INSERT INTO events ("id", "tenantId", "name", "distinctId", "properties", "occurredAt", "receivedAt") VALUES ${valuesSql}`
    );

    totalInserted += currentBatchSize;
    const progressPct = ((totalInserted / TOTAL_EVENTS) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Inserted ${totalInserted.toLocaleString()} / ${TOTAL_EVENTS.toLocaleString()} events (${progressPct}%) [${elapsedSec}s elapsed]`);
  }

  console.log(`Populating Rollup Tables for all tenants...`);
  for (const tenantId of tenantIds) {
    console.log(`Running rollups for tenant ${tenantId}...`);
    const rollupStats = await runTenantRollups(tenantId);
    console.log(`Rollups complete for ${tenantId}:`, rollupStats);
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Seeding complete! Successfully generated ${TOTAL_EVENTS.toLocaleString()} events in ${totalDuration}s.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
