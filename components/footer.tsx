import Link from "next/link";

const links = [
  { href: "mailto:hello@vladkovalchuk.dev", label: "Email" },
  { href: "https://github.com/vladyslav-kovalchuk", label: "GitHub" },
  { href: "https://linkedin.com/in/vladyslav-kovalchuk", label: "LinkedIn" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-10 text-sm text-zinc-400 dark:text-zinc-500 sm:flex-row sm:justify-between">
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="/cases" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Cases
          </Link>
          <Link href="/blog" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Blog
          </Link>
          <Link href="/hire" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Hire Me
          </Link>
        </nav>
        <div className="flex gap-6">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
