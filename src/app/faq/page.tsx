import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Answers to common questions about ReviewPulse — pricing, integrations, AI responses, review management, and more. Everything you need to know before signing up.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "ReviewPulse FAQ — Your Questions Answered",
    description:
      "Learn about pricing, integrations, AI review responses, and how ReviewPulse helps local businesses manage their online reputation.",
  },
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "What is ReviewPulse?",
        a: "ReviewPulse is a review management platform that pulls all your Google, Yelp, and Facebook reviews into a single dashboard. It uses AI to help you respond faster, track sentiment trends, and never miss a review.",
      },
      {
        q: "How long does setup take?",
        a: "Less than 2 minutes. Sign up, connect your Google Business Profile (and optionally Yelp and Facebook on Pro), and your reviews start flowing in immediately. Historical reviews are imported automatically.",
      },
      {
        q: "Do I need technical skills to use ReviewPulse?",
        a: "Not at all. ReviewPulse is designed for busy business owners. If you can use email, you can use ReviewPulse. The interface is straightforward — connect your profiles and start managing reviews.",
      },
      {
        q: "Can I manage multiple business locations?",
        a: "Yes! You can add and manage multiple business locations from a single ReviewPulse account. Each location gets its own review feed and analytics.",
      },
    ],
  },
  {
    category: "Pricing & Plans",
    questions: [
      {
        q: "Is ReviewPulse really free?",
        a: "Yes. The Free plan gives you Google review monitoring for up to 10 reviews, 5 AI-generated responses per month, and a weekly email digest. No credit card required, no trial period — it's free forever.",
      },
      {
        q: "What does the Pro plan include?",
        a: "Pro ($49/month) unlocks all three platforms (Google, Yelp, Facebook), unlimited review tracking, unlimited AI responses, instant email alerts, sentiment analytics, and response templates.",
      },
      {
        q: "Can I cancel my Pro subscription anytime?",
        a: "Absolutely. There are no contracts or cancellation fees. Cancel anytime from your account settings and you'll keep Pro access through the end of your billing period.",
      },
    ],
  },
  {
    category: "AI & Review Responses",
    questions: [
      {
        q: "How does the AI response generation work?",
        a: "When you click 'Reply' on a review, our AI reads the review text, sentiment, and rating to generate a personalized response draft. You can adjust the tone (professional, friendly, apologetic), edit the text, and then post it. The AI learns from your previous responses to better match your brand voice.",
      },
      {
        q: "Can the AI respond to reviews automatically?",
        a: "No — and that's by design. We believe every response should have a human touch. The AI generates drafts for you to review, edit, and approve before posting. This ensures quality and authenticity in every response.",
      },
      {
        q: "What about negative reviews?",
        a: "ReviewPulse's AI is particularly helpful with negative reviews. It generates empathetic, professional responses that acknowledge the customer's concern and offer to resolve the issue — helping you turn negative experiences into positive outcomes.",
      },
    ],
  },
  {
    category: "Integrations & Data",
    questions: [
      {
        q: "Which review platforms does ReviewPulse support?",
        a: "Currently, ReviewPulse supports Google Business Profile, Yelp, and Facebook. We're actively working on adding TripAdvisor, Trustpilot, and industry-specific platforms.",
      },
      {
        q: "Is my data secure?",
        a: "Yes. We use industry-standard encryption, secure OAuth connections (we never store your platform passwords), and row-level security in our database. Your review data is only accessible to your account.",
      },
      {
        q: "How often are reviews synced?",
        a: "Pro plan reviews sync in near real-time with instant notifications. Free plan reviews are synced daily with a weekly email digest summarizing new reviews.",
      },
    ],
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((cat) =>
      cat.questions.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      }))
    ),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            <Link href="/blog" className="text-sm text-gray-400 transition hover:text-white">
              Blog
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
            Frequently Asked{" "}
            <span className="gradient-text">Questions</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Everything you need to know about ReviewPulse. Can&apos;t find what
            you&apos;re looking for? Reach out to our support team.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-12">
            {faqs.map((category, i) => (
              <div key={i}>
                <h2 className="mb-6 text-xl font-bold text-indigo-400">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, j) => (
                    <details
                      key={j}
                      className="group glow-card rounded-xl"
                    >
                      <summary className="cursor-pointer list-none px-6 py-4 text-sm font-semibold transition hover:text-indigo-400">
                        <span className="flex items-center justify-between">
                          {faq.q}
                          <span className="ml-4 shrink-0 text-gray-500 transition group-open:rotate-45">
                            +
                          </span>
                        </span>
                      </summary>
                      <div className="border-t border-white/5 px-6 py-4">
                        <p className="text-sm leading-relaxed text-gray-400">
                          {faq.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glow-card rounded-3xl p-12">
            <h2 className="mb-4 text-3xl font-bold">Still have questions?</h2>
            <p className="mb-8 text-gray-400">
              Start for free and see ReviewPulse in action. Or reach out — we&apos;re
              happy to help.
            </p>
            <Link
              href="/signup"
              className="btn-glow inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
