import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { socialLinksSchema } from "@/lib/validators";
import { ok, unauthorized, badRequest } from "@/lib/api-helpers";

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = socialLinksSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  // 整体替换：先清空再写入
  await prisma.$transaction([
    prisma.socialLink.deleteMany(),
    prisma.socialLink.createMany({
      data: parsed.data.map((link) => ({
        type: link.type,
        label: link.label,
        url: link.url,
        sortOrder: link.sortOrder,
      })),
    }),
  ]);

  const links = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } });
  return ok(links);
}
