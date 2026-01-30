import Link from "next/link";
import type { BlogPost } from "@/data/posts";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PostCard({ slug, title, summary, date }: BlogPost) {
  return (
    <article className="group">
      <Link href={`/blog/${slug}`} className="block">
        <time
          dateTime={date}
          className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums"
        >
          {formatDate(date)}
        </time>
        <h3 className="mt-1 text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {summary}
        </p>
      </Link>
    </article>
  );
}
