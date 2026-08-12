import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    title: "ATLAS Product Analytics API Documentation",
    version: "1.0.0",
    baseUrl: "http://localhost:4000",
    authentication: {
      type: "API Key Header",
      header: "Authorization: Bearer <your_api_key>",
      alternativeHeader: "x-api-key: <your_api_key>",
    },
    endpoints: [
      {
        path: "/api/v1/events",
        method: "POST",
        description: "High-volume event ingestion endpoint for single events or batches up to 500.",
        headers: {
          Authorization: "Bearer atlas_live_...",
          "Content-Type": "application/json",
          "Idempotency-Key": "optional-uuid-for-batch-deduplication",
        },
        requestBodyExample: {
          name: "checkout_completed",
          distinctId: "user_9812",
          properties: {
            amount: 49.99,
            plan: "pro",
          },
          occurredAt: "2026-08-12T14:00:00Z",
        },
        responses: {
          "202": {
            description: "Events Accepted",
            example: {
              status: "accepted",
              processed: 1,
              accepted: 1,
              duplicatesSkipped: 0,
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing API key",
          },
          "429": {
            description: "Too Many Requests - Rate limit exceeded (Token Bucket: 200/sec)",
            headers: {
              "Retry-After": "1",
            },
          },
        },
      },
    ],
    architectureDecisions: [
      "ADR-001: JSONB Event Properties",
      "ADR-002: Row Level Security Isolation",
      "ADR-003: SET LOCAL Transaction Pooling",
      "ADR-004: SECURITY DEFINER Pre-Tenant Lookups",
      "ADR-005: Token Bucket Rate Limiting",
    ],
  });
}
