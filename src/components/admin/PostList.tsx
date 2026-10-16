"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { buttonPrimary, buttonSecondary, buttonDanger, cardClass } from "./styles";

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
}

export function PostList({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function del(id: string) {
    if (!window.confirm("确定删除这篇文章吗？此操作不可恢复。")) return;
    setDeleting(id);
    setError(null);
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
      setDeleting(null);
    }
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">文章列表</h2>
        <Link href="/admin/blog/new" className={buttonPrimary}>
          + 新建文章
        </Link>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">暂无文章。</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="font-medium text-primary hover:text-accent"
                >
                  {post.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                  <span className={post.status === "PUBLISHED" ? "text-emerald-400" : "text-amber-400"}>
                    {post.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                  <span>/ {post.slug}</span>
                  {post.publishedAt && <span>/ 发布于 {post.publishedAt}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/blog/${post.id}`} className={buttonSecondary}>
                  编辑
                </Link>
                <button
                  type="button"
                  onClick={() => del(post.id)}
                  disabled={deleting === post.id}
                  className={buttonDanger}
                >
                  {deleting === post.id ? "删除中…" : "删除"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
