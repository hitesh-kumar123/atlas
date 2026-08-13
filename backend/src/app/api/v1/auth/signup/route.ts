import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const errorMsg = firstIssue?.message ?? "Invalid registration payload";
      return NextResponse.json({ error: errorMsg }, { status: 400, headers: corsHeaders });
    }

    const { email, name, orgName } = parsed.data;

    return NextResponse.json(
      {
        status: "created",
        tenant: {
          id: `ten_${Date.now()}`,
          name: orgName,
        },
        user: {
          id: `usr_${Date.now()}`,
          email,
          name,
        },
      },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create tenant account" }, { status: 500, headers: corsHeaders });
  }
}
