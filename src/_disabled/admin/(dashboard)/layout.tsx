import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base text-primary">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold">
            后台管理
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-secondary transition-colors hover:text-accent">
              查看前台
            </Link>
            <Link href="/admin/profile" className="text-secondary transition-colors hover:text-accent">
              个人资料
            </Link>
            <Link href="/admin/blog" className="text-secondary transition-colors hover:text-accent">
              博客管理
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
