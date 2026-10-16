import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { toPostDto } from "@/lib/serialize";
import { ok, unauthorized, badRequest, conflict } from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  return ok(posts.map(toPostDto));
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const { tags, status, summary, coverUrl, ...rest } = parsed.data;

  try {
    const post = await prisma.post.create({
      data: {
        ...rest,
        summary: summary ?? null,
        coverUrl: coverUrl ?? null,
        tags: JSON.stringify(tags),
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
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
