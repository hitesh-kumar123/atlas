import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { basePrisma, withTenant } from "./prisma";

const KEY_PREFIX = "atlas_live_";

export async function createApiKey(tenantId: string, name: string) {
  const secret = randomBytes(24).toString("base64url");
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

export async function verifyApiKey(plaintextKey: string): Promise<{ tenantId: string; apiKeyId: string } | null> {
  if (!plaintextKey || !plaintextKey.startsWith(KEY_PREFIX)) {
    return null;
  }

  const prefix = plaintextKey.slice(0, 8 + KEY_PREFIX.length);

  const candidates = await basePrisma.$queryRaw<
    { id: string; tenant_id: string; key_hash: string; revoked_at: Date | null }[]
  >`SELECT * FROM get_api_keys_by_prefix(${prefix})`;

  for (const candidate of candidates) {
    if (candidate.revoked_at) continue;

    const valid = await argon2.verify(candidate.key_hash, plaintextKey);
    if (valid) {
      basePrisma.$executeRaw`UPDATE api_keys SET "lastUsedAt" = NOW() WHERE id = ${candidate.id}`.catch(() => {});
      return { tenantId: candidate.tenant_id, apiKeyId: candidate.id };
    }
  }

  return null;
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
