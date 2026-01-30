import Link from "next/link";
import type { CaseStudy } from "@/data/cases";

export function CaseCard({ slug, title, summary, techStack }: CaseStudy) {
  return (
    <article className="group">
      <Link href={`/cases/${slug}`} className="block">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{summary}</p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tech stack">
          {techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-400"
            >
              {tech}
            </li>
          ))}
        </ul>
      </Link>
    </article>
  );
}
