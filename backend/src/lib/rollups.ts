import { withTenant } from "./prisma";

export interface RollupResult {
  tenantId: string;
  hourlyRollupsProcessed: number;
  dailyRollupsProcessed: number;
}

export async function runTenantRollups(tenantId: string, sinceDate?: Date): Promise<RollupResult> {
  const cutoff = sinceDate ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  return withTenant(tenantId, async (tx) => {
    const hourlyUpserts = await tx.$executeRaw`
      WITH hourly_stats AS (
        SELECT
          "tenantId",
          "name",
          DATE_TRUNC('hour', "occurredAt") AS bucket,
          COUNT(*)::int AS event_count,
          COUNT(DISTINCT "distinctId")::int AS unique_users
        FROM events
        WHERE "tenantId" = ${tenantId} AND "occurredAt" >= ${cutoff}
        GROUP BY "tenantId", "name", DATE_TRUNC('hour', "occurredAt")

        UNION ALL

        SELECT
          "tenantId",
          '*' AS "name",
          DATE_TRUNC('hour', "occurredAt") AS bucket,
          COUNT(*)::int AS event_count,
          COUNT(DISTINCT "distinctId")::int AS unique_users
        FROM events
        WHERE "tenantId" = ${tenantId} AND "occurredAt" >= ${cutoff}
        GROUP BY "tenantId", DATE_TRUNC('hour', "occurredAt")
      )
      INSERT INTO hourly_event_rollups (id, "tenantId", name, bucket, "eventCount", "uniqueUsers")
      SELECT
        gen_random_uuid()::text,
        "tenantId",
        name,
        bucket,
        event_count,
        unique_users
      FROM hourly_stats
      ON CONFLICT ("tenantId", name, bucket)
      DO UPDATE SET
        "eventCount" = EXCLUDED."eventCount",
        "uniqueUsers" = EXCLUDED."uniqueUsers";
    `;

    const dailyUpserts = await tx.$executeRaw`
      WITH daily_stats AS (
        SELECT
          "tenantId",
          "name",
          DATE_TRUNC('day', "occurredAt") AS bucket,
          COUNT(*)::int AS event_count,
          COUNT(DISTINCT "distinctId")::int AS unique_users
        FROM events
        WHERE "tenantId" = ${tenantId} AND "occurredAt" >= ${cutoff}
        GROUP BY "tenantId", "name", DATE_TRUNC('day', "occurredAt")

        UNION ALL

        SELECT
          "tenantId",
          '*' AS "name",
          DATE_TRUNC('day', "occurredAt") AS bucket,
          COUNT(*)::int AS event_count,
          COUNT(DISTINCT "distinctId")::int AS unique_users
        FROM events
        WHERE "tenantId" = ${tenantId} AND "occurredAt" >= ${cutoff}
        GROUP BY "tenantId", DATE_TRUNC('day', "occurredAt")
      )
      INSERT INTO daily_event_rollups (id, "tenantId", name, bucket, "eventCount", "uniqueUsers")
      SELECT
        gen_random_uuid()::text,
        "tenantId",
        name,
        bucket,
        event_count,
        unique_users
      FROM daily_stats
      ON CONFLICT ("tenantId", name, bucket)
      DO UPDATE SET
        "eventCount" = EXCLUDED."eventCount",
        "uniqueUsers" = EXCLUDED."uniqueUsers";
    `;

    return {
      tenantId,
      hourlyRollupsProcessed: hourlyUpserts,
      dailyRollupsProcessed: dailyUpserts,
    };
  });
}
