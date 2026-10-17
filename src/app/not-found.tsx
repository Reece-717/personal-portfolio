import Link from "next/link";
import { Starfield } from "@/components/starfield/Starfield";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Starfield />
      <div className="relative z-10">
        <p className="text-6xl font-bold text-accent">404</p>
        <h1 className="mt-4 text-xl font-semibold text-primary">页面不存在</h1>
        <p className="mt-2 text-secondary">你访问的页面可能已被移动或删除。</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-line bg-surface px-6 py-2 text-sm text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
