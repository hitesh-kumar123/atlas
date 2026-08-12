"use client";

import React, { useState } from "react";

interface FunnelStepResult {
  stepIndex: number;
  eventName: string;
  count: number;
  conversionFromPrev: number;
  dropoffCount: number;
}

export default function FunnelBuilderPage() {
  const [selectedSteps, setSelectedSteps] = useState<string[]>([
    "page_view",
    "signup_step",
    "checkout_start",
    "checkout_complete",
  ]);

  const [conversionWindowDays, setConversionWindowDays] = useState<number>(7);

  const availableEvents = [
    "page_view",
    "button_click",
    "search",
    "signup_step",
    "checkout_start",
    "checkout_complete",
  ];

  const funnelResults: FunnelStepResult[] = [
    { stepIndex: 1, eventName: selectedSteps[0] ?? "page_view", count: 125000, conversionFromPrev: 100, dropoffCount: 0 },
    { stepIndex: 2, eventName: selectedSteps[1] ?? "signup_step", count: 85500, conversionFromPrev: 68.4, dropoffCount: 39500 },
    { stepIndex: 3, eventName: selectedSteps[2] ?? "checkout_start", count: 42100, conversionFromPrev: 49.2, dropoffCount: 43400 },
    { stepIndex: 4, eventName: selectedSteps[3] ?? "checkout_complete", count: 28900, conversionFromPrev: 68.6, dropoffCount: 13200 },
  ].slice(0, selectedSteps.length);

  const handleStepChange = (index: number, newEvent: string) => {
    const updated = [...selectedSteps];
    updated[index] = newEvent;
    setSelectedSteps(updated);
  };

  const addStep = () => {
    if (selectedSteps.length < 6) {
      setSelectedSteps([...selectedSteps, availableEvents[0]!]);
    }
  };

  const removeStep = (index: number) => {
    if (selectedSteps.length > 2) {
      setSelectedSteps(selectedSteps.filter((_, idx) => idx !== index));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header & Controls */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", color: "var(--text-dark)" }}>Funnel Conversion Analysis</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Single-pass PostgreSQL window function calculation (`LAG` / `FIRST_VALUE`)
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
              CONVERSION WINDOW:
            </span>
            <select
              className="input-premium"
              style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
              value={conversionWindowDays}
              onChange={(e) => setConversionWindowDays(Number(e.target.value))}
            >
              <option value={1}>within 24 Hours</option>
              <option value={7}>within 7 Days</option>
              <option value={14}>within 14 Days</option>
              <option value={30}>within 30 Days</option>
            </select>
          </div>
        </div>

        {/* Step Selector Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {selectedSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "var(--surface-muted)",
                border: "1px solid var(--border-light)",
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--accent-dark)", fontWeight: 700, fontFamily: "'Space Grotesk', monospace" }}>
                Step {idx + 1}
              </span>
              <select
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dark)",
                  fontSize: "0.85rem",
                  fontFamily: "'Space Grotesk', monospace",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
                value={step}
                onChange={(e) => handleStepChange(idx, e.target.value)}
              >
                {availableEvents.map((evt) => (
                  <option key={evt} value={evt} style={{ background: "#ffffff", color: "#191817" }}>
                    {evt}
                  </option>
                ))}
              </select>
              {selectedSteps.length > 2 && (
                <button
                  onClick={() => removeStep(idx)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "0 0.2rem",
                    fontSize: "0.9rem",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {selectedSteps.length < 6 && (
            <button
              onClick={addStep}
              className="btn-secondary"
              style={{ padding: "0.45rem 0.9rem", fontSize: "0.85rem" }}
            >
              + Add Step
            </button>
          )}
        </div>
      </div>

      {/* Funnel Step Visualization */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1.75rem", color: "var(--text-dark)" }}>
          Conversion &amp; Drop-off Results
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {funnelResults.map((res) => (
            <div key={res.stepIndex} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ fontFamily: "'Space Grotesk', monospace", color: "var(--text-dark)", fontWeight: 600 }}>
                  Step {res.stepIndex}: {res.eventName}
                </span>
                <span>
                  <strong style={{ color: "var(--text-dark)" }}>{res.count.toLocaleString()} users</strong>{" "}
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    ({res.conversionFromPrev}% converted)
                  </span>
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ background: "var(--surface-muted)", height: "26px", borderRadius: "6px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${res.conversionFromPrev}%`,
                    height: "100%",
                    background: "var(--accent-dark)",
                    borderRadius: "6px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              {res.dropoffCount > 0 && (
                <div style={{ fontSize: "0.8rem", color: "var(--accent-terra)", textAlign: "right", fontWeight: 500 }}>
                  Drop-off: -{res.dropoffCount.toLocaleString()} users ({(100 - res.conversionFromPrev).toFixed(1)}%)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
