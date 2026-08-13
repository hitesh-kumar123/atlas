"use server";

import { basePrisma } from "@/lib/prisma";

export interface OpsOverviewMetrics {
  totalTenants: number;
  totalEvents: number;
  totalUsers: number;
  activeTenants: number;
  suspendedTenants: number;
}

export interface OpsTenantRecord {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  userCount: number;
  eventCount: number;
  createdAt: string;
  isSuspended: boolean;
}

/** Fetch global platform telemetry using SECURITY DEFINER procedure (ADR-004) */
export async function getOpsOverviewMetrics(): Promise<OpsOverviewMetrics> {
  const rows = await basePrisma.$queryRaw<
    Array<{
      total_tenants: bigint;
      total_events: bigint;
      total_users: bigint;
      active_tenants: bigint;
      suspended_tenants: bigint;
    }>
  >`SELECT * FROM get_ops_overview_metrics()`;

  const row = rows[0];

  return {
    totalTenants: Number(row?.total_tenants ?? 0),
    totalEvents: Number(row?.total_events ?? 0),
    totalUsers: Number(row?.total_users ?? 0),
    activeTenants: Number(row?.active_tenants ?? 0),
    suspendedTenants: Number(row?.suspended_tenants ?? 0),
  };
}

/** Fetch all platform tenants directory */
export async function getOpsTenantsList(): Promise<OpsTenantRecord[]> {
  const rows = await basePrisma.$queryRaw<
    Array<{
      tenant_id: string;
      tenant_name: string;
      tenant_slug: string;
      user_count: bigint;
      event_count: bigint;
      created_at: Date;
      is_suspended: boolean;
    }>
  >`SELECT * FROM get_ops_tenants_list()`;

  return rows.map((r) => ({
    tenantId: r.tenant_id,
    tenantName: r.tenant_name,
    tenantSlug: r.tenant_slug,
    userCount: Number(r.user_count),
    eventCount: Number(r.event_count),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    isSuspended: Boolean(r.is_suspended),
  }));
}

/** Toggle emergency tenant suspension for platform operations */
export async function toggleTenantSuspension(tenantId: string, suspend: boolean) {
  await basePrisma.$executeRaw`SELECT set_tenant_suspension(${tenantId}, ${suspend})`;
  return { success: true, tenantId, suspended: suspend };
}
