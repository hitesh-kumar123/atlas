-- Migration: 0004_phase4_ops
-- Purpose: Narrow SECURITY DEFINER functions for platform ops console cross-tenant telemetry & emergency suspension

-- 1. Get Platform Ops Overview Metrics
CREATE OR REPLACE FUNCTION get_ops_overview_metrics()
RETURNS TABLE (
  total_tenants bigint,
  total_events bigint,
  total_users bigint,
  active_tenants bigint,
  suspended_tenants bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM tenants)::bigint AS total_tenants,
    (SELECT COUNT(*) FROM events)::bigint AS total_events,
    (SELECT COUNT(*) FROM users)::bigint AS total_users,
    (SELECT COUNT(*) FROM tenants WHERE is_suspended IS NOT TRUE)::bigint AS active_tenants,
    (SELECT COUNT(*) FROM tenants WHERE is_suspended IS TRUE)::bigint AS suspended_tenants;
END;
$$;

-- 2. Get All Tenants Directory with Usage Stats
CREATE OR REPLACE FUNCTION get_ops_tenants_list()
RETURNS TABLE (
  tenant_id text,
  tenant_name text,
  tenant_slug text,
  user_count bigint,
  event_count bigint,
  created_at timestamp(3) with time zone,
  is_suspended boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.slug AS tenant_slug,
    COUNT(DISTINCT m."userId")::bigint AS user_count,
    COUNT(DISTINCT e.id)::bigint AS event_count,
    t."createdAt" AS created_at,
    COALESCE(t.is_suspended, false) AS is_suspended
  FROM tenants t
  LEFT JOIN memberships m ON m."tenantId" = t.id
  LEFT JOIN events e ON e."tenantId" = t.id
  GROUP BY t.id, t.name, t.slug, t."createdAt", t.is_suspended
  ORDER BY t."createdAt" DESC;
END;
$$;

-- 3. Toggle Emergency Tenant Suspension
CREATE OR REPLACE FUNCTION set_tenant_suspension(p_tenant_id text, p_suspended boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE tenants
  SET is_suspended = p_suspended,
      "updatedAt" = NOW()
  WHERE id = p_tenant_id;
END;
$$;
