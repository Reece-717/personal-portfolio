import { NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { ok, unauthorized, badRequest } from "@/lib/api-helpers";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const formData = await req.formData().catch(() => null);
  if (!formData) return badRequest("无效的上传请求");

  const file = formData.get("file");
  if (!(file instanceof File)) return badRequest("未找到文件");

  if (!(file.type in EXT_BY_TYPE)) {
    return badRequest("不支持的文件类型，仅支持图片（jpg/png/webp/gif/svg）或 PDF");
  }
  if (file.size > MAX_SIZE) {
    return badRequest("文件大小不能超过 5MB");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}${EXT_BY_TYPE[file.type]}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  return ok({ url: `/uploads/${filename}` });
}
