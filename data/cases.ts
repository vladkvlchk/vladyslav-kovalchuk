export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  techStack: string[];
  links?: { label: string; href: string }[];
  image?: string | { light: string; dark: string };
  problem: string;
  constraints: string[];
  solution: string;
  decisions: { title: string; rationale: string }[];
  outcome: string;
}

export const cases: CaseStudy[] = [
  {
    slug: "ascii-video-portfolio-background",
    title:
      "Engineering an ASCII video background: from MP4 to canvas at 79 KB gzipped",
    summary:
      "Custom Node + Canvas pipeline that turns a generated 240-frame MP4 into an ambient ASCII animation on the home page — a fraction of the bandwidth of a <video> tag, near-zero idle CPU, and fully theme-aware.",
    techStack: [
      "Next.js 16",
      "TypeScript",
      "React 19",
      "FFmpeg",
      "fluent-ffmpeg",
      "Canvas 2D",
      "requestAnimationFrame",
      "MutationObserver",
      "Tailwind CSS 4",
    ],
    links: [{ label: "Live", href: "/" }],
    problem:
      "I wanted ambient motion in the background of my portfolio home page — something memorable but not heavy. The obvious option was a looping <video> tag, but that ships a multi-megabyte payload, decodes through the browser's media stack with its own paint and compositor cost, refuses to theme with the rest of the page, and aesthetically clashes with the deliberately minimal monospace tone of a developer portfolio. I wanted an ASCII rendition of a generated clip — visually distinct, type-coherent with the surrounding copy, and deliberately small as a file artifact. The challenge: encode 240 frames of motion as text data, paint them into a canvas without dropping frames or burning CPU, and integrate the result as background art that respects theme, scroll, idle state, viewport size, and Retina pixel density.",
    constraints: [
      "Bandwidth budget on a portfolio is tight — viewers may bounce in seconds, so every KB on the critical path matters.",
      "Idle CPU usage must be near zero. This is decorative; it cannot fight the page for resources or burn mobile battery.",
      "Must look sharp on both Retina and standard displays without shipping per-DPR assets.",
      "Must track the site's light/dark toggle instantly, with no flash and no remount.",
      "The source clip carried a Gemini watermark sparkle in the bottom-right that had to disappear without leaving a visible hole in the lily silhouette behind it.",
      "Cannot block hydration — the animation must not delay the first paint of the actual hero copy.",
    ],
    solution:
      "Two halves. First, a Node script that uses fluent-ffmpeg to pipe the source MP4 through a drawbox filter (to mask the watermark in source pixel space), then a Lanczos downscale to a 120x40 cell grid, then format=gray to emit raw 8-bit luma samples. The script reads those bytes directly — no PNG round-trip — maps them through a 10-step brightness ramp (' .:!ilMW@U+2588'), and packs the output into a JSON blob with runs of three or more spaces inline-RLE-encoded as ~N|. Result: 410 KB raw, 79 KB gzipped on the wire. Second, a client React component fetches that JSON via requestIdleCallback, decodes each row's RLE once into memory, and paints the animation into a transparent canvas. Each glyph is drawn centered in its grid cell via textAlign: center + textBaseline: middle, so the row lands flush against the canvas edges (the natural fillText alternative leaves a ~4% inset gap on the right, which was an early bug that cropped both the watermark area and the lily's right-most tendrils). The animation uses requestAnimationFrame with a delta-time check that throttles to the source fps. A MutationObserver on <html> re-reads currentColor on theme toggle and repaints the active frame in place. Visibilitychange pauses the loop without time drift. On unmount, RAF is cancelled, listeners are removed, and the decoded frames array is zeroed out so V8 can GC the strings.",
    decisions: [
      {
        title: "Canvas + pre-encoded ASCII over an HTML5 <video> tag",
        rationale:
          "The same generated clip as an mp4 was ~1.8 MB even after a tight HandBrake pass — over 20 times the wire weight of the ASCII payload, plus a media-decode loop that is not free on lower-end devices. A <video> element cannot theme its content, cannot blend semantically with surrounding monospace type, and its compositor layer permanently promotes a portion of the page out of CPU paint into the GPU compositor, which is great for full-screen playback but wasteful for a 600x340 corner widget. The trade-off is fidelity — ASCII loses color and pixel detail — but for a deliberately stylised piece that is actually a feature. Rule of thumb I now use: full-bleed real-world footage or anything users will pause and seek stays as <video>; short-loop stylistic ambient art with a flat color palette becomes canvas ASCII.",
      },
      {
        title: "fluent-ffmpeg piped to stdout, no PNG round-trip",
        rationale:
          "Most ASCII video tutorials extract frames to disk as PNG then re-decode each one to read pixels. That is 240 file writes plus 240 PNG decompressions for no reason. Asking ffmpeg for -f rawvideo -pix_fmt gray gives back exactly what is needed — one 8-bit luma byte per pixel — over a single readable stream. The whole 240-frame extraction takes ~220 ms on this hardware, and the encode/RLE pass takes ~12 ms. For alternative tooling I evaluated: jp2a and ascii-image-converter are excellent for stills but cannot stream video at the resolution I needed; ImageMagick + a custom mapper works but is dramatically slower per frame; pure-JS PNG decoders (pngjs) add a real dependency and round-trip I do not need. fluent-ffmpeg here is just a thin spawn wrapper, and that is the right level of abstraction.",
      },
      {
        title: "Brightness ramp design: sparse middle, dense peaks, monospace-friendly glyphs",
        rationale:
          "Classic Bradford ramps run 70 characters from black to white. At a 10 px-per-cell downscale that resolution is wasted — too many glyph candidates with too little luma difference, which reads as noise rather than gradient. I picked a 10-step ramp: a true space for black, then .:!il for edges and medium tones (vertical-emphasis glyphs that visually read as ink strokes following the petal lines), then MW@ for solid bright fills, then U+2588 FULL BLOCK for the peaks. Vertical-emphasis glyphs on the edges follow the lily's bloom lines; the full block punctuates the brightest pixels without a hash sign, which always reads as code, not as art. ~ and | are intentionally absent from the ramp so they can be used as inline RLE markers without ambiguity.",
      },
      {
        title: "Per-cell RLE only on spaces, trust gzip for the rest",
        rationale:
          "Most of the frame is black, which maps to spaces. Replacing runs of three or more spaces with the marker ~N| shaves ~40% off the raw JSON before any HTTP compression — and importantly it pays off most exactly where gzip already struggles (long uniform runs are well-handled, but skipping them entirely is cheaper on the decode side). Beyond that, I did not write a binary encoder. Gzip and Brotli already handle character-level redundancy well, an encoded binary format would require shipping a decoder, and the JSON pipeline lets browsers stream and JSON.parse it natively. 410 KB raw, 79 KB gzip on the wire, ~1 MB decoded into strings client-side — that is a 5x compression at zero client cost.",
      },
      {
        title: "Per-glyph fillText, not per-row",
        rationale:
          "The natural way to draw an ASCII row is ctx.fillText(rowString, 0, y) — fast, one call per row. The catch is that monospace advance is roughly 0.6 of font size, so the rightmost glyph of a 120-character row lands around 96% of canvas width, not at the edge. Invisible on a centered subject; very visible on a clip where the lily branches and the Gemini watermark hugged the right edge. Switching to textAlign: center + textBaseline: middle and drawing each glyph at the precise center of its grid cell costs ~120x40 = 4,800 fillText calls per frame x 24 fps = ~115k calls/sec, which modern Canvas 2D handles in 3-4 ms per frame with alpha: true. The right-edge alignment is now pixel-perfect. The lesson generalises: font advance metrics will not align to whatever grid you want — if you need a grid, draw a grid.",
      },
      {
        title: "Mask the watermark in source pixel space, not after the ASCII encode",
        rationale:
          "The clip carried a Gemini sparkle in the bottom-right corner. Erasing it after the encode would leave a visible hole in every frame where the lily bloom reached that area. Adding drawbox=x=1130:y=545:w=60:h=110:color=black:t=fill as the first ffmpeg filter paints a solid black rectangle over the watermark in the original 1280x720 source, which then blends invisibly into the black background after Lanczos downscale. No artifact, no lily content lost, and the mask coordinates live in source pixel space where they are easy to reason about and to verify by inspecting frames pre- and post-mask.",
      },
      {
        title: "Z-index inversion + backdrop-blur per text block, not per section",
        rationale:
          "First version had the canvas at z-50 and a translucent backdrop-blur card wrapping each section. That backwards: the canvas painted over the text instead of behind it, and the section-wide cards put blur in the empty space between text blocks instead of just behind the text itself. Fix: canvas at z-0, <main> and <footer> claim z-10 so positioned text always wins the stacking battle, and the blur halo is moved to individual text elements as inline-block w-fit rounded-md bg-background/60 backdrop-blur-[2px]. Each h1 line, paragraph, link, and tech tag gets a tight halo that hugs the glyphs; the gaps between blocks let the ASCII bloom through cleanly. Same trick keeps text legibility intact on the busy art without painting a full sheet of glass over the page.",
      },
      {
        title: "Defer fetch to idle, pause on hidden, drop refs on unmount",
        rationale:
          "Loading and decoding a megabyte of strings on hydration is exactly the kind of work that delays first paint of the actual hero copy. The component defers fetch via requestIdleCallback with a 1500 ms timeout, with setTimeout(200) as a Safari fallback. A visibilitychange listener pauses the RAF when the tab is hidden and resets lastFrameTime on return so the animation does not fast-forward through skipped time. On unmount, RAF is cancelled, both listeners are removed, the MutationObserver is disconnected, and the frames array is reassigned to [] so the ~1 MB of decoded string data can be GC'd. None of these by themselves are heroic — they are table stakes for code that lives in a page someone has open in a tab they forgot about.",
      },
      {
        title: "DPR capped at 2, glyph color read from CSS",
        rationale:
          "Retina screens report devicePixelRatio of 2 or 3. Rendering at 3x means drawing 9 times the pixels with no perceptual gain on text-sized glyphs — capping at 2 is the standard trick. For theme, instead of wiring a React context into the render path, the canvas wrapper just inherits a Tailwind text-zinc-700 / dark:text-zinc-200 class and the renderer reads getComputedStyle(wrap).color once on init and on theme change. This keeps the canvas decoupled from the React theme system and means future palette tweaks happen in markup, not in code.",
      },
    ],
    outcome:
      "410 KB JSON / 79 KB gzipped on the wire, decoded once into ~1 MB of strings client-side and never re-allocated. Paint cost is ~3-4 ms per frame at 24 fps on a 1280x720 effective canvas, with the loop yielding ~98% idle between renders. Lighthouse scores did not move — no LCP delay (the canvas waits for idle), no CLS (it is aria-hidden, fixed-position, outside flow). Same payload and same renderer drive both the corner widget on /  and the full-screen preview at /ascii. The biggest lesson was the right-edge fillText cropping: a reminder that drawing primitives in Canvas 2D are sharper instruments than they look, and that the right time to verify pixel-level alignment is before you ship — not after the user with a generated source clip points at the missing sparkle in the bottom-right corner.",
  },
  {
    slug: "hyperliquid-asset-router",
    title: "Building a multi-hop DEX router for Hyperliquid spot trading",
    summary:
      "Developed a spot trading interface for Hyperliquid L1 with automatic route discovery, multi-hop execution, and an agent wallet pattern to bypass EIP-712 signing constraints.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Wagmi",
      "Viem",
      "Privy",
      "Hyperliquid API",
      "Tailwind CSS",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/vladkvlchk/hyperliquid-assets-router" },
      { label: "Live demo", href: "https://hyperliquid-assets-router.vercel.app" },
    ],
    image: "/hyperliquid-dex.png",
    problem:
      "Hyperliquid is a high-performance L1 built for derivatives trading, but its spot market lacked a user-friendly interface for swapping between assets. Users had to manually identify trading pairs, calculate routes through intermediary tokens (like USDC), and execute each hop separately. Worse, the exchange's signing scheme required chainId 1337 for trade actions, but browser wallets like MetaMask validate that the signing chainId matches the connected chain — Arbitrum (42161) in this case. Every trade attempt failed at the wallet level before reaching the exchange.",
    constraints: [
      "Wallet providers enforce EIP-712 chainId validation — there is no way to sign with chainId 1337 while connected to Arbitrum.",
      "Multi-hop routes had to execute sequentially, with each hop using the output of the previous one.",
      "Orderbook data had to be fresh for accurate price estimation, but fetching all pairs on every route search was too expensive.",
      "The solution had to work without requiring users to switch networks or use a custom wallet.",
    ],
    solution:
      "I implemented Hyperliquid's agent wallet pattern: a locally-generated ephemeral keypair that users approve once via a wallet signature (using chainId 42161, which MetaMask accepts). The agent key then signs all trade actions with chainId 1337 directly — no wallet popup, no chainId conflict. For routing, I built a BFS-based pathfinder that discovers the shortest path between any two tokens within 3 hops. To minimize API calls, the router checks for direct pairs first and only fetches orderbooks for relevant intermediary routes (via USDC or HYPE). Multi-hop trades execute sequentially, with each hop's output feeding into the next. The UI shows real-time price estimates, slippage warnings, and supports both market and limit orders with cancellation.",
    decisions: [
      {
        title: "Agent wallet pattern over network switching",
        rationale:
          "Asking users to add a custom network or switch chains breaks the flow and causes confusion. The agent wallet lets users stay on Arbitrum while the agent signs L1 actions in the background. The private key lives in localStorage — acceptable for a trading frontend since agents cannot withdraw funds, only place orders.",
      },
      {
        title: "BFS routing over weighted Dijkstra",
        rationale:
          "For a 3-hop maximum, BFS finds the shortest path quickly without needing edge weights. A more sophisticated router would weight edges by spread and estimated slippage, but for the current pair set, fewer hops correlates well with lower slippage. This kept the implementation simple and fast.",
      },
      {
        title: "Selective orderbook fetching",
        rationale:
          "Initially the router fetched all orderbooks on every search, creating 20+ API requests. I optimized this by checking for a direct pair first (1 request), and only fetching 2-hop routes through common intermediaries if no direct path exists. This reduced average requests from 20+ to 2-4.",
      },
      {
        title: "State machine for trade execution",
        rationale:
          "Trade execution has multiple states: discovering, route_found, executing, executed, error. A reducer-based state machine makes transitions explicit and prevents impossible states like showing a result while still executing. It also made adding multi-hop progress tracking straightforward.",
      },
    ],
    outcome:
      "The router handles any token pair available on Hyperliquid spot, automatically finding routes through up to 3 hops. The agent wallet flow reduced friction significantly — users sign once and can execute unlimited trades without popups. Price estimates update in real-time from live orderbook data, and the UI warns about low liquidity or stale data. The architecture cleanly separates concerns: routing logic, exchange API, signing, and UI state are all independent modules. The project deepened my understanding of exchange-specific signing schemes and the tradeoffs in DEX routing.",
  },
  {
    slug: "web3-chat",
    title: "Building a decentralized chat to learn Web3 from the ground up",
    summary:
      "Built a full-stack on-chain messaging app on Ethereum Sepolia — from Solidity smart contract to a polished Next.js frontend with wallet connection, real-time event subscriptions, and a server-side faucet.",
    techStack: ["Next.js", "TypeScript", "Wagmi", "Viem", "RainbowKit", "Solidity", "Hardhat", "Tailwind CSS"],
    links: [
      { label: "GitHub", href: "https://github.com/vladkvlchk/web3-chat" },
      { label: "Live demo", href: "https://web3-chat-tawny.vercel.app" },
    ],
    image: { light: "/web3-chat_preview_light.png", dark: "/web3-chat_preview_dark.png" },
    problem:
      "I wanted to build Web3 applications seriously, not just read about them. Most tutorials stop at connecting a wallet and calling a single contract method. I needed to go through the full cycle — writing and deploying a smart contract, handling transactions and confirmations on the frontend, managing wallet state, and structuring a codebase that could grow into a larger dapp. The goal was to pick a deliberately simple product idea (a chat room) so the focus stayed on the Web3 tooling and architecture rather than business logic.",
    constraints: [
      "The product had to be simple enough to finish quickly, but the architecture had to be realistic — not a throwaway demo.",
      "All messages had to live on-chain. No database, no centralized backend for chat data.",
      "The app had to work for users with zero ETH in their wallet, so a faucet was necessary.",
      "The frontend had to feel like a real product, not a blockchain experiment with raw transaction hashes.",
    ],
    solution:
      "I wrote a MessageBoard smart contract in Solidity that stores messages (sender address, text, timestamp) on-chain and emits events for real-time updates. I deployed it to Sepolia via Hardhat. On the frontend, I used Next.js 15 with wagmi and viem for all blockchain interactions — reading messages, writing transactions, and subscribing to NewMessage events. RainbowKit handled the wallet connection UX. I built a server-side faucet as a Next.js API route that uses a private key to send test ETH to users, keeping the key secure on the server. The UI was built with shadcn/ui components, Tailwind CSS, and full dark mode support.",
    decisions: [
      {
        title: "Wagmi + viem over ethers.js",
        rationale:
          "Wagmi provides React hooks designed specifically for wallet and contract interactions — useReadContract, useWriteContract, useWatchContractEvent. Combined with viem as the transport layer, this gave me type-safe contract calls and better bundle size than ethers.js. I still used ethers on the server for the faucet where React hooks are not available.",
      },
      {
        title: "On-chain event subscriptions for real-time UX",
        rationale:
          "Instead of polling the contract for new messages, I used useWatchContractEvent to listen to the NewMessage event. This gave near-real-time updates without unnecessary RPC calls and taught me how event-driven architecture works on Ethereum.",
      },
      {
        title: "Atomic component structure",
        rationale:
          "I organized components into atoms, forms, widgets, and providers. Even for a small app, this separation made the codebase navigable and established patterns I can reuse in larger dapps — especially the provider composition pattern for wagmi, RainbowKit, and React Query.",
      },
      {
        title: "Server-side faucet",
        rationale:
          "Exposing a private key on the client is not an option. The faucet runs as a Next.js API route that holds the key in an environment variable and sends small amounts of Sepolia ETH. This was a practical lesson in keeping secrets server-side in a Web3 context.",
      },
    ],
    outcome:
      "The app is live on Vercel and functional on Sepolia. I came out of this project confident with the full Web3 frontend stack: wagmi for contract hooks, viem for low-level calls, RainbowKit for wallet UX, and Hardhat for contract development and deployment. The codebase is structured to scale — adding new contract interactions or screens is a matter of writing a new hook and composing existing providers. The project directly informed the architecture of the larger dapp I am building now.",
  },
];

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}
