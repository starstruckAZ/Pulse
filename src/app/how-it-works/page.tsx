import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare, Link2, Zap, BarChart3, Bell, CheckCircle2, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description: "See how ReviewPulse helps local businesses manage reviews from Google, Yelp, and Facebook in 3 simple steps.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    number: "01",
    icon: <Link2 className="h-7 w-7" />,
    iconBg: "bg-[#ff6b4a]/[0.08] ring-1 ring-[#ff6b4a]/15",
    iconColor: "text-[#ff6b4a]",
    title: "Connect Your Profiles",
    description: "Link your Google Business Profile, Yelp, and Facebook pages in a few clicks. We securely pull in your reviews automatically.",
    details: ["One-click Google Business Profile connection", "Secure OAuth — we never store passwords", "Add multiple business locations", "Historical reviews imported automatically"],
  },
  {
    number: "02",
    icon: <BarChart3 className="h-7 w-7" />,
    iconBg: "bg-[#6366f1]/[0.08] ring-1 ring-[#6366f1]/15",
    iconColor: "text-[#818cf8]",
    title: "Monitor & Analyze",
    description: "Every review appears in your unified dashboard. Sentiment analysis helps you spot trends before they escalate.",
    details: ["Real-time review notifications", "Sentiment analysis on every review", "Rating trends and analytics over time", "Filter by platform, rating, or sentiment"],
  },
  {
    number: "03",
    icon: <Zap className="h-7 w-7" />,
    iconBg: "bg-[#2dd4bf]/[0.08] ring-1 ring-[#2dd4bf]/15",
    iconColor: "text-[#2dd4bf]",
    title: "Respond in Seconds",
    description: "Use response templates to craft professional replies fast. Save your best replies and reuse them across reviews.",
    details: ["One-click reply with saved templates", "Adjust tone: professional, friendly, apologetic", "Save and reuse response templates", "Track which reviews you've responded to"],
  },
];

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Manage Online Reviews with ReviewPulse",
    description: "A step-by-step guide to managing your business reviews using ReviewPulse.",
    step: steps.map((step, i) => ({ "@type": "HowToStep", position: i + 1, name: step.title, text: step.description })),
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh-gradient left-[-10%] top-[10%] h-[500px] w-[500px] bg-[#ff6b4a]/[0.06] animate-glow" />
      <div className="mesh-gradient right-[-10%] top-[40%] h-[400px] w-[400px] bg-[#6366f1]/[0.05]" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71] shadow-lg shadow-[#ff6b4a]/20">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">ReviewPulse</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Features</Link>
            <Link href="/#pricing" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Pricing</Link>
            <Link href="/blog" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Blog</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2 text-[13px]">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 md:pt-52 md:pb-32">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-10 inline-flex badge border-[#ff6b4a]/15 bg-[#ff6b4a]/[0.04] text-[#ff6b4a]">
            <Sparkles className="h-3.5 w-3.5" /> 3 simple steps
          </div>
          <h1 className="mb-6 font-display text-display-md md:text-display-lg">
            How <span className="gradient-text">ReviewPulse</span> works
          </h1>
          <p className="mx-auto max-w-2xl text-base text-[#8b8b9e] md:text-lg">
            Go from scattered reviews to a single AI-powered dashboard in under 2 minutes.
          </p>
        </div>
      </section>

      <div className="gradient-line" />

      {/* Steps */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="bento p-8 md:p-10">
              <div className="mb-6 flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.iconBg} ${step.iconColor}`}>
                  {step.icon}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ff6b4a]">Step {step.number}</span>
                  <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">{step.title}</h2>
                </div>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#8b8b9e] md:text-base">{step.description}</p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {step.details.map((d, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-[#8b8b9e]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b4a]/50" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.04] bg-gradient-to-b from-white/[0.025] to-transparent p-12 text-center md:p-20">
            <div className="shimmer absolute inset-0 rounded-[1.5rem]" />
            <div className="relative z-10 grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: "500+", label: "Businesses" },
                { value: "50K+", label: "Reviews Managed" },
                { value: "4.8x", label: "Faster Replies" },
                { value: "32%", label: "More Return Visits" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-bold tracking-tight gradient-text md:text-4xl">{s.value}</p>
                  <p className="mt-2 text-xs tracking-wide text-[#4a4a5e]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent p-14 md:p-20">
            <div className="shimmer absolute inset-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[400px] rounded-full bg-[#ff6b4a]/[0.06] blur-[100px]" />
            <div className="relative z-10">
              <Bell className="mx-auto mb-6 h-10 w-10 text-[#ff6b4a]" />
              <h2 className="mb-4 font-display text-display-sm">Ready to take control?</h2>
              <p className="mb-8 text-[15px] text-[#8b8b9e]">Join 500+ businesses already using ReviewPulse.</p>
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-[15px]">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-5 text-[13px] text-[#4a4a5e]">Free forever. No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="gradient-line" />
      <footer className="py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="font-display text-sm font-bold">ReviewPulse</span>
          </Link>
          <div className="flex gap-6 text-[13px] text-[#8b8b9e]">
            <Link href="/how-it-works" className="transition hover:text-white">How It Works</Link>
            <Link href="/faq" className="transition hover:text-white">FAQ</Link>
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
          </div>
          <p className="text-[11px] text-[#4a4a5e]">&copy; {new Date().getFullYear()} ReviewPulse</p>
        </div>
      </footer>
    </div>
  );
}
