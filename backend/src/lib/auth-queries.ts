import { basePrisma } from "./prisma";

export interface UserMembership {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: "owner" | "admin" | "viewer";
}

/**
 * The one place in the codebase allowed to query membership data without
 * app.tenant_id set. Goes through the get_memberships_for_user() SQL
 * function (see prisma/migrations/0002_rls), which is scoped to the
 * given userId server-side — not a general RLS bypass.
 */
export async function getMembershipsForUser(userId: string): Promise<UserMembership[]> {
  const rows = await basePrisma.$queryRaw<
    { tenant_id: string; tenant_name: string; tenant_slug: string; role: string }[]
  >`SELECT * FROM get_memberships_for_user(${userId})`;

  return rows.map((r) => ({
    tenantId: r.tenant_id,
    tenantName: r.tenant_name,
    tenantSlug: r.tenant_slug,
    role: r.role as UserMembership["role"],
  }));
}

/**
 * Used by the "switch org" action to confirm the user is actually a member
 * of the tenant they're switching to, before we trust it into the session.
 * This is what stops cookie/URL tampering from granting access: the active
 * tenant id in the session is meaningless unless it also shows up here.
 */
export async function isUserMemberOfTenant(userId: string, tenantId: string): Promise<boolean> {
  const memberships = await getMembershipsForUser(userId);
  return memberships.some((m) => m.tenantId === tenantId);
}
