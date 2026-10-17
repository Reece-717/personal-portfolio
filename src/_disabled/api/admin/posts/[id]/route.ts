import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { toPostDto } from "@/lib/serialize";
import { ok, unauthorized, badRequest, notFound, conflict } from "@/lib/api-helpers";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return notFound("文章不存在");
  return ok(toPostDto(post));
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) return notFound("文章不存在");

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const { tags, status, summary, coverUrl, ...rest } = parsed.data;

  // 发布时间逻辑：发布时若无发布时间则记录；转为草稿则清空
  let publishedAt = existing.publishedAt;
  if (status === "PUBLISHED" && !publishedAt) publishedAt = new Date();
  if (status === "DRAFT") publishedAt = null;

  try {
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...rest,
        summary: summary ?? null,
        coverUrl: coverUrl ?? null,
        tags: JSON.stringify(tags),
        status,
        publishedAt,
      },
    });
    return ok(toPostDto(post));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return conflict("该 slug 已存在，请更换");
    }
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) return notFound("文章不存在");

  await prisma.post.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
