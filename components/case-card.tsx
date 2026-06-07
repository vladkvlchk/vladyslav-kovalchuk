import Link from "next/link";
import type { CaseStudy } from "@/data/cases";

// `inline-block + w-fit + bg-background/60 + backdrop-blur-[2px]` shrinks the
// blur halo to the text bounds. Visually invisible on plain backgrounds —
// only shows up when there's art behind it.
const glass =
  "inline-block w-fit rounded-md bg-background/60 px-2 py-0.5 backdrop-blur-[2px]";

export function CaseCard({ slug, title, summary, techStack }: CaseStudy) {
  return (
    <article className="group">
      <Link href={`/cases/${slug}`} className="block">
        <h3
          className={`text-lg font-medium text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300 transition-colors ${glass}`}
        >
          {title}
        </h3>
        <p
          className={`mt-2 max-w-prose text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 ${glass}`}
        >
          {summary}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tech stack">
          {techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-zinc-100/70 px-2.5 py-0.5 text-xs text-zinc-600 backdrop-blur-[2px] dark:bg-zinc-800/70 dark:text-zinc-400"
            >
              {tech}
            </li>
          ))}
        </ul>
      </Link>
    </article>
  );
}
