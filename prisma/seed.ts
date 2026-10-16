import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. 管理员账号（幂等）
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "change-me-strong-password";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash },
  });

  // 2. 个人资料（幂等，固定 id）
  await prisma.profile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "你的名字",
      title: "全栈工程师",
      tagline: "用代码创造简洁而美好的产品体验",
      about:
        "你好，我是一名热爱技术的全栈工程师，专注于 Web 开发与用户体验。\n\n" +
        "我享受从 0 到 1 构建产品的过程，也热衷于分享技术心得。\n\n" +
        "欢迎浏览我的作品，或通过下方的联系方式与我交流。",
    },
  });

  // 3. 社交链接
  if ((await prisma.socialLink.count()) === 0) {
    await prisma.socialLink.createMany({
      data: [
        { type: "github", label: "GitHub", url: "https://github.com/yourname", sortOrder: 0 },
        { type: "email", label: "Email", url: "mailto:you@example.com", sortOrder: 1 },
        { type: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/yourname", sortOrder: 2 },
      ],
    });
  }

  // 4. 技能
  if ((await prisma.skillCategory.count()) === 0) {
    const frontend = await prisma.skillCategory.create({ data: { name: "前端", sortOrder: 0 } });
    const backend = await prisma.skillCategory.create({ data: { name: "后端", sortOrder: 1 } });
    const tools = await prisma.skillCategory.create({ data: { name: "工具", sortOrder: 2 } });

    await prisma.skill.createMany({
      data: [
        { name: "React", level: 90, icon: "⚛️", categoryId: frontend.id, sortOrder: 0 },
        { name: "TypeScript", level: 85, icon: "🟦", categoryId: frontend.id, sortOrder: 1 },
        { name: "Next.js", level: 85, icon: "▲", categoryId: frontend.id, sortOrder: 2 },
        { name: "Tailwind CSS", level: 88, icon: "🎨", categoryId: frontend.id, sortOrder: 3 },
        { name: "Node.js", level: 80, icon: "🟩", categoryId: backend.id, sortOrder: 0 },
        { name: "PostgreSQL", level: 75, icon: "🐘", categoryId: backend.id, sortOrder: 1 },
        { name: "Prisma", level: 78, icon: "🔷", categoryId: backend.id, sortOrder: 2 },
        { name: "Git", level: 85, icon: "🔀", categoryId: tools.id, sortOrder: 0 },
        { name: "Docker", level: 70, icon: "🐳", categoryId: tools.id, sortOrder: 1 },
      ],
    });
  }

  // 5. 项目
  if ((await prisma.project.count()) === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "示例项目 A",
          summary: "一个面向开发者的效率工具，帮助团队更高效地协作。",
          description:
            "这是一个示例项目。\n\n它演示了项目卡片在前台的展示效果，以及技术栈标签、GitHub 与 Demo 链接。",
          techStack: JSON.stringify(["Next.js", "TypeScript", "Tailwind CSS"]),
          githubUrl: "https://github.com/yourname/project-a",
          demoUrl: "https://example.com",
          featured: true,
          sortOrder: 0,
        },
        {
          title: "示例项目 B",
          summary: "一个数据可视化的后台管理系统。",
          description:
            "这是另一个示例项目。\n\n演示非精选项目的展示效果，可稍后在后台将其删除或修改。",
          techStack: JSON.stringify(["Node.js", "PostgreSQL", "Prisma"]),
          githubUrl: "https://github.com/yourname/project-b",
          featured: false,
          sortOrder: 1,
        },
      ],
    });
  }

  // 6. 博客示例
  if ((await prisma.post.count()) === 0) {
    await prisma.post.create({
      data: {
        title: "欢迎来到我的博客",
        slug: "welcome",
        summary: "这是我的第一篇博客文章，介绍这个作品集网站。",
        content:
          "# 你好 👋\n\n" +
          "欢迎来到我的个人博客，这是由后台管理系统发布的第一篇文章。\n\n" +
          "## 支持 Markdown\n\n" +
          "支持 **加粗**、*斜体*、[链接](https://example.com)、列表等语法：\n\n" +
          "- 列表项一\n- 列表项二\n- 列表项三\n\n" +
          "## 代码高亮\n\n```ts\nconst hello: string = \"world\";\nconsole.log(hello);\n```\n\n" +
          "> 提示：登录后台即可管理文章与个人信息。",
        tags: JSON.stringify(["随笔", "公告"]),
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  console.log(`✅ Seed 完成。管理员账号：${username}（密码来自环境变量 ADMIN_PASSWORD）`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
