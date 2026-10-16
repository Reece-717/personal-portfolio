import { NextResponse } from "next/server";

/** 统一响应封装，供 Route Handler 复用 */

export function ok<T>(data: T) {
  return NextResponse.json({ data });
}

export function unauthorized() {
  return NextResponse.json(
    { error: { message: "未授权", code: "UNAUTHORIZED" } },
    { status: 401 },
  );
}

export function badRequest(message = "参数不合法") {
  return NextResponse.json(
    { error: { message, code: "INVALID_INPUT" } },
    { status: 400 },
  );
}

export function notFound(message = "资源不存在") {
  return NextResponse.json({ error: { message, code: "NOT_FOUND" } }, { status: 404 });
}

export function conflict(message = "资源冲突") {
  return NextResponse.json({ error: { message, code: "CONFLICT" } }, { status: 409 });
}
