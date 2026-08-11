-- ATLAS: Row Level Security
--
-- Mechanism: every tenant-scoped table gets a policy that compares its
-- tenantId column against current_setting('app.tenant_id', true).
-- That setting is populated per-request via SET LOCAL inside a transaction
-- (see src/lib/prisma.ts). SET LOCAL is transaction-scoped, not session-scoped,
-- so it cannot leak across requests even under Pgbouncer transaction-mode
-- pooling (see docs/decisions/ADR-003-rls-and-connection-pooling.md).
--
-- A low-privilege role runs the actual application queries. The Prisma
-- migration/admin connection uses a superuser-ish role and is NEVER used
-- for request-serving queries, because RLS is not enforced against table
-- owners/superusers by default.

-- 1. Application role. Password is set via env in real deployment, placeholder here.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'change_me_in_env';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- 2. Enable + FORCE row level security on every tenant-scoped table.
--    FORCE matters: without it, the table owner (often the same role that
--    ran the migration) bypasses RLS entirely, which would make the
--    isolation test pass for the wrong reason.

ALTER TABLE memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships  FORCE ROW LEVEL SECURITY;

ALTER TABLE invitations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations  FORCE ROW LEVEL SECURITY;

ALTER TABLE api_keys     ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys     FORCE ROW LEVEL SECURITY;

ALTER TABLE events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events       FORCE ROW LEVEL SECURITY;

-- 3. Policies. current_setting(..., true) returns NULL instead of erroring
--    when unset, so a request that forgets to set app.tenant_id sees ZERO
--    rows rather than crashing OR (worse) seeing everything. Fail closed.

CREATE POLICY tenant_isolation_memberships ON memberships
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_invitations ON invitations
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_api_keys ON api_keys
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_events ON events
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- 4. Narrow, explicit bypass for "which tenants does this user belong to".
--    This is needed at login/org-switch time, before we know which tenant
--    to SET LOCAL for — a chicken-and-egg problem the policy above can't
--    solve on its own. Rather than quietly using a superuser connection
--    for this (easy to lose track of, easy to widen by accident later),
--    it's one SECURITY DEFINER function with a fixed, auditable shape:
--    it takes a user_id and returns only that user's own membership rows.
--    It cannot be used to read another user's memberships or any other
--    tenant-scoped table. Called from src/lib/auth-queries.ts only.
CREATE OR REPLACE FUNCTION get_memberships_for_user(p_user_id text)
RETURNS TABLE (
  tenant_id text,
  tenant_name text,
  tenant_slug text,
  role text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, t.slug, m.role::text
  FROM memberships m
  JOIN tenants t ON t.id = m.tenant_id
  WHERE m.user_id = p_user_id;
$$;

REVOKE ALL ON FUNCTION get_memberships_for_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_memberships_for_user(text) TO app_user;

-- 5. Same narrow-bypass pattern for invitation acceptance: the invitee
--    knows a token but not which tenant it belongs to yet. Returns at
--    most one row, matched only by the exact token — cannot be used to
--    enumerate or browse invitations.
CREATE OR REPLACE FUNCTION get_invitation_by_token(p_token text)
RETURNS TABLE (
  id text,
  tenant_id text,
  email text,
  role text,
  expires_at timestamptz,
  accepted_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, tenant_id, email, role::text, expires_at, accepted_at
  FROM invitations
  WHERE token = p_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION get_invitation_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_invitation_by_token(text) TO app_user;

-- Note: `tenants` and `users` are intentionally NOT row-level-secured.
-- `tenants` has no tenantId column (it IS the tenant). `users` is global —
-- isolation for "which tenants can this user see" is enforced through
-- Membership rows and application logic (a user lists only tenants they
-- belong to), not through RLS on the users table itself.
