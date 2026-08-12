"use client";

import React, { Suspense, useState, useEffect } from "react";

interface OverviewMetrics {
  dau: number;
  wau: number;
  mau: number;
  totalEvents: number;
  topEvents: Array<{ name: string; count: number; percentage: number }>;
}

function OverviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-premium" style={{ padding: "1.5rem", height: "110px" }}>
            <div className="skeleton" style={{ width: "40%", height: "16px", marginBottom: "1rem" }} />
            <div className="skeleton" style={{ width: "70%", height: "32px" }} />
          </div>
        ))}
      </div>
      <div className="card-premium" style={{ padding: "1.75rem", height: "300px" }}>
        <div className="skeleton" style={{ width: "30%", height: "20px", marginBottom: "1.5rem" }} />
        <div className="skeleton" style={{ width: "100%", height: "200px" }} />
      </div>
    </div>
  );
}

function OverviewContent() {
  const [data, setData] = useState<OverviewMetrics | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        dau: 14280,
        wau: 68420,
        mau: 215900,
        totalEvents: 5241089,
        topEvents: [
          { name: "page_view", count: 2841090, percentage: 54.2 },
          { name: "button_click", count: 1120400, percentage: 21.4 },
          { name: "search", count: 642100, percentage: 12.2 },
          { name: "checkout_start", count: 398000, percentage: 7.6 },
          { name: "checkout_complete", count: 239499, percentage: 4.6 },
        ],
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!data) return <OverviewSkeleton />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 4 Stat Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            DAU (DAILY ACTIVE USERS)
          </div>
          <div style={{ fontSize: "2.3rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "0.3rem" }}>
            {data.dau.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", marginTop: "0.4rem", fontWeight: 600 }}>
            ↑ +14.2% vs previous period
          </div>
        </div>

        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            WAU (WEEKLY ACTIVE USERS)
          </div>
          <div style={{ fontSize: "2.3rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "0.3rem" }}>
            {data.wau.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", marginTop: "0.4rem", fontWeight: 600 }}>
            ↑ +8.7% vs previous period
          </div>
        </div>

        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            MAU (MONTHLY ACTIVE USERS)
          </div>
          <div style={{ fontSize: "2.3rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "0.3rem" }}>
            {data.mau.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", marginTop: "0.4rem", fontWeight: 600 }}>
            ↑ +22.1% vs previous period
          </div>
        </div>

        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
            TOTAL EVENT VOLUME
          </div>
          <div style={{ fontSize: "2.3rem", fontWeight: 700, color: "var(--accent-terra)", marginTop: "0.3rem" }}>
            {(data.totalEvents / 1_000_000).toFixed(2)}M
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Source: Raw events table
          </div>
        </div>
      </div>

      {/* Main Timeseries Chart Card */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-dark)" }}>Event Ingestion Trend</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Hourly event throughput across active tenant
            </p>
          </div>
          <span className="badge-emerald">STABLE</span>
        </div>

        <div
          style={{
            height: "220px",
            width: "100%",
            background: "linear-gradient(180deg, rgba(200, 90, 50, 0.08) 0%, rgba(251, 251, 250, 0) 100%)",
            borderBottom: "2px solid var(--accent-terra)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "flex-end",
            padding: "0 10px",
            gap: "10px",
          }}
        >
          {[40, 55, 30, 70, 85, 60, 90, 100, 75, 80, 95, 110, 85, 120].map((h, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${h}%`,
                background: "var(--accent-terra)",
                borderRadius: "4px 4px 0 0",
                opacity: 0.85,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Top Events Table Card */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1.25rem", color: "var(--text-dark)" }}>
          Top Events Breakdown
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <th style={{ padding: "0.85rem 1rem" }}>EVENT NAME</th>
              <th style={{ padding: "0.85rem 1rem" }}>TOTAL COUNT</th>
              <th style={{ padding: "0.85rem 1rem" }}>VOLUME SHARE</th>
            </tr>
          </thead>
          <tbody>
            {data.topEvents.map((evt) => (
              <tr key={evt.name} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem 1rem", fontFamily: "'Space Grotesk', monospace", color: "var(--text-dark)", fontWeight: 600 }}>
                  {evt.name}
                </td>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{evt.count.toLocaleString()}</td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1, background: "var(--surface-muted)", height: "8px", borderRadius: "4px" }}>
                      <div
                        style={{
                          width: `${evt.percentage}%`,
                          height: "100%",
                          background: "var(--accent-dark)",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", width: "45px", fontFamily: "'Space Grotesk', monospace" }}>
                      {evt.percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}
