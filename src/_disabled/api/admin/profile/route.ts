import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validators";
import { ok, unauthorized, badRequest } from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const profile = await prisma.profile.findFirst();
  const socialLinks = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } });
  return ok({ profile, socialLinks });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const existing = await prisma.profile.findFirst();
  const data = parsed.data;

  const profile = existing
    ? await prisma.profile.update({ where: { id: existing.id }, data })
    : await prisma.profile.create({ data });

  return ok(profile);
}
