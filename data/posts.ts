export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  date: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "tanstack-query-zustand-state-separation",
    title: "TanStack Query and Zustand are not interchangeable. Stop treating them like they are.",
    summary:
      "Using TanStack Query for UI state or Zustand for server cache creates subtle bugs and unnecessary complexity. Here is why separation matters and how to do it right.",
    date: "2026-03-29",
    content: `State in React applications falls into two fundamentally different categories, and mixing them up is one of the most common sources of unnecessary complexity.

**Server state** is data that lives on the server and is borrowed by the client — user profiles, product lists, order histories. It can become stale, it needs to be refetched, and multiple components may need the same data simultaneously.

**Client state** is local UI state — whether a sidebar is open, which tab is active, a form's current input values. It lives only in the browser and has nothing to do with any server.

## TanStack Query owns server state

TanStack Query was built specifically for server state. It handles caching, background refetching, deduplication, and stale-while-revalidate out of the box. Crucially, it eliminates race conditions by design — concurrent requests for the same query key are automatically deduplicated, and cancellation is handled for you.

\`\`\`typescript
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});
\`\`\`

You do not need \`useEffect\`, you do not need to manage loading flags manually, and you do not need to worry about stale closures overwriting fresh data.

## Zustand owns client state

Zustand is ideal for state that has no server representation. Global UI toggles, multi-step form state, wizard progress, theme preferences — anything that does not need to be fetched, cached, or invalidated.

\`\`\`typescript
const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
\`\`\`

It is lightweight, synchronous, and does not pretend to be a data fetching solution.

## Why mixing responsibilities breaks things

If you store server data in Zustand, you take on the entire cache invalidation problem manually — when to refetch, how to handle loading states, how to avoid showing stale data. TanStack Query already solved this. If you push UI state into React Query, you lose the synchronous simplicity that makes Zustand valuable.

## Using both correctly

The pattern is straightforward: fetch with TanStack Query, interact with Zustand.

\`\`\`typescript
function ProductPage() {
  // server state — fetched, cached, auto-refreshed
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  });

  // client state — local UI only
  const { selectedTab, setSelectedTab } = useUIStore();

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab} />
      <ProductDetails product={product} />
    </div>
  );
}
\`\`\`

Server data flows through React Query. UI interactions flow through Zustand. Neither tool tries to do the other's job. That is the entire principle — keep the responsibilities clear and you get the best of both tools without the downsides of either.`,
  },
  {
    slug: "race-conditions-in-react-state",
    title: "Your state updates are lying to you.",
    summary:
      "Race conditions in frontend state are silent, hard to reproduce, and everywhere. Most React apps have them. Here is how to find and fix them.",
    date: "2026-03-22",
    content: `Race conditions are not a backend problem. They happen in every React app that fetches data, debounces input, or runs anything asynchronous — which is every React app.

The tricky part is that they rarely crash. They just show the wrong data. A search result from a previous query. A form submitted with a stale value. A dashboard that briefly flickers between two states. Users notice. Developers do not, because the bug disappears on the next render.

## The classic: out-of-order responses

This is the most common race condition in React:

\`\`\`typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(\\\`/api/users/\\\${userId}\\\`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]);

  return <div>{user?.name}</div>;
}
\`\`\`

Click user A. Request goes out. Click user B quickly. Second request goes out. The second request finishes first — you see user B. Then the first request finishes — now you see user A. You are looking at user A's data while the URL says user B.

This happens because \`setUser\` does not know which request it belongs to. It just sets whatever arrives last.

## Fix 1: AbortController

The simplest fix. Cancel the previous request when a new one starts:

\`\`\`typescript
useEffect(() => {
  const controller = new AbortController();

  fetch(\\\`/api/users/\\\${userId}\\\`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setUser(data))
    .catch((err) => {
      if (err.name !== "AbortError") throw err;
    });

  return () => controller.abort();
}, [userId]);
\`\`\`

When \`userId\` changes, the cleanup function aborts the in-flight request. The stale response never reaches \`setUser\`. This is the pattern you should use by default for any fetch inside \`useEffect\`.

## Fix 2: ignore flag

Sometimes you cannot abort the request — maybe it is a third-party SDK call or a WebSocket message. Use a boolean flag instead:

\`\`\`typescript
useEffect(() => {
  let ignore = false;

  fetchUser(userId).then((data) => {
    if (!ignore) setUser(data);
  });

  return () => {
    ignore = true;
  };
}, [userId]);
\`\`\`

The stale response still arrives, but you ignore it. React's own documentation recommends this exact pattern. It works, but AbortController is better when available because it also saves bandwidth.

## Stale closures in event handlers

Race conditions are not limited to fetching. They also appear in event handlers that reference stale state:

\`\`\`typescript
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      setCount(count + 1); // captures count at the time of click
    }, 1000);
  };

  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

Click three times quickly. You expect 3. You get 1. Every click captured \`count\` as 0, so every timeout sets it to 1.

The fix is the functional updater:

\`\`\`typescript
setCount((prev) => prev + 1);
\`\`\`

This reads the current state at the time of the update, not at the time the closure was created. Use functional updates whenever your next state depends on the previous state. Always.

## Optimistic updates gone wrong

Optimistic UI is powerful but creates a window where local state and server state diverge. If you do not handle the failure path, the user sees data that was never persisted:

\`\`\`typescript
const handleLike = async () => {
  setLiked(true);         // optimistic
  setLikes((n) => n + 1); // optimistic

  try {
    await api.likePost(postId);
  } catch {
    setLiked(false);          // rollback
    setLikes((n) => n - 1);   // rollback
  }
};
\`\`\`

This looks correct until the user clicks like, unlikes, and likes again before the first request finishes. Now you have three in-flight mutations and your rollback logic is racing against itself.

The fix: track the request, not just the state:

\`\`\`typescript
const handleLike = async () => {
  const nextLiked = !liked;
  const delta = nextLiked ? 1 : -1;

  setLiked(nextLiked);
  setLikes((n) => n + delta);

  try {
    await api.setLikeStatus(postId, nextLiked);
  } catch {
    setLiked(!nextLiked);
    setLikes((n) => n - delta);
  }
};
\`\`\`

Or better — use a library like TanStack Query that manages optimistic updates with proper rollback and request deduplication built in. Do not reinvent this.

## Debounced search with stale results

Another common pattern that hides a race condition:

\`\`\`typescript
const handleSearch = useMemo(
  () =>
    debounce(async (query: string) => {
      const results = await api.search(query);
      setResults(results);
    }, 300),
  []
);
\`\`\`

The debounce prevents excessive requests, but it does not prevent out-of-order responses. If "rea" returns slower than "reac", you type "react", see results for "reac", then results for "rea" overwrite them.

Combine debounce with AbortController:

\`\`\`typescript
const controllerRef = useRef<AbortController | null>(null);

const handleSearch = useMemo(
  () =>
    debounce(async (query: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const results = await api.search(query, {
          signal: controller.signal,
        });
        setResults(results);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        throw err;
      }
    }, 300),
  []
);
\`\`\`

## The general principle

Every race condition in React state follows the same pattern: **an async operation completes and writes to state that has moved on since the operation started**.

The defenses are always one of:

- **Cancel the operation** — AbortController, clearing timeouts, unsubscribing
- **Ignore the result** — boolean flags, checking if the component is still mounted or the input is still relevant
- **Use functional updates** — read current state at write time, not at dispatch time
- **Use the right tool** — TanStack Query, SWR, or similar libraries that solve request lifecycle for you

Most of these are not complex. They are just easy to forget. The hardest part is knowing where to look — and now you know.`,
  },
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
