import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/serialize";
import { PostEditor } from "@/components/admin/PostEditor";

export default async function AdminEditPostPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">编辑文章</h1>
      <div className="mt-8">
        <PostEditor
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            content: post.content,
            coverUrl: post.coverUrl,
            tags: parseJsonArray(post.tags),
            status: post.status,
          }}
        />
      </div>
    </div>
  );
}
