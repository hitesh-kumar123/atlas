import Link from "next/link";
import { LumenLogo } from "@/components/LumenLogo";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Navigation */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem 3rem",
          borderBottom: "1px solid var(--border-glass)",
          backgroundColor: "rgba(10, 10, 18, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <LumenLogo size="md" />
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/login" style={{ color: "#a098b0", textDecoration: "none", fontWeight: 500 }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn-neon-pink" style={{ textDecoration: "none" }}>
            Get Started
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
          padding: "4rem 2rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "0.4rem 1rem",
            borderRadius: "20px",
            background: "rgba(0, 255, 204, 0.1)",
            border: "1px solid rgba(0, 255, 204, 0.3)",
            color: "#00ffcc",
            fontSize: "0.85rem",
            fontFamily: "'Space Grotesk', monospace",
            marginBottom: "1.5rem",
          }}
        >
          ● Multi-Tenant Analytics Engine • 10M Rows in &lt;300ms
        </div>

        <h1
          style={{
            fontSize: "3.8rem",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, #ffffff 0%, #a098b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Product Analytics for High-Volume Engineering Teams
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#a098b0",
            maxWidth: "750px",
            lineHeight: 1.6,
            marginBottom: "2.5rem",
          }}
        >
          Provable tenant isolation via Postgres Row Level Security. Real-time event ingestion, 
          single-pass window function funnels, and streaming SSR dashboards.
        </p>

        <div style={{ display: "flex", gap: "1.2rem", marginBottom: "4rem" }}>
          <Link href="/signup" className="btn-neon-pink" style={{ textDecoration: "none", fontSize: "1.1rem" }}>
            Open Dashboard
          </Link>
          <Link href="/overview" className="btn-neon-cyan" style={{ textDecoration: "none", fontSize: "1.1rem" }}>
            Explore Live Demo
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            textAlign: "left",
          }}
        >
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ color: "#ff2d78", marginBottom: "0.75rem", fontSize: "1.2rem" }}>
              🔒 Postgres Row Level Security
            </h3>
            <p style={{ color: "#a098b0", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Database-enforced tenant isolation via SET LOCAL transaction variables. 
              Tenant A's data is provably invisible to Tenant B.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ color: "#00ffcc", marginBottom: "0.75rem", fontSize: "1.2rem" }}>
              ⚡ High-Speed Ingestion &amp; Rollups
            </h3>
            <p style={{ color: "#a098b0", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Absorb writes fast with token-bucket rate limiting, 24-hour idempotency, 
              and automated hourly/daily pre-aggregated rollup read paths.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ color: "#ffe04a", marginBottom: "0.75rem", fontSize: "1.2rem" }}>
              📈 O(1) Single-Pass Funnels
            </h3>
            <p style={{ color: "#a098b0", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Single-pass SQL window functions (`LAG` / `FIRST_VALUE`) for 2-6 step conversion 
              funnels without expensive O(steps) self-joins.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          borderTop: "1px solid var(--border-glass)",
          color: "#5a5068",
          fontSize: "0.9rem",
        }}
      >
        Lumen Product Analytics System • Built with Next.js 15 App Router &amp; Postgres RLS
      </footer>
    </div>
  );
}
