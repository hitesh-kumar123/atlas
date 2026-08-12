import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const errorMsg = firstIssue?.message ?? "Invalid registration payload";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, name, orgName } = parsed.data;

    return NextResponse.json({
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
    });
  } catch {
    return NextResponse.json({ error: "Failed to create tenant account" }, { status: 500 });
  }
}
