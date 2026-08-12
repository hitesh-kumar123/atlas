import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Atlas Backend API",
    version: "0.1.0",
    endpoints: {
      ingestEvents: "POST /api/v1/events",
    },
  });
}
