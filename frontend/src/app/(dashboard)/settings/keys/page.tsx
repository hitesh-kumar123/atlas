"use client";

import React, { useState } from "react";

interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([
    {
      id: "key_1",
      name: "Default Ingest Key",
      keyPrefix: "atlas_live_9a8f21b",
      lastUsedAt: "2026-08-12T14:20:00Z",
      createdAt: "2026-08-01T10:00:00Z",
      revokedAt: null,
    },
    {
      id: "key_2",
      name: "Staging Ingestion",
      keyPrefix: "atlas_live_3c4d5e6",
      lastUsedAt: null,
      createdAt: "2026-08-05T12:30:00Z",
      revokedAt: null,
    },
  ]);

  const [newKeyName, setNewKeyName] = useState("");
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const mockSecret = `atlas_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    const newRecord: ApiKeyRecord = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      keyPrefix: mockSecret.slice(0, 19),
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    };

    setKeys([newRecord, ...keys]);
    setCreatedKeySecret(mockSecret);
    setNewKeyName("");
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1000px" }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", color: "#e8e0f0" }}>API Key Management</h2>
        <p style={{ color: "#a098b0", fontSize: "0.85rem", marginTop: "0.2rem" }}>
          Issue and manage ingestion tokens for customer applications. Keys are shown once at creation.
        </p>
      </div>

      {/* Secret Key Modal Banner */}
      {createdKeySecret && (
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "10px",
            background: "rgba(0, 255, 204, 0.12)",
            border: "1px solid #00ffcc",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ color: "#00ffcc", fontWeight: 700, fontSize: "1rem" }}>
            🔑 API Key Generated Successfully!
          </div>
          <div style={{ color: "#a098b0", fontSize: "0.85rem" }}>
            Make sure to copy your API key now. You will not be able to see it again!
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#0a0a12",
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--border-glass)",
            }}
          >
            <input
              type="text"
              readOnly
              value={createdKeySecret}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#ff2d78",
                fontSize: "0.95rem",
                fontFamily: "'Space Grotesk', monospace",
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdKeySecret);
                alert("API Key copied to clipboard!");
              }}
              className="btn-neon-cyan"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Copy Key
            </button>
            <button
              onClick={() => setCreatedKeySecret(null)}
              style={{ background: "transparent", border: "none", color: "#a098b0", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Create Key Form */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <form onSubmit={handleCreateKey} style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "#a098b0",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', monospace",
                marginBottom: "0.4rem",
              }}
            >
              New Key Name
            </label>
            <input
              type="text"
              required
              className="input-dark"
              placeholder="e.g. Production Ingestion Engine"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-neon-pink" style={{ padding: "0.75rem 1.5rem" }}>
            + Create API Key
          </button>
        </form>
      </div>

      {/* Keys Table */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "#a098b0", fontSize: "0.8rem" }}>
              <th style={{ padding: "0.75rem" }}>NAME</th>
              <th style={{ padding: "0.75rem" }}>KEY PREFIX</th>
              <th style={{ padding: "0.75rem" }}>LAST USED</th>
              <th style={{ padding: "0.75rem" }}>STATUS</th>
              <th style={{ padding: "0.75rem", textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 600, color: "#e8e0f0" }}>{k.name}</td>
                <td style={{ padding: "0.75rem", fontFamily: "'Space Grotesk', monospace", color: "#00ffcc" }}>
                  {k.keyPrefix}...
                </td>
                <td style={{ padding: "0.75rem", fontSize: "0.85rem", color: "#a098b0" }}>
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      background: k.revokedAt ? "rgba(255, 68, 68, 0.2)" : "rgba(0, 255, 204, 0.2)",
                      color: k.revokedAt ? "#ff4444" : "#00ffcc",
                      fontWeight: 700,
                    }}
                  >
                    {k.revokedAt ? "REVOKED" : "ACTIVE"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  {!k.revokedAt && (
                    <button
                      onClick={() => handleRevokeKey(k.id)}
                      style={{
                        background: "transparent",
                        border: "1px solid #ff4444",
                        color: "#ff4444",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
