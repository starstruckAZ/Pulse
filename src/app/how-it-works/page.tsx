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
    icon: <Link2 className="h-8 w-8" />,
    color: "bg-orange-500/10 text-orange-400",
    title: "Connect Your Profiles",
    description: "Link your Google Business Profile, Yelp, and Facebook pages in a few clicks. We securely pull in your reviews automatically.",
    details: ["One-click Google Business Profile connection", "Secure OAuth — we never store passwords", "Add multiple business locations", "Historical reviews imported automatically"],
  },
  {
    number: "02",
    icon: <BarChart3 className="h-8 w-8" />,
    color: "bg-violet-500/10 text-violet-400",
    title: "Monitor & Analyze",
    description: "Every review appears in your unified dashboard. AI analyzes sentiment so you can spot trends before they escalate.",
    details: ["Real-time review notifications", "AI-powered sentiment analysis", "Rating trends and analytics over time", "Filter by platform, rating, or sentiment"],
  },
  {
    number: "03",
    icon: <Zap className="h-8 w-8" />,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Respond in Seconds",
    description: "Generate professional, personalized responses with one click. Customize tone and details, then post. Save your best replies as templates.",
    details: ["AI-generated drafts tailored to each review", "Adjust tone: professional, friendly, apologetic", "Save and reuse response templates", "Track which reviews you've responded to"],
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
      <div className="mesh-gradient left-[-10%] top-[10%] h-[500px] w-[500px] bg-orange-500/8 animate-glow" />
      <div className="mesh-gradient right-[-10%] top-[40%] h-[400px] w-[400px] bg-violet-500/6" />

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
            <Link href="/#features" className="text-sm text-zinc-400 transition hover:text-white">Features</Link>
            <Link href="/#pricing" className="text-sm text-zinc-400 transition hover:text-white">Pricing</Link>
            <Link href="/blog" className="text-sm text-zinc-400 transition hover:text-white">Blog</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2.5 text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-28">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 inline-flex badge text-orange-400 border-orange-500/20 bg-orange-500/5">
            <Sparkles className="h-3.5 w-3.5" /> 3 simple steps
          </div>
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-6xl">
            How <span className="gradient-text">ReviewPulse</span> works
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Go from scattered reviews to a single AI-powered dashboard in under 2 minutes.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6 space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="bento p-8 md:p-10">
              <div className="mb-6 flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
                  {step.icon}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Step {step.number}</span>
                  <h2 className="font-display text-2xl font-bold">{step.title}</h2>
                </div>
              </div>
              <p className="mb-6 text-zinc-400 leading-relaxed">{step.description}</p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {step.details.map((d, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/60" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass rounded-3xl p-10 text-center md:p-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: "500+", label: "Businesses" },
                { value: "50K+", label: "Reviews Managed" },
                { value: "4.8x", label: "Faster Replies" },
                { value: "32%", label: "More Return Visits" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-bold gradient-text">{s.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glass rounded-[2rem] p-12 md:p-16">
            <Bell className="mx-auto mb-6 h-12 w-12 text-orange-400" />
            <h2 className="mb-4 font-display text-3xl font-bold">Ready to take control?</h2>
            <p className="mb-8 text-zinc-400">Join 500+ businesses already using ReviewPulse.</p>
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-zinc-600">Free forever. No credit card required.</p>
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
