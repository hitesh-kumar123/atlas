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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", height: "100px" }}>
            <div className="skeleton" style={{ width: "40%", height: "16px", marginBottom: "1rem" }} />
            <div className="skeleton" style={{ width: "70%", height: "32px" }} />
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: "1.5rem", height: "300px" }}>
        <div className="skeleton" style={{ width: "30%", height: "20px", marginBottom: "1.5rem" }} />
        <div className="skeleton" style={{ width: "100%", height: "200px" }} />
      </div>
    </div>
  );
}

function OverviewContent() {
  const [data, setData] = useState<OverviewMetrics | null>(null);

  useEffect(() => {
    // Simulated fetch or backend analytics API integration
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
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (!data) return <OverviewSkeleton />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 4 Stat Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace" }}>
            DAU (DAILY ACTIVE)
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#e8e0f0", marginTop: "0.25rem" }}>
            {data.dau.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00ffcc", marginTop: "0.5rem" }}>
            ▲ +14.2% vs prev period
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace" }}>
            WAU (WEEKLY ACTIVE)
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#e8e0f0", marginTop: "0.25rem" }}>
            {data.wau.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00ffcc", marginTop: "0.5rem" }}>
            ▲ +8.7% vs prev period
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace" }}>
            MAU (MONTHLY ACTIVE)
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#e8e0f0", marginTop: "0.25rem" }}>
            {data.mau.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00ffcc", marginTop: "0.5rem" }}>
            ▲ +22.1% vs prev period
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace" }}>
            TOTAL EVENT VOLUME
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#ff2d78", marginTop: "0.25rem" }}>
            {(data.totalEvents / 1_000_000).toFixed(2)}M
          </div>
          <div style={{ fontSize: "0.8rem", color: "#a098b0", marginTop: "0.5rem" }}>
            Source: Raw events table
          </div>
        </div>
      </div>

      {/* Main Event Volume Timeseries Chart Card */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#e8e0f0" }}>
          Event Volume Trend over Time
        </h3>
        <div
          style={{
            height: "220px",
            width: "100%",
            background: "linear-gradient(180deg, rgba(255, 45, 120, 0.15) 0%, rgba(10, 10, 18, 0) 100%)",
            borderBottom: "2px solid #ff2d78",
            borderRadius: "8px",
            display: "flex",
            alignItems: "flex-end",
            padding: "0 10px",
            gap: "8px",
          }}
        >
          {[40, 55, 30, 70, 85, 60, 90, 100, 75, 80, 95, 110, 85, 120].map((h, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${h}%`,
                background: "linear-gradient(180deg, #ff2d78 0%, rgba(255, 45, 120, 0.3) 100%)",
                borderRadius: "4px 4px 0 0",
                transition: "height 0.4s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Top Events Table Card */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#e8e0f0" }}>
          Top Events Breakdown
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "#a098b0", fontSize: "0.8rem" }}>
              <th style={{ padding: "0.75rem" }}>EVENT NAME</th>
              <th style={{ padding: "0.75rem" }}>TOTAL COUNT</th>
              <th style={{ padding: "0.75rem" }}>VOLUME SHARE</th>
            </tr>
          </thead>
          <tbody>
            {data.topEvents.map((evt) => (
              <tr key={evt.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.75rem", fontFamily: "'Space Grotesk', monospace", color: "#00ffcc" }}>
                  {evt.name}
                </td>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>{evt.count.toLocaleString()}</td>
                <td style={{ padding: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, background: "var(--surface-variant)", height: "8px", borderRadius: "4px" }}>
                      <div
                        style={{
                          width: `${evt.percentage}%`,
                          height: "100%",
                          background: "#ff2d78",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "#a098b0", width: "45px" }}>
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
