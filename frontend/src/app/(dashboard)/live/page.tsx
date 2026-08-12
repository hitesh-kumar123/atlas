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

    // Connect to Server-Sent Events (SSE) stream endpoint (No Polling!)
    const eventSource = new EventSource("http://localhost:4000/api/v1/events/stream");

    eventSource.onmessage = (event) => {
      try {
        const parsed: LiveEvent = JSON.parse(event.data);
        setEvents((prev) => [parsed, ...prev.slice(0, 49)]); // Keep last 50 events
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
    <div style={{ display: "flex", gap: "1.5rem", height: "calc(100vh - 180px)" }}>
      {/* Event Stream List */}
      <div className="glass-card" style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: isLiveStreamActive ? "#00ffcc" : "#ff4444",
                boxShadow: isLiveStreamActive ? "0 0 10px #00ffcc" : "none",
              }}
            />
            <h2 style={{ fontSize: "1.2rem", color: "#e8e0f0" }}>
              Live Event Feed (Server-Sent Events)
            </h2>
          </div>

          <button
            onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
            className={isLiveStreamActive ? "btn-neon-pink" : "btn-neon-cyan"}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
          >
            {isLiveStreamActive ? "Pause Stream" : "Resume Stream"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {events.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#a098b0" }}>
              Connecting to SSE live event stream...
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: selectedEvent?.id === evt.id ? "rgba(255, 45, 120, 0.15)" : "var(--surface-dim)",
                  border: selectedEvent?.id === evt.id ? "1px solid #ff2d78" : "1px solid var(--border-glass)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', monospace",
                      fontSize: "0.85rem",
                      color: "#00ffcc",
                      fontWeight: 600,
                    }}
                  >
                    {evt.name}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#a098b0" }}>
                    ID: {evt.distinctId}
                  </span>
                </div>

                <div style={{ fontSize: "0.75rem", color: "#5a5068", fontFamily: "'Space Grotesk', monospace" }}>
                  {new Date(evt.occurredAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* JSON Inspector Panel */}
      <div className="glass-card" style={{ width: "380px", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "1rem", color: "#e8e0f0", marginBottom: "1rem" }}>
          Event Properties Inspector
        </h3>

        {selectedEvent ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace" }}>
                EVENT NAME
              </div>
              <div style={{ color: "#ff2d78", fontWeight: 700, fontSize: "1.1rem" }}>
                {selectedEvent.name}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace" }}>
                USER DISTINCT ID
              </div>
              <div style={{ color: "#e8e0f0", fontSize: "0.95rem" }}>
                {selectedEvent.distinctId}
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "0.75rem", color: "#a098b0", fontFamily: "'Space Grotesk', monospace", marginBottom: "0.4rem" }}>
                RAW JSON PROPERTIES
              </div>
              <pre
                style={{
                  flex: 1,
                  background: "#0a0a12",
                  border: "1px solid var(--border-glass)",
                  padding: "1rem",
                  borderRadius: "6px",
                  color: "#00ffcc",
                  fontSize: "0.8rem",
                  fontFamily: "'Space Grotesk', monospace",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(selectedEvent.properties, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "#5a5068", fontSize: "0.9rem" }}>
            Click on any live event row to inspect JSON properties
          </div>
        )}
      </div>
    </div>
  );
}
