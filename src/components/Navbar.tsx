"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/#about", label: "关于" },
  { href: "/#skills", label: "技能" },
  { href: "/#projects", label: "项目" },
  { href: "/blog", label: "博客" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-base/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-primary">
          Portfolio
        </Link>

        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          className="text-secondary hover:text-accent sm:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>
        </button>

        <ul className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-secondary transition-colors hover:text-accent">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <ul className="border-t border-line/60 px-4 py-2 sm:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block py-2 text-secondary transition-colors hover:text-accent"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
