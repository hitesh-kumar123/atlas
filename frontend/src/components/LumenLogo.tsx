import React from "react";

interface LumenLogoProps {
  size?: "sm" | "md" | "lg";
}

export function LumenLogo({ size = "md" }: LumenLogoProps) {
  const dimensions = size === "sm" ? 24 : size === "lg" ? 40 : 32;
  const fontSize = size === "sm" ? "1.1rem" : size === "lg" ? "1.8rem" : "1.4rem";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <svg
        width={dimensions}
        height={dimensions}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="10" fill="#141422" stroke="rgba(255, 45, 120, 0.4)" strokeWidth="1" />
        <path
          d="M12 28L20 12L28 28"
          stroke="#ff2d78"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="20" r="3" fill="#00ffcc" />
      </svg>
      <span
        style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          fontSize,
          letterSpacing: "-0.03em",
          color: "#e8e0f0",
        }}
      >
        LUMEN<span style={{ color: "#ff2d78" }}>.</span>
      </span>
    </div>
  );
}
