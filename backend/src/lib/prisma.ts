import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __atlasPrisma: PrismaClient | undefined;
}

export const basePrisma =
  global.__atlasPrisma ??
  new PrismaClient({
    datasourceUrl: process.env.APP_DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__atlasPrisma = basePrisma;
}

export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>,
): Promise<T> {
  return basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}
