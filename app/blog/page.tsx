import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { PostCard } from "@/components/post-card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on frontend engineering — component patterns, performance, TypeScript, and technical decision-making.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        title="Blog"
        subtitle="Engineering notes on patterns, tradeoffs, and technical thinking."
      />
      <div className="grid gap-10 py-12">
        {posts.map((post) => (
          <PostCard key={post.slug} {...post} />
        ))}
      </div>
    </>
  );
}
