import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <p className="mt-2 text-secondary">欢迎回来，{admin.username}。</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link
          href="/admin/profile"
          className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h2 className="font-semibold">个人资料</h2>
          <p className="mt-2 text-sm text-secondary">管理个人介绍、社交链接、技能与项目。</p>
        </Link>
        <Link
          href="/admin/blog"
          className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h2 className="font-semibold">博客管理</h2>
          <p className="mt-2 text-sm text-secondary">新建、编辑、发布与删除博客文章。</p>
        </Link>
      </div>
    </div>
  );
}
