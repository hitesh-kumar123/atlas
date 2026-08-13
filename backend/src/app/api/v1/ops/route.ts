import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    systemHealth: "OPTIMAL",
    metrics: {
      totalTenants: 142,
      totalEventsProcessed: 52410890,
      activeUsers: 84200,
      systemStorageMb: 412.8,
      dbConnectionPoolStatus: "14 / 20 active connections",
    },
    tenants: [
      {
        id: "ten_01",
        name: "Acme Corp",
        slug: "acme-corp",
        users: 48,
        events: 28410900,
        plan: "Enterprise",
        status: "ACTIVE",
        createdAt: "2026-08-01T10:00:00Z",
      },
      {
        id: "ten_02",
        name: "Globex Inc",
        slug: "globex-inc",
        users: 22,
        events: 14200100,
        plan: "Pro Growth",
        status: "ACTIVE",
        createdAt: "2026-08-04T11:20:00Z",
      },
      {
        id: "ten_03",
        name: "Initech LLC",
        slug: "initech-llc",
        users: 8,
        events: 6420500,
        plan: "Pro Growth",
        status: "ACTIVE",
        createdAt: "2026-08-06T14:15:00Z",
      },
      {
        id: "ten_04",
        name: "Umbrella Corp",
        slug: "umbrella-corp",
        users: 3,
        events: 3379390,
        plan: "Free Starter",
        status: "SUSPENDED",
        createdAt: "2026-08-08T09:00:00Z",
      },
    ],
  });
}
