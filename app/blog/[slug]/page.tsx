import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPostBySlug } from "@/data/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Minimal markdown-to-HTML for blog content (handles headings, code blocks, inline code, bold, paragraphs, lists)
function renderContent(content: string): string {
  const lines = content.split("\n");
  let html = "";
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        html += "</code></pre>";
        inCodeBlock = false;
      } else {
        html += "<pre><code>";
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      html +=
        line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;") + "\n";
      continue;
    }

    if (line.startsWith("## ")) {
      html += `<h2>${line.slice(3)}</h2>`;
    } else if (line.startsWith("- ")) {
      html += `<li>${inlineFormat(line.slice(2))}</li>`;
    } else if (line.trim() === "") {
      html += "";
    } else {
      html += `<p>${inlineFormat(line)}</p>`;
    }
  }

  return html;
}

function inlineFormat(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="py-16 sm:py-20">
      <Link
        href="/blog"
        className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        &larr; All posts
      </Link>

      <header className="mt-6">
        <time
          dateTime={post.date}
          className="text-sm text-zinc-400 dark:text-zinc-500 tabular-nums"
        >
          {formatDate(post.date)}
        </time>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          {post.title}
        </h1>
      </header>

      <div
        className="prose mt-10 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
      />
    </article>
  );
}
