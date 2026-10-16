import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { AUTH_COOKIE_NAME } from "./constants";
import { prisma } from "./prisma";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("缺少环境变量 AUTH_SECRET");
  }
  return new TextEncoder().encode(secret);
}

/** 签发 7 天有效的 JWT */
export async function createSessionToken(adminId: string, username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** 校验 JWT，失败返回 null */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

/** 从请求 Cookie 读取会话 */
export async function getSession() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** 校验账号密码，成功返回 Admin，失败返回 null */
export async function verifyCredentials(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return null;
  return admin;
}

/** 受保护接口/页面专用：未登录返回 null */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.sub) return null;
  return prisma.admin.findUnique({ where: { id: session.sub } });
}
