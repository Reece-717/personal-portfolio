import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "个人作品集",
    template: "%s | 个人作品集",
  },
  description: "个人介绍、技能、项目与博客的个人作品集网站",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
