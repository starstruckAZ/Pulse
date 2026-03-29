import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Link2,
  Zap,
  BarChart3,
  Bell,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how ReviewPulse helps local businesses manage reviews from Google, Yelp, and Facebook in 3 simple steps. Connect, monitor, and respond — all from one dashboard.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: "How ReviewPulse Works — 3 Steps to Better Reviews",
    description:
      "Connect your business profiles, monitor reviews in real-time, and respond with AI-powered replies. Set up in under 2 minutes.",
  },
};

const steps = [
  {
    number: "01",
    icon: <Link2 className="h-8 w-8" />,
    title: "Connect Your Profiles",
    description:
      "Link your Google Business Profile, Yelp, and Facebook pages in just a few clicks. ReviewPulse securely connects to each platform and starts pulling in your reviews automatically.",
    details: [
      "One-click Google Business Profile connection",
      "Secure OAuth integration — we never store your passwords",
      "Add multiple business locations",
      "Historical reviews imported automatically",
    ],
  },
  {
    number: "02",
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Monitor & Analyze",
    description:
      "Every review from every platform appears in your unified dashboard. Our AI automatically analyzes sentiment so you can spot trends and address issues before they escalate.",
    details: [
      "Real-time review notifications",
      "AI-powered sentiment analysis (positive, neutral, negative)",
      "Rating trends and analytics over time",
      "Filter and sort by platform, rating, or sentiment",
    ],
  },
  {
    number: "03",
    icon: <Zap className="h-8 w-8" />,
    title: "Respond in Seconds",
    description:
      "Generate professional, personalized responses with one click using our AI. Customize the tone and details, then post directly. Save your best responses as templates for even faster replies.",
    details: [
      "AI-generated response drafts tailored to each review",
      "Adjust tone: professional, friendly, apologetic",
      "Save and reuse response templates",
      "Track which reviews you've responded to",
    ],
  },
];

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Manage Online Reviews with ReviewPulse",
    description:
      "A step-by-step guide to managing your business reviews from Google, Yelp, and Facebook using ReviewPulse.",
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.description,
    })),
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
            <Link
              href="/#features"
              className="text-sm text-gray-400 transition hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-sm text-gray-400 transition hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-sm text-gray-400 transition hover:text-white"
            >
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
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            How <span className="gradient-text">ReviewPulse</span> Works
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Go from scattered reviews across multiple platforms to a single,
            AI-powered dashboard in under 2 minutes. Here&apos;s how.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-8 top-24 bottom-0 hidden w-px bg-gradient-to-b from-indigo-500/30 to-transparent md:block" />
                )}
                <div className="glow-card rounded-2xl p-8 md:p-10">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                      {step.icon}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-indigo-500">
                        STEP {step.number}
                      </span>
                      <h2 className="text-2xl font-bold">{step.title}</h2>
                    </div>
                  </div>
                  <p className="mb-6 text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {step.details.map((detail, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: "500+", label: "Businesses Trust Us" },
              { value: "50K+", label: "Reviews Managed" },
              { value: "4.8x", label: "Faster Response Time" },
              { value: "32%", label: "More Repeat Customers" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glow-card rounded-3xl p-12">
            <Bell className="mx-auto mb-6 h-12 w-12 text-indigo-500" />
            <h2 className="mb-4 text-3xl font-bold">Ready to take control?</h2>
            <p className="mb-8 text-gray-400">
              Join 500+ local businesses already using ReviewPulse to manage
              their online reputation. Set up takes less than 2 minutes.
            </p>
            <Link
              href="/signup"
              className="btn-glow inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Free forever plan. No credit card required.
            </p>
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
