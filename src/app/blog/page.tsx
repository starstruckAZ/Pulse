import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ArrowRight, Clock, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Review Management Tips & Guides",
  description: "Expert guides on managing online reviews, responding to customers, local SEO, and building your business reputation.",
  alternates: { canonical: "/blog" },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  { slug: "why-online-reviews-matter-local-business", title: "Why Online Reviews Matter More Than Ever for Local Businesses", excerpt: "93% of consumers say online reviews impact their purchasing decisions. Learn why managing reviews is no longer optional.", readTime: "6 min", date: "2026-03-15", category: "Reputation Management" },
  { slug: "how-to-respond-negative-reviews", title: "How to Respond to Negative Reviews (With Templates)", excerpt: "Negative reviews don't have to hurt your business. A proven framework for turning complaints into opportunities.", readTime: "8 min", date: "2026-03-10", category: "Response Strategy" },
  { slug: "google-review-management-guide", title: "The Complete Guide to Google Review Management in 2026", excerpt: "From claiming your profile to responding at scale — everything about managing Google reviews.", readTime: "12 min", date: "2026-03-05", category: "Google Reviews" },
  { slug: "review-response-templates-guide", title: "Review Response Templates: How to Reply Faster Without Sounding Generic", excerpt: "Learn how to use response templates effectively while keeping every reply personal and on-brand.", readTime: "7 min", date: "2026-02-28", category: "Response Strategy" },
  { slug: "reputation-management-roi", title: "The ROI of Online Reputation Management: Data & Case Studies", excerpt: "What's the actual return on investing in review management? Real numbers and case studies.", readTime: "10 min", date: "2026-02-20", category: "Business Strategy" },
];

export default function BlogPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh-gradient right-[-10%] top-[10%] h-[500px] w-[500px] bg-[#ff6b4a]/[0.06]" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71] shadow-lg shadow-[#ff6b4a]/20">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">ReviewHype</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/how-it-works" className="text-[13px] text-[#8b8b9e] transition hover:text-white">How It Works</Link>
            <Link href="/#pricing" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Pricing</Link>
            <Link href="/faq" className="text-[13px] text-[#8b8b9e] transition hover:text-white">FAQ</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2 text-[13px]">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-16 md:pt-48 md:pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 inline-flex badge text-[#ff6b4a] border-[#ff6b4a]/15 bg-[#ff6b4a]/[0.04]">
            <Sparkles className="h-3.5 w-3.5" /> Insights & guides
          </div>
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-6xl">
            The ReviewHype <span className="gradient-text">Blog</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#8b8b9e]">
            Expert guides on review management, customer engagement, and local SEO.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="bento group block p-8 transition hover:border-[#ff6b4a]/15">
              <div className="mb-3 flex items-center gap-3">
                <span className="badge text-[#ff6b4a] border-[#ff6b4a]/15 bg-[#ff6b4a]/[0.04] text-xs">{post.category}</span>
                <span className="flex items-center gap-1 text-xs text-[#4a4a5e]"><Clock className="h-3 w-3" />{post.readTime}</span>
                <span className="text-xs text-zinc-700">{post.date}</span>
              </div>
              <h2 className="mb-3 font-display text-xl font-bold transition group-hover:text-[#ff6b4a]">{post.title}</h2>
              <p className="text-sm leading-relaxed text-[#8b8b9e]">{post.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#ff6b4a] transition group-hover:gap-2">
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold">Get tips in your inbox</h2>
          <p className="mb-6 text-sm text-[#8b8b9e]">Weekly insights on review management and growing your local business.</p>
          <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base">
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="font-display text-sm font-bold">ReviewHype</span>
          </Link>
          <div className="flex gap-6 text-sm text-[#8b8b9e]">
            <Link href="/how-it-works" className="transition hover:text-white">How It Works</Link>
            <Link href="/faq" className="transition hover:text-white">FAQ</Link>
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
          </div>
          <p className="text-xs text-[#4a4a5e]">&copy; {new Date().getFullYear()} ReviewHype</p>
        </div>
      </footer>
    </div>
  );
}
