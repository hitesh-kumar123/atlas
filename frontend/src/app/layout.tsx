import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "ATLAS - Multi-Tenant Analytics UI",
  description: "Product Analytics Dashboard Frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#020617", color: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}
