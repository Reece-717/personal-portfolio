import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { createSessionToken, verifyCredentials } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  // 登录限流：基于客户端 IP，防暴力破解
  const rate = checkRateLimit(`login:${getClientIp(req)}`);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: {
          message: `尝试次数过多，请 ${rate.retryAfterSeconds} 秒后再试`,
          code: "RATE_LIMITED",
        },
      },
      { status: 429 },
    );
  }

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

