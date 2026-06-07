import Link from "next/link";

const links = [
  { href: "mailto:vlad_kvlchk@icloud.com", label: "Email" },
  { href: "https://github.com/vladkvlchk", label: "GitHub" },
  { href: "https://www.linkedin.com/in/vladkvlchk", label: "LinkedIn" },
  { href: "https://www.codewars.com/users/vladkvlchk", label: "Codewars" },
  { href: "https://t.me/vlad_kvlchk", label: "Telegram" },
] as const;

// Tight glass halo that keeps footer links legible over the ASCII art.
const glass =
  "rounded-md bg-background/60 px-2 py-0.5 backdrop-blur-[2px] transition-colors hover:text-zinc-600 dark:hover:text-zinc-300";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-100 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-10 text-sm text-zinc-400 dark:text-zinc-500 sm:flex-row sm:justify-between">
        <nav className="flex gap-2" aria-label="Footer">
          <Link href="/cases" className={glass}>
            Cases
          </Link>
          <Link href="/blog" className={glass}>
            Blog
          </Link>
          <Link href="/hire" className={glass}>
            Hire Me
          </Link>
        </nav>
        <div className="flex flex-wrap justify-center gap-2">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className={glass}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
