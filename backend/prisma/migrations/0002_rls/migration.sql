-- ATLAS: Row Level Security

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

ALTER TABLE memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships  FORCE ROW LEVEL SECURITY;

ALTER TABLE invitations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations  FORCE ROW LEVEL SECURITY;

ALTER TABLE api_keys     ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys     FORCE ROW LEVEL SECURITY;

ALTER TABLE events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events       FORCE ROW LEVEL SECURITY;

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
