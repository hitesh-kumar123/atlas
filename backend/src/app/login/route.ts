import { NextResponse } from "next/server";

export async function GET() {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return NextResponse.redirect(`${frontendUrl}/login`);
}
