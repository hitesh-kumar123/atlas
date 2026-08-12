"use client";

import React, { useState, useEffect } from "react";

interface LiveEvent {
  id: string;
  name: string;
  distinctId: string;
  properties: Record<string, any>;
  occurredAt: string;
}

export default function LiveFeedPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);

  useEffect(() => {
    if (!isLiveStreamActive) return;

    const eventSource = new EventSource("http://localhost:4000/api/v1/events/stream");

    eventSource.onmessage = (event) => {
      try {
        const parsed: LiveEvent = JSON.parse(event.data);
        setEvents((prev) => [parsed, ...prev.slice(0, 49)]);
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isLiveStreamActive]);

  return (
    <div style={{ display: "flex", gap: "1.75rem", height: "calc(100vh - 210px)" }}>
      {/* Live Event Stream List */}
      <div className="card-premium" style={{ flex: 1, padding: "2rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: isLiveStreamActive ? "var(--accent-emerald)" : "var(--accent-terra)",
              }}
            />
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-dark)" }}>
              Real-Time Event Stream (SSE)
            </h2>
          </div>

          <button
            onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
            className={isLiveStreamActive ? "btn-secondary" : "btn-primary"}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
          >
            {isLiveStreamActive ? "Pause Stream" : "Resume Stream"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {events.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              Connecting to SSE live event stream...
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                style={{
                  padding: "0.85rem 1.1rem",
                  borderRadius: "8px",
                  background: selectedEvent?.id === evt.id ? "var(--surface-muted)" : "var(--surface-white)",
                  border: selectedEvent?.id === evt.id ? "1px solid var(--text-dark)" : "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', monospace",
                      fontSize: "0.88rem",
                      color: "var(--text-dark)",
                      fontWeight: 600,
                    }}
                  >
                    {evt.name}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    User: {evt.distinctId}
                  </span>
                </div>

                <div style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontFamily: "'Space Grotesk', monospace" }}>
                  {new Date(evt.occurredAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* JSON Inspector Panel */}
      <div className="card-premium" style={{ width: "400px", padding: "2rem", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text-dark)", marginBottom: "1.25rem" }}>
          Event Properties Inspector
        </h3>

        {selectedEvent ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
                EVENT NAME
              </div>
              <div style={{ color: "var(--text-dark)", fontWeight: 700, fontSize: "1.15rem", marginTop: "0.15rem" }}>
                {selectedEvent.name}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600 }}>
                DISTINCT USER ID
              </div>
              <div style={{ color: "var(--text-dark)", fontSize: "0.95rem", marginTop: "0.15rem" }}>
                {selectedEvent.distinctId}
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'Space Grotesk', monospace", fontWeight: 600, marginBottom: "0.4rem" }}>
                RAW JSON PAYLOAD
              </div>
              <pre
                style={{
                  flex: 1,
                  background: "var(--surface-muted)",
                  border: "1px solid var(--border-light)",
                  padding: "1rem",
                  borderRadius: "8px",
                  color: "var(--text-dark)",
                  fontSize: "0.82rem",
                  fontFamily: "'Space Grotesk', monospace",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(selectedEvent.properties, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-subtle)", fontSize: "0.9rem" }}>
            Click on any live event row to inspect JSON properties
          </div>
        )}
      </div>
    </div>
  );
}
