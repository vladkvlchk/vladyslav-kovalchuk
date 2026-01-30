import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Hire Me",
  description:
    "Frontend engineer available for full-time roles and contract work. React, TypeScript, Next.js.",
};

const stack = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "PostgreSQL",
  "Git",
  "Figma",
  "Storybook",
  "Playwright",
  "Vitest",
  "CI/CD",
];

const bestWith = [
  {
    title: "Product-driven teams",
    description:
      "I work best when engineers are close to the product decisions. I want to understand why we are building something, not just how.",
  },
  {
    title: "Complex web applications",
    description:
      "SPAs, dashboards, collaborative tools, developer-facing products — interfaces where architecture matters and performance is a feature.",
  },
  {
    title: "Teams that value code quality",
    description:
      "Testing, code review, incremental delivery. I prefer teams that move with confidence over teams that just move fast.",
  },
];

export default function HirePage() {
  return (
    <>
      <PageHeader
        title="Hire Me"
        subtitle="I am open to full-time positions and contract engagements."
      />

      <Section title="What I work best with">
        <ul className="grid gap-6 sm:grid-cols-3">
          {bestWith.map((item) => (
            <li key={item.title}>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tech stack">
        <ul className="flex flex-wrap gap-2">
          {stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300"
            >
              {tech}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Get in touch">
        <div className="space-y-4 text-[15px] text-zinc-500 dark:text-zinc-400">
          <p>
            The best way to reach me is email. I typically reply within a day.
          </p>
          <ul className="space-y-2">
            <li>
              <span className="text-zinc-400 dark:text-zinc-500">Email</span>{" "}
              <a
                href="mailto:hello@vladkovalchuk.dev"
                className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
              >
                hello@vladkovalchuk.dev
              </a>
            </li>
            <li>
              <span className="text-zinc-400 dark:text-zinc-500">GitHub</span>{" "}
              <a
                href="https://github.com/vladyslav-kovalchuk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
              >
                vladyslav-kovalchuk
              </a>
            </li>
            <li>
              <span className="text-zinc-400 dark:text-zinc-500">LinkedIn</span>{" "}
              <a
                href="https://linkedin.com/in/vladyslav-kovalchuk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
              >
                vladyslav-kovalchuk
              </a>
            </li>
          </ul>
        </div>
        <div className="mt-10">
          <Link
            href="/cases"
            className="inline-flex items-center rounded-full bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
          >
            View my work
          </Link>
        </div>
      </Section>
    </>
  );
}
