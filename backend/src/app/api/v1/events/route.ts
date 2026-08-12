import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-keys";
import { globalRateLimiter } from "@/lib/rate-limiter";
import { ingestBatchSchema } from "@/lib/validation";
import { withTenant } from "@/lib/prisma";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const xApiKeyHeader = req.headers.get("x-api-key");
  let apiKey: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    apiKey = authHeader.slice(7).trim();
  } else if (xApiKeyHeader) {
    apiKey = xApiKeyHeader.trim();
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Unauthorized: Missing API Key header" },
      { status: 401 }
    );
  }

  const authResult = await verifyApiKey(apiKey);
  if (!authResult) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or revoked API Key" },
      { status: 401 }
    );
  }

  const { tenantId, apiKeyId } = authResult;

  let jsonPayload: unknown;
  try {
    jsonPayload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Bad Request: Invalid JSON body" },
      { status: 400 }
    );
  }

  const parseResult = ingestBatchSchema.safeParse(jsonPayload);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Unprocessable Entity: Validation failed",
        details: parseResult.error.issues,
      },
      { status: 422 }
    );
  }

  const events = parseResult.data;
  const eventCount = events.length;

  const rateCheck = globalRateLimiter.consume(apiKeyId, eventCount);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Too Many Requests: Rate limit exceeded",
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds ?? 1),
        },
      }
    );
  }

  const requestHeaderIdempotencyKey = req.headers.get("idempotency-key");

  try {
    const insertedCount = await withTenant(tenantId, async (tx) => {
      const recordsToInsert = events.map((ev, index) => {
        const idempotencyKey =
          ev.idempotencyKey ??
          (requestHeaderIdempotencyKey ? `${requestHeaderIdempotencyKey}_${index}` : null);

        return {
          tenantId,
          name: ev.name,
          distinctId: ev.distinctId,
          properties: ev.properties as any,
          idempotencyKey: idempotencyKey ?? null,
          occurredAt: ev.occurredAt ?? new Date(),
        };
      });

      const result = await tx.event.createMany({
        data: recordsToInsert,
        skipDuplicates: true,
      });

      return result.count;
    });

    return NextResponse.json(
      {
        status: "accepted",
        processed: eventCount,
        accepted: insertedCount,
        duplicatesSkipped: eventCount - insertedCount,
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("Event ingest error:", err);
    return NextResponse.json(
      { error: "Internal Server Error: Ingestion failed" },
      { status: 500 }
    );
  }
}
