import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";
import { toProjectDto } from "@/lib/serialize";
import { ok, unauthorized, badRequest } from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
  });
  return ok(projects.map(toProjectDto));
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const project = await prisma.project.create({
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
