export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  date: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "stop-using-usememo-everywhere",
    title: "Stop putting useMemo everywhere. Your app is not faster.",
    summary:
      "Most useMemo calls in production codebases do not improve performance. They add memory overhead, reduce readability, and give developers a false sense of optimization.",
    date: "2025-05-20",
    content: `I have lost count of how many code reviews I have done where every computed value is wrapped in \`useMemo\`. Senior developers do this. Tech leads do this. People with years of React experience do this. And in most cases, it makes the code worse, not better.

The reasoning is always the same: "it prevents unnecessary recalculations." That is technically true. But the question nobody asks is: **how expensive is that calculation in the first place?**

## What useMemo actually does

\`useMemo\` caches the result of a function call and only recomputes it when one of its dependencies changes. Every render, React compares the current dependencies with the previous ones. If they match, it returns the cached value. If not, it runs the function again and stores the new result.

This means \`useMemo\` is never free. On every render it:

- Stores the previous result in memory
- Stores the dependency array in memory
- Compares each dependency with its previous value

For this cost to pay off, the function you are memoizing needs to be **more expensive** than the comparison itself.

## The code I see everywhere

\`\`\`typescript
const sizes = useMemo(() => {
  return product.sizes.sort((a, b) => a - b);
}, [product.sizes]);
\`\`\`

Sorting seven shoe sizes from smallest to largest. Seven numbers. Wrapped in \`useMemo\` with dependency tracking and caching. Just sort them — it takes microseconds.

And the classic:

\`\`\`typescript
const buttonStyle = useMemo(() => ({
  backgroundColor: isActive ? "blue" : "gray",
  padding: 16,
}), [isActive]);
\`\`\`

This one looks reasonable at first — creating a new object every render could cause child re-renders if passed as a prop. But if the child component is not wrapped in \`React.memo\`, the memoized reference does nothing. The child re-renders anyway because its parent re-rendered.

## When useMemo actually helps

\`useMemo\` is worth it when the computation is genuinely expensive:

**Filtering or sorting large arrays:**

\`\`\`typescript
const filtered = useMemo(() => {
  return products
    .filter((p) => p.category === selectedCategory)
    .sort((a, b) => a.price - b.price);
}, [products, selectedCategory]);
\`\`\`

If \`products\` has thousands of items, re-filtering and re-sorting on every render is wasteful. This is a valid use case.

**Complex derived data transformations:**

\`\`\`typescript
const chartData = useMemo(() => {
  return rawData.map((entry) => ({
    x: parseDate(entry.timestamp),
    y: calculateMovingAverage(entry.values, windowSize),
  }));
}, [rawData, windowSize]);
\`\`\`

Parsing dates and computing moving averages across a dataset is expensive. Memoize this.

**Preserving referential equality for expensive child trees:**

\`\`\`typescript
const config = useMemo(() => ({
  theme,
  locale,
  permissions: computePermissions(user.roles),
}), [theme, locale, user.roles]);

return <HeavyProvider value={config}>{children}</HeavyProvider>;
\`\`\`

If \`HeavyProvider\` triggers re-renders in a deep component tree when its value changes, stabilizing the reference with \`useMemo\` prevents unnecessary work downstream. But only if the provider or children actually check referential equality.

## The rule I follow

Before adding \`useMemo\`, I ask two questions:

- **Is this calculation expensive?** If it is arithmetic, string operations, or simple object access — no. If it involves iterating over large collections, complex transformations, or heavy parsing — yes.
- **Does referential equality matter here?** If the result is passed to a memoized child component, a context provider, or a dependency array of another hook — maybe. If it is rendered directly or passed to a regular component — no.

If neither answer is yes, skip \`useMemo\`. Just compute the value directly.

\`\`\`typescript
// instead of this
const fullName = useMemo(() => \`\${first} \${last}\`, [first, last]);

// just do this
const fullName = \`\${first} \${last}\`;
\`\`\`

Simpler. Faster. Easier to read.

## The real problem

The overuse of \`useMemo\` is a symptom of a deeper issue: **optimizing without measuring**. Developers add memoization because it feels responsible, not because they profiled and found a bottleneck.

React is fast. A component re-rendering with a few simple calculations is not your performance problem. Your performance problem is the waterfall of API calls, the unoptimized images, the third-party scripts, or the missing virtualization on a list with 10,000 items.

Profile first. Memoize only what the profiler tells you to memoize. Everything else is noise.`,
  },
  {
    slug: "compound-components-limits",
    title: "Compound components are not the answer to everything",
    summary:
      "The pattern is powerful, but it introduces implicit coupling that makes components harder to test and refactor. Here is when I reach for it and when I do not.",
    date: "2025-03-12",
    content: `There is a moment in every React codebase where someone proposes compound components as the solution to a growing prop list. The pitch is appealing: instead of a component with 15 props, you get a composable API where consumers assemble behavior from smaller pieces.

I have used this pattern in design systems and it works well there. A \`Select\` with \`Select.Trigger\`, \`Select.Content\`, and \`Select.Item\` is genuinely easier to use than a flat prop API. The consumer controls layout and composition while the parent manages shared state through context.

But I have also seen teams reach for this pattern too early.

## The cost no one talks about

Compound components create implicit contracts. The child components depend on context provided by the parent, but that dependency is invisible at the call site. TypeScript will not save you if someone renders \`Select.Item\` outside of \`Select\` — you need runtime checks or the component silently breaks.

Testing gets harder too. You cannot unit test a compound child in isolation because it needs the parent's context. Every test becomes an integration test whether you planned it or not.

## When I use it

I reach for compound components when all of these are true:

- The component has a genuine parent-child relationship (not just related UI)
- The children need shared state that would be awkward to pass via props
- The API is public-facing (design system, library) and ergonomics matter more than simplicity

## When I do not

For application code with a known set of consumers, a well-typed props interface is almost always simpler. You get full type safety, straightforward testing, and no hidden context dependencies.

The pattern is a tool. The mistake is treating it as an upgrade.`,
  },
  {
    slug: "performance-cost-of-convenience",
    title: "The performance cost of convenience",
    summary:
      "How default configurations and popular abstractions quietly add hundreds of kilobytes to your bundle.",
    date: "2025-01-28",
    content: `I profiled a production Next.js application last month that shipped 420KB of JavaScript on the landing page. The page had a heading, two paragraphs, and a button. There was no excuse for that bundle size.

The culprits were not exotic. They were the tools we reach for without thinking.

## What I found

**A date formatting library (32KB gzipped)** used in exactly one place to format a single date string. \`Intl.DateTimeFormat\` does the same thing with zero bundle cost.

**A form library (45KB gzipped)** managing a single email input. A controlled input with useState is three lines of code.

**An animation library (28KB gzipped)** adding a fade-in effect to one component. A CSS transition with \`opacity\` achieves the same result.

**A full icon library (tree-shaking was misconfigured)** importing all 2,000 icons when the page used four.

None of these are bad tools. They are useful in the right context. The problem is reaching for them by default.

## The habit that helps

Before adding a dependency, I ask: what is the simplest way to do this with the platform? The browser has \`Intl\` for formatting, \`IntersectionObserver\` for scroll behavior, \`CSS transitions\` for animations, \`dialog\` element for modals. These APIs are well-supported, performant, and free.

Dependencies should solve problems that are genuinely hard, not save five minutes of typing at the cost of kilobytes your users pay for on every visit.

## Measure first

The other habit: run \`next build\` with \`@next/bundle-analyzer\` before every release. If you do not measure, you do not notice the slow creep. By the time someone complains about load times, the bundle has grown beyond what any single cleanup can fix.`,
  },
  {
    slug: "type-safety-at-the-boundary",
    title: "Type safety at the boundary",
    summary:
      "TypeScript's guarantees end where your application meets the outside world. Schema validation at API boundaries is not optional.",
    date: "2024-11-15",
    content: `TypeScript gives you confidence that your code is internally consistent. If a function expects a \`User\` object, the compiler ensures you pass one. But that confidence has a boundary, and the boundary is anywhere data enters your application from the outside.

API responses, URL parameters, form submissions, localStorage reads, WebSocket messages — none of these are type-checked at runtime. TypeScript trusts your type assertions, and that trust is misplaced when the data source is external.

## The pattern I use everywhere

Every external data boundary gets a schema validator. I use Zod, but the library matters less than the practice.

\`\`\`typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["admin", "member", "viewer"]),
});

type User = z.infer<typeof UserSchema>;

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return UserSchema.parse(data);
}
\`\`\`

If the API returns unexpected data, this throws immediately at the boundary instead of causing a cryptic error three components deep.

## Why \`as\` is dangerous

The most common alternative I see is type casting:

\`\`\`typescript
const user = (await response.json()) as User;
\`\`\`

This tells TypeScript to trust you. If the API changes a field name, adds a null where you expected a string, or returns an array instead of an object, TypeScript will not warn you. Your component will render with undefined values and the bug report will say "blank screen on profile page."

## Where to draw the line

I validate at the boundary and trust the types internally. Once data has passed through a schema validator, every function that receives it can rely on TypeScript's static checks. This is not about being paranoid — it is about being precise about where your guarantees come from.`,
  },
  {
    slug: "when-to-use-ref",
    title: "When to reach for useRef instead of useState",
    summary:
      "Not every mutable value needs to trigger a re-render. Knowing the difference keeps components fast and code simple.",
    date: "2024-09-03",
    content: `I review a lot of React code and one of the most common unnecessary re-renders I see comes from storing values in useState that never affect the rendered output.

## The distinction

\`useState\` is for values that the UI depends on. When the value changes, the component re-renders to reflect the new state.

\`useRef\` is for values that persist across renders but do not affect what gets displayed. Updating a ref does not trigger a re-render.

## Common cases where useRef is the right choice

**Tracking whether a component has mounted:**

\`\`\`typescript
const hasMounted = useRef(false);

useEffect(() => {
  if (hasMounted.current) {
    // skip effect on first render
  }
  hasMounted.current = true;
});
\`\`\`

Storing this in state would cause an extra render on mount for no visual change.

**Holding a timer or subscription ID:**

\`\`\`typescript
const intervalId = useRef<number>();

useEffect(() => {
  intervalId.current = window.setInterval(poll, 5000);
  return () => clearInterval(intervalId.current);
}, []);
\`\`\`

You need the ID to clean up, but displaying it to the user makes no sense.

**Storing the previous value of a prop:**

\`\`\`typescript
const prevCount = useRef(count);

useEffect(() => {
  prevCount.current = count;
});
\`\`\`

Useful for comparison logic without triggering additional renders.

## The rule I follow

If changing this value should update what the user sees, use \`useState\`. If the value is bookkeeping that the render function never reads, use \`useRef\`. When in doubt, start with \`useRef\` — you can always promote it to state if you discover the UI depends on it.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
