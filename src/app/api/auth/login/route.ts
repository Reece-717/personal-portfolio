import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { createSessionToken, verifyCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "参数不合法", code: "INVALID_INPUT" } },
      { status: 400 },
    );
  }

  const admin = await verifyCredentials(parsed.data.username, parsed.data.password);
  if (!admin) {
    return NextResponse.json(
      { error: { message: "账号或密码错误", code: "INVALID_CREDENTIALS" } },
      { status: 401 },
    );
  }

  const token = await createSessionToken(admin.id, admin.username);

  const res = NextResponse.json({ data: { username: admin.username } });
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
