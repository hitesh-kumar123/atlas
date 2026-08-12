"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LumenLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function LumenLogo({ size = "md", href = "/" }: LumenLogoProps) {
  const height = size === "sm" ? 28 : size === "lg" ? 44 : 34;
  const width = size === "sm" ? 110 : size === "lg" ? 170 : 135;

  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        cursor: "pointer",
        transition: "opacity 0.2s ease",
      }}
    >
      <img
        src="/assets/logo.png"
        alt="Lumen Product Analytics"
        height={height}
        style={{ height: `${height}px`, width: "auto", objectFit: "contain" }}
        onError={(e) => {
          // Fallback if image fails to render
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/assets/logo-mark.png";
        }}
      />
    </Link>
  );
}
