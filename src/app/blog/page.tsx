import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Review Management Tips & Guides",
  description:
    "Expert guides on managing online reviews, responding to customers, local SEO, and building your business reputation. Tips for Google, Yelp, and Facebook reviews.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "ReviewPulse Blog — Review Management Tips & Guides",
    description:
      "Expert guides on managing online reviews, local SEO, and building your business reputation.",
  },
};

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-online-reviews-matter-local-business",
    title: "Why Online Reviews Matter More Than Ever for Local Businesses",
    excerpt:
      "93% of consumers say online reviews impact their purchasing decisions. Learn why managing your reviews is no longer optional — and what happens when you ignore them.",
    readTime: "6 min read",
    date: "2026-03-15",
    category: "Reputation Management",
  },
  {
    slug: "how-to-respond-negative-reviews",
    title: "How to Respond to Negative Reviews (With Templates)",
    excerpt:
      "Negative reviews don't have to hurt your business. Here's a proven framework for responding to unhappy customers that turns complaints into opportunities.",
    readTime: "8 min read",
    date: "2026-03-10",
    category: "Response Strategy",
  },
  {
    slug: "google-review-management-guide",
    title: "The Complete Guide to Google Review Management in 2026",
    excerpt:
      "From claiming your Google Business Profile to responding at scale — everything you need to know about managing Google reviews for your local business.",
    readTime: "12 min read",
    date: "2026-03-05",
    category: "Google Reviews",
  },
  {
    slug: "ai-review-responses-best-practices",
    title: "AI-Powered Review Responses: Best Practices for Authenticity",
    excerpt:
      "AI can help you respond to reviews faster, but authenticity still matters. Learn how to use AI tools effectively while keeping your brand voice genuine.",
    readTime: "7 min read",
    date: "2026-02-28",
    category: "AI & Automation",
  },
  {
    slug: "reputation-management-roi",
    title: "The ROI of Online Reputation Management: Data & Case Studies",
    excerpt:
      "What's the actual return on investing in review management? We break down the numbers: response rates, revenue impact, and real case studies from local businesses.",
    readTime: "10 min read",
    date: "2026-02-20",
    category: "Business Strategy",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-500" />
            <span className="text-lg font-bold tracking-tight">
              ReviewPulse
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/how-it-works" className="text-sm text-gray-400 transition hover:text-white">
              How It Works
            </Link>
            <Link href="/#pricing" className="text-sm text-gray-400 transition hover:text-white">
              Pricing
            </Link>
            <Link href="/faq" className="text-sm text-gray-400 transition hover:text-white">
              FAQ
            </Link>
            <Link
              href="/signup"
              className="btn-glow rounded-lg px-4 py-2 text-sm font-medium text-white"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            The ReviewPulse{" "}
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Expert guides on review management, customer engagement, local SEO,
            and building a reputation that drives revenue.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glow-card group block rounded-2xl p-8 transition hover:border-indigo-500/30"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                  <span className="text-xs text-gray-600">{post.date}</span>
                </div>
                <h2 className="mb-3 text-xl font-bold transition group-hover:text-indigo-400">
                  {post.title}
                </h2>
                <p className="text-sm leading-relaxed text-gray-400">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition group-hover:gap-2">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Get review management tips in your inbox
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Weekly insights on managing reviews, improving your online
            reputation, and growing your local business.
          </p>
          <Link
            href="/signup"
            className="btn-glow inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-semibold">ReviewPulse</span>
            </Link>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/how-it-works" className="transition hover:text-white">How It Works</Link>
              <Link href="/faq" className="transition hover:text-white">FAQ</Link>
              <Link href="/blog" className="transition hover:text-white">Blog</Link>
            </div>
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} ReviewPulse
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
