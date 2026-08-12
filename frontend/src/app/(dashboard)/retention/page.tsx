"use client";

import React from "react";

export default function RetentionGridPage() {
  const weeks = ["Week 0", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"];

  const cohortData = [
    { cohort: "Aug 05, 2026", users: 12400, retention: [100, 58.2, 42.1, 35.6, 29.8, 25.4, 22.1, 19.8] },
    { cohort: "Jul 29, 2026", users: 11800, retention: [100, 61.0, 44.5, 38.2, 32.1, 28.0, 24.5, null] },
    { cohort: "Jul 22, 2026", users: 14200, retention: [100, 59.4, 41.8, 34.2, 28.5, 24.1, null, null] },
    { cohort: "Jul 15, 2026", users: 10900, retention: [100, 64.1, 47.2, 40.1, 35.0, null, null, null] },
    { cohort: "Jul 08, 2026", users: 13500, retention: [100, 56.8, 39.9, 32.5, null, null, null, null] },
    { cohort: "Jul 01, 2026", users: 15100, retention: [100, 62.5, 45.0, null, null, null, null, null] },
  ];

  const getHeatmapBg = (val: number | null) => {
    if (val === null) return "transparent";
    if (val >= 80) return "rgba(0, 255, 204, 0.4)";
    if (val >= 50) return "rgba(0, 255, 204, 0.25)";
    if (val >= 30) return "rgba(0, 255, 204, 0.15)";
    return "rgba(0, 255, 204, 0.06)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", color: "#e8e0f0" }}>Cohort Retention Grid</h2>
        <p style={{ color: "#a098b0", fontSize: "0.85rem", marginTop: "0.2rem" }}>
          N-week cohort retention percentage matrix by signup week
        </p>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "6px", textAlign: "center" }}>
          <thead>
            <tr style={{ color: "#a098b0", fontSize: "0.8rem", fontFamily: "'Space Grotesk', monospace" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>COHORT WEEK</th>
              <th style={{ padding: "0.5rem" }}>USERS</th>
              {weeks.map((w) => (
                <th key={w} style={{ padding: "0.5rem" }}>
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((row) => (
              <tr key={row.cohort}>
                <td
                  style={{
                    textAlign: "left",
                    padding: "0.6rem 0.8rem",
                    fontSize: "0.85rem",
                    fontFamily: "'Space Grotesk', monospace",
                    color: "#00ffcc",
                  }}
                >
                  {row.cohort}
                </td>
                <td style={{ padding: "0.6rem", fontSize: "0.85rem", fontWeight: 600 }}>
                  {row.users.toLocaleString()}
                </td>

                {row.retention.map((val, idx) => (
                  <td
                    key={idx}
                    style={{
                      padding: "0.6rem",
                      borderRadius: "6px",
                      background: getHeatmapBg(val),
                      color: val !== null ? "#e8e0f0" : "#5a5068",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      fontFamily: "'Space Grotesk', monospace",
                      border: val !== null ? "1px solid rgba(0, 255, 204, 0.2)" : "1px solid transparent",
                    }}
                  >
                    {val !== null ? `${val.toFixed(1)}%` : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
