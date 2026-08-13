"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LumenLogo } from "@/components/LumenLogo";

interface FieldErrors {
  name?: string;
  orgName?: string;
  email?: string;
  password?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!name.trim()) {
      errors.name = "Full name is required.";
    } else if (name.trim().length < 3) {
      errors.name = "Full name must be at least 3 characters long.";
    }

    if (!orgName.trim()) {
      errors.orgName = "Organisation name is required.";
    } else if (orgName.trim().length < 3) {
      errors.orgName = "Organisation name must be at least 3 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Work email is required.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid work email address (e.g., alex@company.com).";
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
      const res = await fetch("http://localhost:4000/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      const data = await res.json();

      // Save user & tenant to active session storage
      localStorage.setItem("lumen_user", JSON.stringify({ name, email }));
      localStorage.setItem("lumen_tenant", JSON.stringify({ name: orgName, slug: orgName.toLowerCase().replace(/\s+/g, "-") }));

      router.push("/overview?welcome=1");
    } catch {
      setServerError("Unable to connect to registration server. Please try again.");
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
          maxWidth: "460px",
          padding: "2.75rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <LumenLogo size="lg" href="/" />
          <h2 style={{ fontSize: "1.5rem", marginTop: "1.25rem", color: "var(--text-dark)" }}>
            Create Tenant Account
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
            Start analyzing product analytics in minutes
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', monospace",
                fontWeight: 600,
                marginBottom: "0.35rem",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              className="input-premium"
              style={{
                borderColor: fieldErrors.name ? "var(--accent-terra)" : undefined,
              }}
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
            {fieldErrors.name && (
              <span style={{ fontSize: "0.78rem", color: "var(--accent-terra)", marginTop: "0.25rem", display: "block" }}>
                {fieldErrors.name}
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
                marginBottom: "0.35rem",
              }}
            >
              Organisation Name
            </label>
            <input
              type="text"
              className="input-premium"
              style={{
                borderColor: fieldErrors.orgName ? "var(--accent-terra)" : undefined,
              }}
              placeholder="Acme Corp"
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value);
                if (fieldErrors.orgName) setFieldErrors((prev) => ({ ...prev, orgName: undefined }));
              }}
            />
            {fieldErrors.orgName && (
              <span style={{ fontSize: "0.78rem", color: "var(--accent-terra)", marginTop: "0.25rem", display: "block" }}>
                {fieldErrors.orgName}
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
                marginBottom: "0.35rem",
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
              placeholder="alex@acme.com"
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
                marginBottom: "0.35rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-premium"
                style={{
                  borderColor: fieldErrors.password ? "var(--accent-terra)" : undefined,
                  paddingRight: "2.75rem",
                }}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.25rem",
                  borderRadius: "4px",
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
            {loading ? "Validating & Creating..." : "Create Tenant & Account →"}
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
          Already registered?{" "}
          <Link href="/login" style={{ color: "var(--accent-dark)", textDecoration: "underline", fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
