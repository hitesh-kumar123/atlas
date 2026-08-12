"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LumenLogo } from "@/components/LumenLogo";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      if (res.ok) {
        router.push("/login?signup=success");
      } else {
        router.push("/overview");
      }
    } catch {
      router.push("/overview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "radial-gradient(circle at 50% 30%, #1a1a2e 0%, #0a0a12 70%)",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "2.5rem",
          boxShadow: "0 0 40px rgba(0, 255, 204, 0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <LumenLogo size="lg" />
          <h2 style={{ fontSize: "1.4rem", marginTop: "1rem", color: "#e8e0f0" }}>
            Create Tenant Account
          </h2>
          <p style={{ color: "#a098b0", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Start analyzing your product events in minutes
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "6px",
              background: "rgba(255, 68, 68, 0.15)",
              border: "1px solid #ff4444",
              color: "#ffa0a0",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "#a098b0",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', monospace",
                marginBottom: "0.3rem",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              required
              className="input-dark"
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "#a098b0",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', monospace",
                marginBottom: "0.3rem",
              }}
            >
              Organisation Name
            </label>
            <input
              type="text"
              required
              className="input-dark"
              placeholder="Acme Corp"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "#a098b0",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', monospace",
                marginBottom: "0.3rem",
              }}
            >
              Work Email
            </label>
            <input
              type="email"
              required
              className="input-dark"
              placeholder="alex@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "#a098b0",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', monospace",
                marginBottom: "0.3rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              minLength={10}
              className="input-dark"
              placeholder="At least 10 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon-cyan"
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Creating Account..." : "Create Tenant & Account →"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.75rem",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#a098b0",
          }}
        >
          Already registered?{" "}
          <Link href="/login" style={{ color: "#ff2d78", textDecoration: "none", fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
