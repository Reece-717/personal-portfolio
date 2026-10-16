import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostList } from "@/components/admin/PostList";

export default async function AdminBlogPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">博客管理</h1>
      <div className="mt-8">
        <PostList
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status,
            publishedAt: p.publishedAt ? p.publishedAt.toLocaleDateString("zh-CN") : null,
          }))}
        />
      </div>
    </div>
  );
}

