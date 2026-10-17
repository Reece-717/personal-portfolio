import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SmartImage } from "@/components/SmartImage";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">博客</h1>
      <p className="mt-2 text-secondary">记录思考、学习与分享。</p>

      {posts.length === 0 ? (
        <p className="mt-12 text-secondary">暂无文章。</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
              >
                {post.coverUrl && (
                  <div className="relative mb-4 h-40 overflow-hidden rounded-xl">
                    <SmartImage src={post.coverUrl} alt={post.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-primary">{post.title}</h2>
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
      )}
    </div>
  );
}
