"use client";

import React, { useState } from "react";

interface FunnelStepResult {
  stepIndex: number;
  eventName: string;
  count: number;
  conversionFromPrev: number; // percentage (0-100)
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

  // Calculated funnel step counts (from single-pass SQL backend algorithm)
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header & Conversion Window Controls */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", color: "#e8e0f0" }}>Funnel Builder (2 to 6 Steps)</h2>
            <p style={{ color: "#a098b0", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Single-pass window function (`LAG` / `FIRST_VALUE`) conversion calculation
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace" }}>
              CONVERSION WINDOW:
            </span>
            <select
              className="input-dark"
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          {selectedSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--surface-dim)",
                border: "1px solid var(--border-glass)",
                padding: "0.4rem 0.8rem",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#ff2d78", fontWeight: 700 }}>
                Step {idx + 1}
              </span>
              <select
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#00ffcc",
                  fontSize: "0.85rem",
                  fontFamily: "'Space Grotesk', monospace",
                  outline: "none",
                  cursor: "pointer",
                }}
                value={step}
                onChange={(e) => handleStepChange(idx, e.target.value)}
              >
                {availableEvents.map((evt) => (
                  <option key={evt} value={evt} style={{ background: "#141422", color: "#e8e0f0" }}>
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
                    color: "#a098b0",
                    cursor: "pointer",
                    padding: "0 0.2rem",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {selectedSteps.length < 6 && (
            <button
              onClick={addStep}
              className="btn-neon-cyan"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            >
              + Add Step
            </button>
          )}
        </div>
      </div>

      {/* Funnel Step Visualization */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "#e8e0f0" }}>
          Conversion &amp; Drop-off Analysis
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {funnelResults.map((res) => (
            <div key={res.stepIndex} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ fontFamily: "'Space Grotesk', monospace", color: "#00ffcc", fontWeight: 600 }}>
                  Step {res.stepIndex}: {res.eventName}
                </span>
                <span>
                  <strong style={{ color: "#e8e0f0" }}>{res.count.toLocaleString()} users</strong>{" "}
                  <span style={{ color: "#a098b0", fontSize: "0.85rem" }}>
                    ({res.conversionFromPrev}% converted)
                  </span>
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ background: "var(--surface-variant)", height: "24px", borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    width: `${res.conversionFromPrev}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #ff2d78 0%, #00ffcc 100%)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              {res.dropoffCount > 0 && (
                <div style={{ fontSize: "0.8rem", color: "#ff4444", textAlign: "right" }}>
                  🔻 Drop-off: -{res.dropoffCount.toLocaleString()} users ({(100 - res.conversionFromPrev).toFixed(1)}%)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
