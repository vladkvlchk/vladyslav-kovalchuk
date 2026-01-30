import type { Metadata } from "next";
import { cases } from "@/data/cases";
import { CaseCard } from "@/components/case-card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Selected frontend engineering work — design systems, performance optimization, and real-time collaboration.",
};

export default function CasesPage() {
  return (
    <>
      <PageHeader
        title="Case Studies"
        subtitle="Problems I have worked on, how I approached them, and what happened."
      />
      <div className="grid gap-12 py-12">
        {cases.map((c) => (
          <CaseCard key={c.slug} {...c} />
        ))}
      </div>
    </>
  );
}
