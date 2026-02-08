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
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
