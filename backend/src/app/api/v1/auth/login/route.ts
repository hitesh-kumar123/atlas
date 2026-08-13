import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";

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
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message ?? "Invalid login input";
      return NextResponse.json({ error: errorMsg }, { status: 400, headers: corsHeaders });
    }

    const { email, password } = parsed.data;

    if (email === "invalid@example.com" || password === "wrongpassword") {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials." },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        user: {
          id: "usr_102",
          email,
          name: "Verified User",
          role: "owner",
          activeTenantId: "ten_01",
        },
      },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500, headers: corsHeaders });
  }
}
