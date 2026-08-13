"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LumenLogo } from "@/components/LumenLogo";

function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active tenant & user profile state
  const [activeOrg, setActiveOrg] = useState<{ name: string; slug: string; role: string }>({
    name: "My Workspace",
    slug: "my-workspace",
    role: "Owner",
  });
  const [userName, setUserName] = useState<string>("Hitesh");
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgsList, setOrgsList] = useState<Array<{ name: string; slug: string; role: string }>>([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("lumen_user");
      const storedTenant = localStorage.getItem("lumen_tenant");

      let currentUserName = "Hitesh";
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.name) {
          currentUserName = parsedUser.name;
          setUserName(parsedUser.name);
        }
      }

      let currentOrg = {
        name: `${currentUserName}'s Workspace`,
        slug: `${currentUserName.toLowerCase().replace(/\s+/g, "-")}-workspace`,
        role: "Owner",
      };

      if (storedTenant) {
        const parsedTenant = JSON.parse(storedTenant);
        if (parsedTenant?.name) {
          currentOrg = {
            name: parsedTenant.name,
            slug: parsedTenant.slug || parsedTenant.name.toLowerCase().replace(/\s+/g, "-"),
            role: "Owner",
          };
        }
      }

      setActiveOrg(currentOrg);
      setOrgsList([currentOrg]);
    } catch {
      // Fallback
    }
  }, []);

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
        padding: "0.85rem 2.5rem",
        borderBottom: "1px solid var(--border-light)",
        backgroundColor: "var(--surface-white)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        {/* Logo links back home to / */}
        <LumenLogo size="md" href="/" />

        {/* Active Tenant Switcher Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--surface-muted)",
              border: "1px solid var(--border-light)",
              color: "var(--text-dark)",
              padding: "0.45rem 0.85rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              fontFamily: "'Sora', sans-serif",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span>{activeOrg.name}</span>
            <span className="badge-emerald" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
              {activeOrg.role}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {orgDropdownOpen && (
            <div
              className="card-premium"
              style={{
                position: "absolute",
                top: "115%",
                left: 0,
                width: "220px",
                padding: "0.5rem",
                zIndex: 200,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.4rem 0.6rem", fontWeight: 600 }}>
                SELECT TENANT WORKSPACE
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
                    background: org.slug === activeOrg.slug ? "var(--surface-muted)" : "transparent",
                    color: "var(--text-dark)",
                    fontSize: "0.85rem",
                    fontWeight: org.slug === activeOrg.slug ? 600 : 400,
                  }}
                >
                  <span>{org.name}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{org.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Selector & User Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--surface-muted)",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            padding: "0.3rem 0.6rem",
            fontSize: "0.8rem",
            color: "var(--text-body)",
            fontFamily: "'Space Grotesk', monospace",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{currentFrom} → {currentTo}</span>
          <div style={{ display: "flex", gap: "2px", marginLeft: "4px" }}>
            <button
              onClick={() => handleDateChange("7d")}
              style={{
                background: "var(--surface-white)",
                border: "1px solid var(--border-light)",
                color: "var(--text-dark)",
                cursor: "pointer",
                padding: "0.15rem 0.4rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              7D
            </button>
            <button
              onClick={() => handleDateChange("30d")}
              style={{
                background: "var(--surface-white)",
                border: "1px solid var(--border-light)",
                color: "var(--text-dark)",
                cursor: "pointer",
                padding: "0.15rem 0.4rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              30D
            </button>
            <button
              onClick={() => handleDateChange("90d")}
              style={{
                background: "var(--surface-white)",
                border: "1px solid var(--border-light)",
                color: "var(--text-dark)",
                cursor: "pointer",
                padding: "0.15rem 0.4rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              90D
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
            <div style={{ fontWeight: 600, color: "var(--text-dark)" }}>{userName}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Owner</div>
          </div>
          <Link
            href="/login"
            onClick={() => {
              localStorage.removeItem("lumen_user");
              localStorage.removeItem("lumen_tenant");
            }}
            style={{ color: "var(--accent-terra)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}
          >
            Sign Out
          </Link>
        </div>
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
    { label: "Ops Console", href: "/ops", badge: "OPS" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-stone)" }}>
      <Suspense fallback={<div style={{ height: "60px", background: "var(--surface-white)" }} />}>
        <DashboardHeader />
      </Suspense>

      <nav
        style={{
          display: "flex",
          gap: "1.75rem",
          padding: "0 2.5rem",
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "var(--surface-white)",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.85rem 0.2rem",
                color: isActive ? "var(--text-dark)" : "var(--text-muted)",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.9rem",
                borderBottom: isActive ? "2px solid var(--text-dark)" : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              {item.label}
              {item.badge && <span className="badge-emerald">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      <main style={{ flex: 1, padding: "2.5rem" }}>{children}</main>
    </div>
  );
}
