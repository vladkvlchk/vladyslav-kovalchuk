"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { href: "/cases", label: "Cases" },
  { href: "/blog", label: "Blog" },
  { href: "/hire", label: "Hire Me" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-100 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="shine text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          data-text="Vladyslav Kovalchuk"
        >
          Vladyslav Kovalchuk
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-8 sm:flex" aria-label="Main">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname.startsWith(href)
                  ? "text-zinc-900 dark:text-zinc-100 font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden p-1 text-zinc-600 dark:text-zinc-400"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M4 8h16M4 16h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 sm:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-3">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block text-sm py-1 ${
                    pathname.startsWith(href)
                      ? "text-zinc-900 dark:text-zinc-100 font-medium"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
