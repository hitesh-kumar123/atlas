import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message ?? "Invalid login input";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Demo account credential checks or database query
    if (email === "invalid@example.com" || password === "wrongpassword") {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: "ok",
      user: {
        id: "usr_102",
        email,
        name: "Verified User",
        role: "owner",
        activeTenantId: "ten_01",
      },
    });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
