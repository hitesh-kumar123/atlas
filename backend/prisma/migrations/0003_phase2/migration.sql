CREATE TABLE IF NOT EXISTS "hourly_event_rollups" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bucket" TIMESTAMP(3) NOT NULL,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hourly_event_rollups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "daily_event_rollups" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bucket" TIMESTAMP(3) NOT NULL,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_event_rollups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hourly_event_rollups_tenantId_name_bucket_key" ON "hourly_event_rollups"("tenantId", "name", "bucket");
CREATE INDEX IF NOT EXISTS "hourly_event_rollups_tenantId_bucket_idx" ON "hourly_event_rollups"("tenantId", "bucket");

CREATE UNIQUE INDEX IF NOT EXISTS "daily_event_rollups_tenantId_name_bucket_key" ON "daily_event_rollups"("tenantId", "name", "bucket");
CREATE INDEX IF NOT EXISTS "daily_event_rollups_tenantId_bucket_idx" ON "daily_event_rollups"("tenantId", "bucket");

ALTER TABLE "hourly_event_rollups" ADD CONSTRAINT "hourly_event_rollups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_event_rollups" ADD CONSTRAINT "daily_event_rollups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

ALTER TABLE "hourly_event_rollups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hourly_event_rollups" FORCE ROW LEVEL SECURITY;

ALTER TABLE "daily_event_rollups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_event_rollups" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_hourly_rollups') THEN
        CREATE POLICY tenant_isolation_hourly_rollups ON "hourly_event_rollups"
          USING ("tenantId" = current_setting('app.tenant_id', true))
          WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_daily_rollups') THEN
        CREATE POLICY tenant_isolation_daily_rollups ON "daily_event_rollups"
          USING ("tenantId" = current_setting('app.tenant_id', true))
          WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
    END IF;
END $$;

CREATE OR REPLACE FUNCTION get_api_keys_by_prefix(p_prefix text)
RETURNS TABLE (
  id text,
  tenant_id text,
  key_hash text,
  revoked_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, "tenantId", "keyHash", "revokedAt"
  FROM api_keys
  WHERE "keyPrefix" = p_prefix AND "revokedAt" IS NULL;
$$;

REVOKE ALL ON FUNCTION get_api_keys_by_prefix(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_api_keys_by_prefix(text) TO app_user;
