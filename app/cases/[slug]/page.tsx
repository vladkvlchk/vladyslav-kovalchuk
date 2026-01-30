import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cases, getCaseBySlug } from "@/data/cases";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseBySlug(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.summary,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseBySlug(slug);
  if (!study) notFound();

  return (
    <article className="py-16 sm:py-20">
      <Link
        href="/cases"
        className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        &larr; All cases
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        {study.title}
      </h1>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
        {study.techStack.map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-400"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-12 space-y-12">
        <CaseSection title="Problem">
          <p>{study.problem}</p>
        </CaseSection>

        <CaseSection title="Constraints">
          <ul className="list-disc space-y-2 pl-5">
            {study.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection title="Solution">
          <p>{study.solution}</p>
        </CaseSection>

        <CaseSection title="Key technical decisions">
          <dl className="space-y-6">
            {study.decisions.map((d) => (
              <div key={d.title}>
                <dt className="font-medium text-zinc-900 dark:text-zinc-100">{d.title}</dt>
                <dd className="mt-1 text-zinc-500 dark:text-zinc-400">{d.rationale}</dd>
              </div>
            ))}
          </dl>
        </CaseSection>

        <CaseSection title="Outcome">
          <p>{study.outcome}</p>
        </CaseSection>
      </div>
    </article>
  );
}

function CaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        {children}
      </div>
    </section>
  );
}
