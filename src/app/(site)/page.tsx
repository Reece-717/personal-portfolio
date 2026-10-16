import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SmartImage } from "@/components/SmartImage";

export const revalidate = 60;

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const profile = await prisma.profile.findFirst();
  const socialLinks = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } });
  const categories = await prisma.skillCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { skills: { orderBy: { sortOrder: "asc" } } },
  });
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
  });
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24">
      {/* Hero */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center py-16 text-center">
        {profile?.avatarUrl ? (
          <SmartImage
            src={profile.avatarUrl}
            alt={profile.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full border border-line object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-line bg-surface text-4xl">
            {profile?.name?.charAt(0) ?? "我"}
          </div>
        )}
        <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{profile?.name ?? "你的名字"}</h1>
        <p className="mt-3 text-xl text-secondary">{profile?.title ?? "你的头衔"}</p>
        <p className="mt-4 max-w-xl text-secondary">{profile?.tagline ?? "你的简介"}</p>

        {socialLinks.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      {profile?.about && (
        <section id="about" className="scroll-mt-20 py-16">
          <h2 className="text-2xl font-semibold">关于我</h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-secondary">
            {profile.about}
          </p>
        </section>
      )}

      {/* Skills */}
      {categories.length > 0 && (
        <section id="skills" className="scroll-mt-20 py-16">
          <h2 className="text-2xl font-semibold">技能</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.id} className="rounded-2xl border border-line bg-surface p-6">
                <h3 className="font-medium text-primary">{cat.name}</h3>
                <ul className="mt-4 space-y-4">
                  {cat.skills.map((skill) => (
                    <li key={skill.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">
                          {skill.icon ? `${skill.icon} ` : ""}
                          {skill.name}
                        </span>
                        <span className="text-secondary">{skill.level}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section id="projects" className="scroll-mt-20 py-16">
          <h2 className="text-2xl font-semibold">项目</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => {
              const stack = parseJsonArray(project.techStack);
              return (
                <article
                  key={project.id}
                  className="flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
                >
                  {project.coverUrl && (
                    <div className="relative mb-4 h-40 overflow-hidden rounded-xl">
                      <SmartImage src={project.coverUrl} alt={project.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary">{project.title}</h3>
                    {project.featured && (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                        精选
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-secondary">{project.summary}</p>
                  {stack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-line px-2 py-0.5 text-xs text-secondary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {(project.githubUrl || project.demoUrl) && (
                    <div className="mt-4 flex gap-4 text-sm">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline"
                        >
                          Demo
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Blog preview */}
      {posts.length > 0 && (
        <section className="py-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">博客</h2>
            <Link href="/blog" className="text-sm text-accent hover:underline">
              查看全部
            </Link>
          </div>
          <ul className="mt-8 space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-primary">{post.title}</h3>
                    {post.publishedAt && (
                      <time className="text-sm text-secondary">
                        {post.publishedAt.toLocaleDateString("zh-CN")}
                      </time>
                    )}
                  </div>
                  {post.summary && <p className="mt-2 text-sm text-secondary">{post.summary}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

