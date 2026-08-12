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
      name: "Staging Ingestion Engine",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: "1000px" }}>
      {/* Header */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", color: "var(--text-dark)" }}>API Key Management</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
          Issue and manage ingestion tokens for client applications. Keys are shown once at creation.
        </p>
      </div>

      {/* Secret Key Modal Banner */}
      {createdKeySecret && (
        <div
          style={{
            padding: "1.5rem 1.75rem",
            borderRadius: "12px",
            background: "var(--accent-emerald-bg)",
            border: "1px solid var(--accent-emerald)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ color: "var(--accent-emerald)", fontWeight: 700, fontSize: "1rem" }}>
            API Key Generated Successfully
          </div>
          <div style={{ color: "var(--text-body)", fontSize: "0.85rem" }}>
            Make sure to copy your API key now. You will not be able to view it again!
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--surface-white)",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border-light)",
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
                color: "var(--text-dark)",
                fontSize: "0.95rem",
                fontFamily: "'Space Grotesk', monospace",
                fontWeight: 600,
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdKeySecret);
                alert("API Key copied to clipboard!");
              }}
              className="btn-primary"
              style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }}
            >
              Copy Key
            </button>
            <button
              onClick={() => setCreatedKeySecret(null)}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Create Key Form */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <form onSubmit={handleCreateKey} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', monospace",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              New Key Identifier
            </label>
            <input
              type="text"
              required
              className="input-premium"
              placeholder="e.g. Production Ingestion Engine"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "0.75rem 1.6rem" }}>
            + Create API Key
          </button>
        </form>
      </div>

      {/* Keys Table */}
      <div className="card-premium" style={{ padding: "2rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <th style={{ padding: "0.85rem 1rem" }}>NAME</th>
              <th style={{ padding: "0.85rem 1rem" }}>KEY PREFIX</th>
              <th style={{ padding: "0.85rem 1rem" }}>LAST USED</th>
              <th style={{ padding: "0.85rem 1rem" }}>STATUS</th>
              <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-dark)" }}>{k.name}</td>
                <td style={{ padding: "0.85rem 1rem", fontFamily: "'Space Grotesk', monospace", color: "var(--text-dark)" }}>
                  {k.keyPrefix}...
                </td>
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <span className={k.revokedAt ? "badge-terra" : "badge-emerald"}>
                    {k.revokedAt ? "REVOKED" : "ACTIVE"}
                  </span>
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                  {!k.revokedAt && (
                    <button
                      onClick={() => handleRevokeKey(k.id)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--accent-terra)",
                        color: "var(--accent-terra)",
                        padding: "0.3rem 0.7rem",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        fontWeight: 500,
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
