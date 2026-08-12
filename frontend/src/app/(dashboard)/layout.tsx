"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LumenLogo } from "@/components/LumenLogo";

function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeOrg, setActiveOrg] = useState({ name: "Acme Corp", slug: "acme-corp", role: "Owner" });
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  const orgsList = [
    { name: "Acme Corp", slug: "acme-corp", role: "Owner" },
    { name: "Globex Inc", slug: "globex-inc", role: "Admin" },
    { name: "Initech LLC", slug: "initech-llc", role: "Viewer" },
  ];

  const currentFrom = searchParams.get("from") ?? "2026-08-01";
  const currentTo = searchParams.get("to") ?? "2026-08-12";

  const handleDateChange = (preset: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const now = new Date();
    let fromDate = new Date();

    if (preset === "7d") {
      fromDate.setDate(now.getDate() - 7);
    } else if (preset === "30d") {
      fromDate.setDate(now.getDate() - 30);
    } else if (preset === "90d") {
      fromDate.setDate(now.getDate() - 90);
    }

    params.set("from", fromDate.toISOString().slice(0, 10));
    params.set("to", now.toISOString().slice(0, 10));

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.85rem 2rem",
        borderBottom: "1px solid var(--border-glass)",
        backgroundColor: "#0f0f1a",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <LumenLogo size="md" />

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--surface-container)",
              border: "1px solid var(--border-glass)",
              color: "#e8e0f0",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontFamily: "'Sora', sans-serif",
              cursor: "pointer",
            }}
          >
            <span style={{ fontWeight: 600 }}>{activeOrg.name}</span>
            <span
              style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.4rem",
                borderRadius: "4px",
                background: "rgba(255, 45, 120, 0.2)",
                color: "#ff2d78",
              }}
            >
              {activeOrg.role}
            </span>
            <span style={{ color: "#a098b0" }}>▼</span>
          </button>

          {orgDropdownOpen && (
            <div
              className="glass-card"
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                width: "220px",
                padding: "0.5rem",
                zIndex: 200,
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#a098b0", padding: "0.4rem 0.6rem" }}>
                Switch Tenant
              </div>
              {orgsList.map((org) => (
                <div
                  key={org.slug}
                  onClick={() => {
                    setActiveOrg(org);
                    setOrgDropdownOpen(false);
                  }}
                  style={{
                    padding: "0.5rem 0.6rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: org.slug === activeOrg.slug ? "rgba(255, 45, 120, 0.1)" : "transparent",
                    color: org.slug === activeOrg.slug ? "#ff2d78" : "#e8e0f0",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>{org.name}</span>
                  <span style={{ fontSize: "0.7rem", color: "#a098b0" }}>{org.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "var(--surface-dim)",
            border: "1px solid var(--border-glass)",
            borderRadius: "8px",
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            color: "#a098b0",
            fontFamily: "'Space Grotesk', monospace",
          }}
        >
          <span>📅 {currentFrom} → {currentTo}</span>
          <button
            onClick={() => handleDateChange("7d")}
            style={{
              background: "transparent",
              border: "none",
              color: "#00ffcc",
              cursor: "pointer",
              padding: "0.2rem 0.4rem",
              borderRadius: "4px",
            }}
          >
            7D
          </button>
          <button
            onClick={() => handleDateChange("30d")}
            style={{
              background: "transparent",
              border: "none",
              color: "#00ffcc",
              cursor: "pointer",
              padding: "0.2rem 0.4rem",
              borderRadius: "4px",
            }}
          >
            30D
          </button>
          <button
            onClick={() => handleDateChange("90d")}
            style={{
              background: "transparent",
              border: "none",
              color: "#00ffcc",
              cursor: "pointer",
              padding: "0.2rem 0.4rem",
              borderRadius: "4px",
            }}
          >
            90D
          </button>
        </div>

        <Link href="/login" style={{ color: "#a098b0", textDecoration: "none", fontSize: "0.85rem" }}>
          Sign Out
        </Link>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/overview" },
    { label: "Funnels", href: "/funnels" },
    { label: "Retention", href: "/retention" },
    { label: "Live Feed", href: "/live", badge: "LIVE" },
    { label: "API Keys", href: "/settings/keys" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Suspense fallback={<div style={{ height: "60px", background: "#0f0f1a" }} />}>
        <DashboardHeader />
      </Suspense>

      <nav
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "0 2rem",
          borderBottom: "1px solid var(--border-glass)",
          backgroundColor: "var(--bg-dark)",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.75rem 0.25rem",
                color: isActive ? "#ff2d78" : "#a098b0",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                borderBottom: isActive ? "2px solid #ff2d78" : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              {item.label}
              {item.badge && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "0.1rem 0.35rem",
                    borderRadius: "4px",
                    background: "#00ffcc",
                    color: "#000",
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
    </div>
  );
}
