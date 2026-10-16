import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Markdown } from "@/components/blog/Markdown";
import { SmartImage } from "@/components/SmartImage";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  return {
    title: post?.title ?? "文章",
    description: post?.summary ?? undefined,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
  });

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/blog" className="text-sm text-secondary transition-colors hover:text-accent">
        ← 返回博客
      </Link>
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{post.title}</h1>
      {post.publishedAt && (
        <time className="mt-3 block text-sm text-secondary">
          {post.publishedAt.toLocaleDateString("zh-CN")}
        </time>
      )}
      {post.coverUrl && (
        <div className="relative mt-6 h-64 overflow-hidden rounded-2xl">
          <SmartImage src={post.coverUrl} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <div className="mt-8">
        <Markdown content={post.content} />
      </div>
    </article>
  );
}
