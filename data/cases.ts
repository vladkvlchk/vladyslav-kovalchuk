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
