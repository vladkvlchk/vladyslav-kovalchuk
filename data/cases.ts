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
