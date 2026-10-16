import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";
import { toProjectDto } from "@/lib/serialize";
import { ok, unauthorized, badRequest, notFound } from "@/lib/api-helpers";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) return notFound("项目不存在");

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      description: parsed.data.description,
      coverUrl: parsed.data.coverUrl ?? null,
      techStack: JSON.stringify(parsed.data.techStack),
      githubUrl: parsed.data.githubUrl ?? null,
      demoUrl: parsed.data.demoUrl ?? null,
      featured: parsed.data.featured,
      sortOrder: parsed.data.sortOrder,
    },
  });

  return ok(toProjectDto(project));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) return notFound("项目不存在");

  await prisma.project.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
