import Link from "next/link";
import { LumenLogo } from "@/components/LumenLogo";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-stone)" }}>
      {/* Header Navigation */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 3rem",
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "rgba(251, 251, 250, 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <LumenLogo size="md" href="/" />

        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <Link href="/login" style={{ color: "var(--text-body)", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem" }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary" style={{ textDecoration: "none" }}>
            Start Free Trial →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "5rem 2rem 4rem 2rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0.4rem 1rem",
            borderRadius: "100px",
            background: "var(--surface-white)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
            color: "var(--text-dark)",
            fontSize: "0.85rem",
            fontWeight: 500,
            marginBottom: "2rem",
          }}
        >
          <span className="badge-emerald">SYSTEM ONLINE</span>
          <span style={{ color: "var(--text-muted)" }}>Multi-Tenant Row Level Security &amp; Ingestion</span>
        </div>

        <h1
          style={{
            fontSize: "4.2rem",
            fontWeight: 800,
            lineHeight: 1.08,
            marginBottom: "1.75rem",
            color: "var(--text-dark)",
            letterSpacing: "-0.04em",
            maxWidth: "900px",
          }}
        >
          Honest Product Analytics for High-Scale Teams
        </h1>

        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--text-body)",
            maxWidth: "720px",
            lineHeight: 1.6,
            marginBottom: "2.75rem",
            fontWeight: 400,
          }}
        >
          Provable database tenant isolation powered by Postgres RLS. Absorb high-volume 
          writes fast with 24-hour idempotency and single-pass window function funnels.
        </p>

        <div style={{ display: "flex", gap: "1.25rem", marginBottom: "4.5rem" }}>
          <Link href="/signup" className="btn-primary" style={{ textDecoration: "none", padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
            Get Started Now
          </Link>
          <Link href="/overview" className="btn-secondary" style={{ textDecoration: "none", padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
            Explore Live Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.75rem",
            width: "100%",
            textAlign: "left",
          }}
        >
          <div className="card-premium" style={{ padding: "2.25rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "var(--surface-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              Database-Level Isolation
            </h3>
            <p style={{ color: "var(--text-body)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Enforced at the Postgres database boundary via Row Level Security (RLS). 
              Tenant data is provably isolated even under buggy query handlers.
            </p>
          </div>

          <div className="card-premium" style={{ padding: "2.25rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "var(--accent-emerald-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              Fast Ingestion &amp; Rollups
            </h3>
            <p style={{ color: "var(--text-body)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Ingest batches up to 500 events with 24-hour idempotency and token bucket rate limiting. 
              Pre-aggregated hourly and daily rollup read paths.
            </p>
          </div>

          <div className="card-premium" style={{ padding: "2.25rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "var(--accent-terra-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-terra)" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              Single-Pass Funnels
            </h3>
            <p style={{ color: "var(--text-body)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Single-pass SQL window functions evaluate 2 to 6 step conversion funnels 
              in O(1) database scans without expensive self-joins.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "2.5rem 2rem",
          borderTop: "1px solid var(--border-light)",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
          background: "var(--surface-white)",
        }}
      >
        Lumen Product Analytics System • Built with Next.js 15 App Router &amp; Postgres RLS
      </footer>
    </div>
  );
}
