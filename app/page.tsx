import Image from "next/image";
import Link from "next/link";
import { cases } from "@/data/cases";
import { CaseCard } from "@/components/case-card";
import { Section } from "@/components/section";

const focus = [
  {
    title: "Component architecture",
    description:
      "Designing systems that stay maintainable as products scale — clear boundaries, minimal coupling, predictable data flow.",
  },
  {
    title: "Performance",
    description:
      "Keeping interfaces fast through measured optimization: code splitting, render efficiency, and disciplined dependency management.",
  },
  {
    title: "Developer experience",
    description:
      "Building tools and patterns that help teams ship confidently — type safety, testing strategies, and clear documentation.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
        <Image
          src="/me.png"
          alt="Vladyslav Kovalchuk"
          width={72}
          height={72}
          className="mb-6 rounded-full"
          priority
        />
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Frontend engineer building
          <br className="hidden sm:block" /> interfaces that work.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          I help product teams ship reliable, performant web applications.
          Focused on React, TypeScript, and the kind of frontend architecture
          that holds up under real-world complexity.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/cases"
            className="inline-flex items-center rounded-full bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
          >
            View Case Studies
          </Link>
          <Link
            href="/hire"
            className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Hire Me
          </Link>
        </div>
      </section>

      {/* Focus areas */}
      <Section title="What I focus on">
        <ul className="grid gap-6 sm:grid-cols-3">
          {focus.map((item) => (
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

      {/* Selected cases */}
      <Section
        title="Selected work"
        subtitle="Problems I have solved for real products."
      >
        <div className="grid gap-10">
          {cases.map((c) => (
            <CaseCard key={c.slug} {...c} />
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/cases"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            All case studies &rarr;
          </Link>
        </div>
      </Section>
    </>
  );
}
