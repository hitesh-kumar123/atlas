"use client";

import React, { useState } from "react";

interface TenantOpsRecord {
  id: string;
  name: string;
  slug: string;
  users: number;
  events: number;
  plan: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export default function OpsConsolePage() {
  const [tenants, setTenants] = useState<TenantOpsRecord[]>([
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
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenantForSuspension, setSelectedTenantForSuspension] = useState<TenantOpsRecord | null>(null);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSuspension = (tenantId: string) => {
    setTenants(
      tenants.map((t) => {
        if (t.id === tenantId) {
          const nextStatus = t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    setSelectedTenantForSuspension(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header Banner */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", color: "var(--text-dark)" }}>Internal Ops Console</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
              Platform operator administration &amp; cross-tenant telemetry (SECURITY DEFINER procedures)
            </p>
          </div>
          <span className="badge-emerald" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}>
            SYSTEM HEALTH: OPTIMAL
          </span>
        </div>
      </div>

      {/* Platform Telemetry Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            TOTAL PLATFORM TENANTS
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "0.3rem" }}>
            {tenants.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", marginTop: "0.4rem", fontWeight: 500 }}>
            3 Active • 1 Suspended
          </div>
        </div>

        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            GLOBAL EVENTS PROCESSED
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--accent-terra)", marginTop: "0.3rem" }}>
            52.4M
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Raw Events + Rollups
          </div>
        </div>

        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            ACTIVE PLATFORM USERS
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "0.3rem" }}>
            81
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", marginTop: "0.4rem", fontWeight: 500 }}>
            Across 4 Organizations
          </div>
        </div>

        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            DATABASE CONNECTION POOL
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "0.3rem" }}>
            14 / 20
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            app_user pool role
          </div>
        </div>
      </div>

      {/* Emergency Suspension Confirmation Modal */}
      {selectedTenantForSuspension && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card-premium" style={{ width: "420px", padding: "2rem", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-dark)", marginBottom: "0.75rem" }}>
              {selectedTenantForSuspension.status === "ACTIVE"
                ? "Suspend Tenant Ingestion?"
                : "Reactivate Tenant Workspace?"}
            </h3>
            <p style={{ color: "var(--text-body)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              {selectedTenantForSuspension.status === "ACTIVE"
                ? `Suspending ${selectedTenantForSuspension.name} will immediately block POST /api/v1/events ingestion requests for this organization.`
                : `Reactivating ${selectedTenantForSuspension.name} will restore API ingestion and analytics access.`}
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedTenantForSuspension(null)}
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleSuspension(selectedTenantForSuspension.id)}
                className="btn-primary"
                style={{
                  background: selectedTenantForSuspension.status === "ACTIVE" ? "var(--accent-terra)" : "var(--accent-emerald)",
                  borderColor: selectedTenantForSuspension.status === "ACTIVE" ? "var(--accent-terra)" : "var(--accent-emerald)",
                  padding: "0.5rem 1.2rem",
                }}
              >
                Confirm {selectedTenantForSuspension.status === "ACTIVE" ? "Suspension" : "Activation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory & Management Table */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-dark)" }}>Tenant Directory &amp; Status Controls</h3>

          <input
            type="text"
            className="input-premium"
            style={{ width: "260px", padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
            placeholder="Search tenant name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <th style={{ padding: "0.85rem 1rem" }}>TENANT NAME</th>
              <th style={{ padding: "0.85rem 1rem" }}>TENANT SLUG</th>
              <th style={{ padding: "0.85rem 1rem" }}>MEMBERS</th>
              <th style={{ padding: "0.85rem 1rem" }}>EVENTS INGESTED</th>
              <th style={{ padding: "0.85rem 1rem" }}>PLAN TIER</th>
              <th style={{ padding: "0.85rem 1rem" }}>STATUS</th>
              <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>OPS ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-dark)" }}>
                  {tenant.name}
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace" }}>
                    ID: {tenant.id}
                  </div>
                </td>
                <td style={{ padding: "0.85rem 1rem", fontFamily: "'Space Grotesk', monospace", color: "var(--text-muted)" }}>
                  {tenant.slug}
                </td>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{tenant.users} users</td>
                <td style={{ padding: "0.85rem 1rem", fontFamily: "'Space Grotesk', monospace" }}>
                  {(tenant.events / 1_000_000).toFixed(2)}M
                </td>
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.85rem" }}>{tenant.plan}</td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <span className={tenant.status === "ACTIVE" ? "badge-emerald" : "badge-terra"}>
                    {tenant.status}
                  </span>
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                  <button
                    onClick={() => setSelectedTenantForSuspension(tenant)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border-medium)",
                      color: tenant.status === "ACTIVE" ? "var(--accent-terra)" : "var(--accent-emerald)",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tenant.status === "ACTIVE" ? "Emergency Suspend" : "Reactivate Tenant"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
