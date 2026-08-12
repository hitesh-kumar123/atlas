-- Migration 0001_init: Baseline tables setup for ATLAS

CREATE TYPE "Role" AS ENUM ('owner', 'admin', 'viewer');

CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "memberships_tenantId_userId_key" ON "memberships"("tenantId", "userId");
CREATE INDEX "memberships_tenantId_idx" ON "memberships"("tenantId");

CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'viewer',
    "token" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");
CREATE INDEX "invitations_tenantId_idx" ON "invitations"("tenantId");

CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "api_keys_tenantId_idx" ON "api_keys"("tenantId");

CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distinctId" TEXT NOT NULL,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "idempotencyKey" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "events_tenantId_occurredAt_idx" ON "events"("tenantId", "occurredAt");
CREATE INDEX "events_tenantId_name_occurredAt_idx" ON "events"("tenantId", "name", "occurredAt");
CREATE UNIQUE INDEX "events_tenantId_idempotencyKey_key" ON "events"("tenantId", "idempotencyKey");

-- Foreign Keys
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "events" ADD CONSTRAINT "events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
