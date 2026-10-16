import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/serialize";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { SocialLinksForm } from "@/components/admin/SocialLinksForm";
import { SkillsForm } from "@/components/admin/SkillsForm";
import { ProjectsForm } from "@/components/admin/ProjectsForm";

export default async function AdminProfilePage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const profile = await prisma.profile.findFirst();
  const socialLinks = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } });
  const categories = await prisma.skillCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { skills: { orderBy: { sortOrder: "asc" } } },
  });
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">个人资料管理</h1>
      <p className="mt-2 text-secondary">修改后前台将即时生效（ISR 最长 60 秒内更新）。</p>

      <div className="mt-8 space-y-8">
        <ProfileForm
          profile={
            profile
              ? {
                  name: profile.name,
                  title: profile.title,
                  tagline: profile.tagline,
                  about: profile.about,
                  avatarUrl: profile.avatarUrl,
                  resumeUrl: profile.resumeUrl,
                }
              : null
          }
        />
        <SocialLinksForm
          links={socialLinks.map((l) => ({
            id: l.id,
            type: l.type,
            label: l.label,
            url: l.url,
            sortOrder: l.sortOrder,
          }))}
        />
        <SkillsForm
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            sortOrder: c.sortOrder,
            skills: c.skills.map((s) => ({
              id: s.id,
              name: s.name,
              level: s.level,
              icon: s.icon,
              sortOrder: s.sortOrder,
            })),
          }))}
        />
        <ProjectsForm
          projects={projects.map((p) => ({
            id: p.id,
            title: p.title,
            summary: p.summary,
            description: p.description,
            coverUrl: p.coverUrl,
            techStack: parseJsonArray(p.techStack),
            githubUrl: p.githubUrl,
            demoUrl: p.demoUrl,
            featured: p.featured,
            sortOrder: p.sortOrder,
          }))}
        />
      </div>
    </div>
  );
}

