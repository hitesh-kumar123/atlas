"use server";

import argon2 from "argon2";
import { z } from "zod";
import { basePrisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "org"
  );
}

export type SignupResult = { ok: true; userId: string; tenantId: string } | { ok: false; error: string };

/**
 * Signup creates User + Tenant + Membership(owner) atomically. If any part
 * fails, none of it persists — we never want a User with no Tenant, or a
 * Tenant with no owner.
 *
 * Note: this is one of the few writes that touches BOTH a tenant-scoped
 * table (Membership) and a non-tenant-scoped one (User, Tenant) in the
 * same transaction, and the tenant doesn't exist yet when the transaction
 * starts. We create the Tenant row first (untouched by RLS, since tenants
 * has no tenant_id column) to get its id, then SET LOCAL and create the
 * Membership row in the same transaction.
 */
export async function signup(input: z.infer<typeof signupSchema>): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, password, name, orgName } = parsed.data;

  const existing = await basePrisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists" };
  }

  const passwordHash = await argon2.hash(password);
  const baseSlug = slugify(orgName);

  try {
    const result = await basePrisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash, name },
      });

      // Ensure slug uniqueness with a small suffix on collision.
      let slug = baseSlug;
      for (let attempt = 0; attempt < 5; attempt++) {
        const clash = await tx.tenant.findUnique({ where: { slug } });
        if (!clash) break;
        slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      const tenant = await tx.tenant.create({
        data: { name: orgName, slug },
      });

      // Now that tenant.id exists, set app.tenant_id for this transaction
      // so the Membership insert (tenant-scoped, RLS + WITH CHECK) succeeds.
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;

      await tx.membership.create({
        data: { tenantId: tenant.id, userId: user.id, role: "owner" },
      });

      return { userId: user.id, tenantId: tenant.id };
    });

    return { ok: true, ...result };
  } catch (err) {
    console.error("signup failed", err);
    return { ok: false, error: "Could not create account" };
  }
}
