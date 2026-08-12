"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LumenLogo } from "@/components/LumenLogo";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Work email is required.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address (e.g., alex@company.com).";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Invalid email or password combination.");
        setLoading(false);
        return;
      }

      router.push("/overview");
    } catch {
      setServerError("Unable to connect to authentication server. Please try again.");
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
        background: "var(--bg-stone)",
      }}
    >
      <div
        className="card-premium"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.75rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <LumenLogo size="lg" href="/" />
          <h2 style={{ fontSize: "1.5rem", marginTop: "1.25rem", color: "var(--text-dark)" }}>
            Welcome Back
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
            Sign in to access your analytics workspace
          </p>
        </div>

        {serverError && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "var(--accent-terra-bg)",
              border: "1px solid var(--accent-terra)",
              color: "var(--accent-terra)",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "1.5rem",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
          <div>
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
              Work Email
            </label>
            <input
              type="email"
              className="input-premium"
              style={{
                borderColor: fieldErrors.email ? "var(--accent-terra)" : undefined,
              }}
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
            {fieldErrors.email && (
              <span style={{ fontSize: "0.78rem", color: "var(--accent-terra)", marginTop: "0.25rem", display: "block" }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div>
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
              Password
            </label>
            <input
              type="password"
              className="input-premium"
              style={{
                borderColor: fieldErrors.password ? "var(--accent-terra)" : undefined,
              }}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            {fieldErrors.password && (
              <span style={{ fontSize: "0.78rem", color: "var(--accent-terra)", marginTop: "0.25rem", display: "block" }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.8rem", marginTop: "0.5rem" }}
          >
            {loading ? "Verifying Credentials..." : "Sign In →"}
          </button>
        </form>

        <div
          style={{
            marginTop: "2rem",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Don&apos;t have a tenant workspace?{" "}
          <Link href="/signup" style={{ color: "var(--accent-dark)", textDecoration: "underline", fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
