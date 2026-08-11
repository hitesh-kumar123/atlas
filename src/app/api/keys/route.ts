import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createApiKey, listApiKeys } from "@/lib/api-keys";
import { createApiKeySchema } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.activeTenantId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const keys = await listApiKeys(session.user.activeTenantId);
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.activeTenantId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body: unknown = await req.json();
  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { id, plaintextKey } = await createApiKey(session.user.activeTenantId, parsed.data.name);

  // plaintextKey is returned exactly once, here, and never stored.
  return NextResponse.json({ id, key: plaintextKey }, { status: 201 });
}
