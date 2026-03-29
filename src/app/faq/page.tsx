import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description: "Answers to common questions about ReviewPulse — pricing, integrations, AI responses, and more.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      { q: "What is ReviewPulse?", a: "ReviewPulse pulls all your Google, Yelp, and Facebook reviews into a single dashboard. It uses AI to help you respond faster, track sentiment trends, and never miss a review." },
      { q: "How long does setup take?", a: "Less than 2 minutes. Sign up, connect your Google Business Profile (and optionally Yelp and Facebook on Pro), and your reviews start flowing in immediately." },
      { q: "Do I need technical skills?", a: "Not at all. If you can use email, you can use ReviewPulse. The interface is designed for busy business owners." },
      { q: "Can I manage multiple locations?", a: "Yes! Add and manage multiple business locations from a single ReviewPulse account. Each location gets its own review feed and analytics." },
    ],
  },
  {
    category: "Pricing & Plans",
    questions: [
      { q: "Is ReviewPulse really free?", a: "Yes. The Free plan gives you Google review monitoring for up to 10 reviews, 5 AI responses per month, and a weekly email digest. No credit card required." },
      { q: "What does the Pro plan include?", a: "Pro ($49/month) unlocks all three platforms, unlimited review tracking, unlimited AI responses, instant alerts, sentiment analytics, and response templates." },
      { q: "Can I cancel anytime?", a: "Absolutely. No contracts or cancellation fees. Cancel anytime and keep Pro access through the end of your billing period." },
    ],
  },
  {
    category: "AI & Responses",
    questions: [
      { q: "How does AI response generation work?", a: "Click 'Reply' on a review — our AI reads the text, sentiment, and rating to generate a personalized draft. Adjust the tone, edit, and post." },
      { q: "Can the AI respond automatically?", a: "No, by design. Every response gets your review and approval before posting. The AI drafts, you decide." },
      { q: "What about negative reviews?", a: "ReviewPulse's AI generates empathetic, professional responses that acknowledge concerns and offer resolution — turning negatives into opportunities." },
    ],
  },
  {
    category: "Integrations & Security",
    questions: [
      { q: "Which platforms are supported?", a: "Google Business Profile, Yelp, and Facebook. We're actively adding TripAdvisor and Trustpilot." },
      { q: "Is my data secure?", a: "Yes. Industry-standard encryption, secure OAuth (we never store passwords), and row-level security. Your data is only accessible to your account." },
      { q: "How often do reviews sync?", a: "Pro: near real-time with instant notifications. Free: daily sync with weekly email digest." },
    ],
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((cat) =>
      cat.questions.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } }))
    ),
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh-gradient left-[20%] top-[5%] h-[500px] w-[500px] bg-orange-500/6" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">ReviewPulse</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/how-it-works" className="text-sm text-zinc-400 transition hover:text-white">How It Works</Link>
            <Link href="/#pricing" className="text-sm text-zinc-400 transition hover:text-white">Pricing</Link>
            <Link href="/blog" className="text-sm text-zinc-400 transition hover:text-white">Blog</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2.5 text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-16 md:pt-48 md:pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 inline-flex badge text-orange-400 border-orange-500/20 bg-orange-500/5">
            <Sparkles className="h-3.5 w-3.5" /> Got questions?
          </div>
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-6xl">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Everything you need to know about ReviewPulse.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 space-y-12">
          {faqs.map((category, i) => (
            <div key={i}>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-orange-400">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, j) => (
                  <details key={j} className="group bento overflow-hidden">
                    <summary className="cursor-pointer list-none px-6 py-4 text-sm font-semibold transition hover:text-orange-400">
                      <span className="flex items-center justify-between">
                        {faq.q}
                        <span className="ml-4 shrink-0 text-zinc-600 transition group-open:rotate-45 text-lg">+</span>
                      </span>
                    </summary>
                    <div className="border-t border-white/5 px-6 py-4">
                      <p className="text-sm leading-relaxed text-zinc-400">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glass rounded-[2rem] p-12">
            <h2 className="mb-4 font-display text-3xl font-bold">Still have questions?</h2>
            <p className="mb-8 text-zinc-400">Start free and see ReviewPulse in action.</p>
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-amber-500">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="font-display text-sm font-bold">ReviewPulse</span>
          </Link>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/how-it-works" className="transition hover:text-white">How It Works</Link>
            <Link href="/faq" className="transition hover:text-white">FAQ</Link>
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
          </div>
          <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} ReviewPulse</p>
        </div>
      </footer>
    </div>
  );
}
