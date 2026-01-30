export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  techStack: string[];
  problem: string;
  constraints: string[];
  solution: string;
  decisions: { title: string; rationale: string }[];
  outcome: string;
}

export const cases: CaseStudy[] = [
  {
    slug: "design-system-fintech",
    title: "Unifying UI across a fragmented fintech platform",
    summary:
      "Replaced five inconsistent component libraries with a single token-based design system, cutting UI bugs by 60% and onboarding time for new engineers in half.",
    techStack: ["React", "TypeScript", "Storybook", "Tailwind CSS", "Changesets"],
    problem:
      "The company operated five products under one brand, each built by a separate team over several years. Every product had its own component library — different button styles, inconsistent spacing, conflicting accessibility patterns. Customers noticed. Internal teams wasted hours reconciling designs across products. A rebrand was coming and touching every component in every repo was not viable.",
    constraints: [
      "Migration had to be incremental — no big-bang rewrite across five codebases.",
      "Each team had different release cycles and could not pause feature work.",
      "The design system had to support both the current brand and the upcoming rebrand without breaking changes.",
      "Accessibility compliance (WCAG 2.1 AA) was mandatory for regulatory reasons.",
    ],
    solution:
      "I designed and built a token-based component library published as versioned packages via Changesets. The system used design tokens (colors, spacing, typography) as a separate layer, so the rebrand could be applied by swapping a token set rather than changing component code. Each component was built with a composition-first API — primitives that teams could assemble rather than monolithic components with dozens of props. I wrote codemods to automate the most common migration patterns and created an adoption dashboard that tracked each team's progress.",
    decisions: [
      {
        title: "Composition over configuration",
        rationale:
          "Instead of building components with extensive prop APIs (variant, size, color, icon, loading...), I exposed composable primitives. This reduced the API surface, made components easier to test, and let teams build product-specific patterns without forking the library.",
      },
      {
        title: "Tokens as a separate package",
        rationale:
          "Decoupling tokens from components meant the rebrand was a version bump on the token package, not a coordinated release across all component consumers.",
      },
      {
        title: "Codemods for migration",
        rationale:
          "Writing jscodeshift transforms for the 20 most-used components eliminated 70% of manual migration work and reduced errors during adoption.",
      },
    ],
    outcome:
      "All five products adopted the system within four months. UI-related bug reports dropped 60%. New engineers reported reaching productivity faster because there was one set of patterns to learn. The rebrand shipped on schedule by updating a single token package — no component changes required.",
  },
  {
    slug: "ecommerce-performance",
    title: "Cutting load times in half for a high-traffic product catalog",
    summary:
      "Diagnosed and resolved critical performance bottlenecks in a React SPA serving 2M+ monthly visitors, reducing Time to Interactive from 8s to under 3s.",
    techStack: ["Next.js", "React", "TypeScript", "Lighthouse", "Web Vitals", "Vercel"],
    problem:
      "An e-commerce company's product catalog had grown to 50,000+ items. The React SPA loaded everything client-side — heavy JavaScript bundles, unoptimized images, and redundant API calls on every navigation. Lighthouse scores were in the 30s. Mobile users on slower connections were abandoning the site before products rendered. Conversion rates had been declining for two quarters.",
    constraints: [
      "The existing codebase was large and tightly coupled — a full rewrite was not feasible.",
      "The product team needed to continue shipping features during the optimization work.",
      "Third-party scripts (analytics, A/B testing) could not be removed but needed to be managed.",
      "The solution had to work within the existing hosting infrastructure.",
    ],
    solution:
      "I migrated the catalog from client-side rendering to Next.js with a hybrid approach: static generation for the top 500 products (80% of traffic), server-side rendering for the long tail, and client-side rendering only for personalized content. I implemented aggressive code splitting, replaced the monolithic state management with targeted data fetching using React Server Components, optimized images with next/image, and deferred third-party scripts. The migration was done route-by-route over six weeks without disrupting feature development.",
    decisions: [
      {
        title: "Hybrid rendering strategy",
        rationale:
          "Pure SSG would not scale for 50K products, and pure SSR added unnecessary server load. Analyzing traffic patterns showed 80% of visits hit the top 500 products — static generation for those with SSR fallback was the right tradeoff.",
      },
      {
        title: "Route-by-route migration",
        rationale:
          "Instead of migrating everything at once, I started with the highest-traffic pages. This delivered measurable improvements early and built confidence with the team before tackling more complex routes.",
      },
      {
        title: "Server Components for data",
        rationale:
          "Moving data fetching to Server Components eliminated waterfall requests on the client and reduced the JavaScript shipped to the browser by 40%.",
      },
    ],
    outcome:
      "Time to Interactive dropped from 8.2s to 2.8s. Lighthouse performance score went from 34 to 91. Mobile bounce rate decreased 25%. The product team reported that the new architecture made it easier to reason about data flow, and page-level performance budgets were adopted as part of the CI pipeline.",
  },
  {
    slug: "collaboration-saas",
    title: "Building real-time editing into a project management tool",
    summary:
      "Designed and implemented collaborative document editing for a SaaS platform, supporting 50+ concurrent users per document without conflicts or data loss.",
    techStack: [
      "React",
      "TypeScript",
      "WebSocket",
      "Yjs",
      "Tiptap",
      "Node.js",
    ],
    problem:
      "The project management tool had a document editor, but it was single-user. Teams had to take turns editing, leading to version conflicts and lost work. Users were copying content into Google Docs to collaborate and pasting it back — a workflow that broke formatting and created sync issues. The product team wanted native real-time collaboration, but the existing editor was built on a custom contenteditable implementation that did not support concurrent editing.",
    constraints: [
      "The existing document format had to be preserved — migration of thousands of active documents was required.",
      "Latency had to stay under 100ms for a responsive editing experience.",
      "The solution needed to work reliably on unstable connections with automatic reconnection and conflict resolution.",
      "Infrastructure costs had to remain reasonable at scale.",
    ],
    solution:
      "I replaced the custom editor with Tiptap (built on ProseMirror) and integrated Yjs as the CRDT layer for conflict-free real-time synchronization. I built a WebSocket server that managed document sessions, handled presence awareness (cursors, selections), and persisted snapshots to reduce memory usage. For the migration, I wrote a transformer that converted the legacy format to the ProseMirror schema, validated with a diff tool that compared rendered output before and after conversion.",
    decisions: [
      {
        title: "Yjs over operational transform",
        rationale:
          "CRDTs like Yjs handle conflicts without a central authority, simplifying the server architecture and making offline editing possible. OT would have required a more complex coordination server.",
      },
      {
        title: "Tiptap over building from scratch",
        rationale:
          "ProseMirror's schema system gave us the extensibility we needed. Building a collaborative editor from scratch would have taken months longer and introduced more edge cases than leveraging a battle-tested foundation.",
      },
      {
        title: "Snapshot-based persistence",
        rationale:
          "Instead of persisting every CRDT update, the server saves periodic snapshots and replays only recent updates on reconnection. This kept storage costs linear rather than growing with edit frequency.",
      },
    ],
    outcome:
      "The feature launched to 15,000 active teams. Average concurrent editors per document reached 12, with peak sessions handling 50+ users without degradation. Document-related support tickets dropped 40%. The migration converted 98.7% of documents without manual intervention, and the remaining 1.3% were flagged for review with specific diff reports.",
  },
];

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}
