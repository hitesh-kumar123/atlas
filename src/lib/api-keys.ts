import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { withTenant } from "./prisma";

const KEY_PREFIX = "atlas_live_";

/**
 * Creates a new API key for a tenant. Returns the plaintext key exactly
 * once — the caller is responsible for showing it to the user immediately
 * and never persisting the plaintext anywhere (logs included).
 */
export async function createApiKey(tenantId: string, name: string) {
  const secret = randomBytes(24).toString("base64url"); // ~32 chars, URL-safe
  const plaintextKey = `${KEY_PREFIX}${secret}`;
  const keyHash = await argon2.hash(plaintextKey);

  const record = await withTenant(tenantId, (tx) =>
    tx.apiKey.create({
      data: {
        tenantId,
        name,
        keyPrefix: plaintextKey.slice(0, 8 + KEY_PREFIX.length),
        keyHash,
      },
    }),
  );

  return { id: record.id, plaintextKey };
}

/**
 * Verifies a presented API key and returns the tenantId it belongs to,
 * or null if invalid/revoked. This intentionally does NOT go through
 * withTenant — at this point in the ingest flow we don't know the tenant
 * yet (that's what we're trying to find out), so it queries with the
 * app_user role but no app.tenant_id set. Because of FORCE ROW LEVEL
 * SECURITY, an unset app.tenant_id means the policy's `current_setting`
 * call returns NULL and matches nothing — so this lookup would return
 * zero rows under the tenant-scoped policy.
 *
 * That's why key lookup runs through a narrow SECURITY DEFINER function
 * instead (see prisma/migrations/0003_key_lookup — Phase 2), not a plain
 * Prisma query. Left as a Phase 2 TODO; ingest route wires it up then.
 */
export async function verifyApiKey(_plaintextKey: string): Promise<{ tenantId: string; apiKeyId: string } | null> {
  throw new Error("verifyApiKey: implemented in Phase 2 (see ingest route)");
}

export async function revokeApiKey(tenantId: string, apiKeyId: string) {
  return withTenant(tenantId, (tx) =>
    tx.apiKey.update({
      where: { id: apiKeyId },
      data: { revokedAt: new Date() },
    }),
  );
}

export async function listApiKeys(tenantId: string) {
  return withTenant(tenantId, (tx) =>
    tx.apiKey.findMany({
      where: { tenantId },
      select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, revokedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  );
}
