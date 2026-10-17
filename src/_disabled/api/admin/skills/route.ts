import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { skillsSchema } from "@/lib/validators";
import { ok, unauthorized, badRequest } from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const categories = await prisma.skillCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { skills: { orderBy: { sortOrder: "asc" } } },
  });
  return ok(categories);
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = skillsSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  // 整体替换：先删技能再删分类（级联），然后重建
  await prisma.$transaction(async (tx) => {
    await tx.skill.deleteMany();
    await tx.skillCategory.deleteMany();
    for (const cat of parsed.data) {
      await tx.skillCategory.create({
        data: {
          name: cat.name,
          sortOrder: cat.sortOrder,
          skills: {
            create: cat.skills.map((skill) => ({
              name: skill.name,
              level: skill.level,
              icon: skill.icon ?? null,
              sortOrder: skill.sortOrder,
            })),
          },
        },
      });
    }
  });

  const categories = await prisma.skillCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { skills: { orderBy: { sortOrder: "asc" } } },
  });
  return ok(categories);
}
