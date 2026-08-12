"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { auth, unstable_update } from "@/lib/auth";
import { basePrisma, withTenant } from "@/lib/prisma";
import { isUserMemberOfTenant } from "@/lib/auth-queries";
import { createOrgSchema, inviteSchema, acceptInvitationSchema, switchOrgSchema } from "@/lib/validation";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** An already-logged-in user spins up an additional org. */
export async function createOrg(input: z.infer<typeof createOrgSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const parsed = createOrgSchema.parse(input);
  const slug = `${parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomBytes(3).toString("hex")}`;

  return basePrisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { name: parsed.name, slug } });
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;
    await tx.membership.create({
      data: { tenantId: tenant.id, userId: session.user.id, role: "owner" },
    });
    return tenant;
  });
}

/** Owner/admin invites someone by email. Requires an active, verified tenant. */
export async function inviteMember(input: z.infer<typeof inviteSchema>) {
  const session = await auth();
  if (!session?.user?.activeTenantId) throw new Error("Not authenticated");
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    throw new Error("Insufficient permissions");
  }

  const parsed = inviteSchema.parse(input);
  const tenantId = session.user.activeTenantId;
  const token = randomBytes(24).toString("base64url");

  const invitation = await withTenant(tenantId, (tx) =>
    tx.invitation.create({
      data: {
        tenantId,
        email: parsed.email,
        role: parsed.role,
        token,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
    }),
  );

  // TODO Phase 1 wiring: send email with a link containing `token`.
  // Left as a stub — swap in your transactional email provider of choice.
  return { invitationId: invitation.id, token };
}

/** Invitee (must already have an account) accepts and joins the tenant. */
export async function acceptInvitation(input: z.infer<typeof acceptInvitationSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const { token } = acceptInvitationSchema.parse(input);

  // Invitations are tenant-scoped (RLS), but we don't know the tenant yet —
  // tokens are globally unique though, so this goes through
  // get_invitation_by_token(), the same narrow SECURITY DEFINER pattern as
  // get_memberships_for_user (see ADR-004 and migration 0002_rls).
  const rows = await basePrisma.$queryRaw<
    { id: string; tenant_id: string; email: string; role: string; expires_at: Date; accepted_at: Date | null }[]
  >`SELECT * FROM get_invitation_by_token(${token})`;
  const invite = rows[0];

  if (!invite) throw new Error("Invitation not found or already used");
  if (invite.accepted_at) throw new Error("Invitation already accepted");
  if (invite.expires_at < new Date()) throw new Error("Invitation expired");
  if (invite.email !== session.user.email) throw new Error("Invitation was issued to a different email");

  await withTenant(invite.tenant_id, async (tx) => {
    await tx.membership.create({
      data: { tenantId: invite.tenant_id, userId: session.user.id, role: invite.role as "owner" | "admin" | "viewer" },
    });
    await tx.invitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  });

  return { tenantId: invite.tenant_id };
}

/**
 * Switches the active org in the session. This is the ONLY code path that
 * changes activeTenantId, and it always re-verifies membership server-side
 * via isUserMemberOfTenant before trusting the requested tenant — so
 * editing a cookie or passing ?tenantId= in a URL cannot grant access to a
 * tenant the user doesn't belong to. See auth.ts jwt() callback for the
 * enforcement side of this.
 */
export async function switchActiveOrg(input: z.infer<typeof switchOrgSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const { tenantId } = switchOrgSchema.parse(input);

  const ok = await isUserMemberOfTenant(session.user.id, tenantId);
  if (!ok) throw new Error("Not a member of that organisation");

  // Triggers the jwt() callback's `trigger === "update"` branch, which
  // re-verifies membership again server-side before writing the token.
  await unstable_update({ user: { activeTenantId: tenantId } });

  return { ok: true };
}
