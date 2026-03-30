import Link from "next/link";
import PricingToggle from "./pricing-toggle";
import {
  Star,
  MessageSquare,
  Bell,
  ArrowRight,
  Zap,
  BarChart3,
  Quote,
  Sparkles,
  Shield,
  Globe,
  Clock,
  Check,
  ChevronRight,
  Layers,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Mesh blobs ── */}
      <div className="mesh-gradient left-[-15%] top-[-8%] h-[700px] w-[700px] bg-[#ff6b4a]/[0.07] animate-glow" />
      <div className="mesh-gradient right-[-8%] top-[15%] h-[600px] w-[600px] bg-[#6366f1]/[0.06] animate-glow" />
      <div className="mesh-gradient left-[40%] top-[55%] h-[500px] w-[500px] bg-[#2dd4bf]/[0.04] animate-float" />
      <div className="mesh-gradient right-[20%] bottom-[10%] h-[400px] w-[400px] bg-[#ff3d71]/[0.05] animate-glow" />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71] shadow-lg shadow-[#ff6b4a]/20">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">ReviewPulse</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Features</a>
            <a href="#pricing" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Pricing</a>
            <Link href="/how-it-works" className="text-[13px] text-[#8b8b9e] transition hover:text-white">How It Works</Link>
            <Link href="/blog" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Blog</Link>
            <Link href="/login" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Log In</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2 text-[13px]">
              Get Started Free
            </Link>
          </div>
          <Link href="/signup" className="btn-primary rounded-xl px-4 py-2 text-[13px] md:hidden">
            Start Free
          </Link>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-40 pb-28 md:pt-52 md:pb-40">
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-10 inline-flex items-center gap-2 badge border-[#ff6b4a]/15 bg-[#ff6b4a]/[0.04] text-[#ff6b4a]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Trusted by 500+ local businesses</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
          </div>

          {/* Headline */}
          <h1 className="mx-auto mb-8 max-w-4xl font-display text-display-lg md:text-display-xl">
            Every review.{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">One dashboard.</span>
          </h1>

          <p className="mx-auto mb-14 max-w-2xl text-base leading-relaxed text-[#8b8b9e] md:text-lg">
            Pull in reviews from Google, Yelp, and Facebook automatically.
            Respond with AI in seconds. Track sentiment over time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-[15px]"
            >
              Start Free — No Card Needed <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="btn-ghost inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-[15px]"
            >
              See How It Works
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-10 text-[13px] text-[#4a4a5e]">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#ff6b4a]/60" /> 2-min setup</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#6366f1]/60" /> SOC 2 compliant</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#2dd4bf]/60" /> 3 platforms</span>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="gradient-line" />

      {/* ═══ Bento Features ═══ */}
      <section id="features" className="relative py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-20 max-w-2xl">
            <p className="mb-4 flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.15em] text-[#ff6b4a]">
              <Layers className="h-3.5 w-3.5" />
              Features
            </p>
            <h2 className="font-display text-display-sm md:text-display-md">
              Stop tab-hopping.
              <br />
              <span className="text-[#4a4a5e]">Start managing.</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid gap-3 md:grid-cols-3 md:grid-rows-2">
            {/* Large — spans 2 cols */}
            <div className="bento p-8 md:p-10 md:col-span-2 md:row-span-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6b4a]/[0.08] ring-1 ring-[#ff6b4a]/15">
                <MessageSquare className="h-5 w-5 text-[#ff6b4a]" />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold tracking-tight">Unified Review Inbox</h3>
              <p className="max-w-lg text-sm leading-relaxed text-[#8b8b9e]">
                Google, Yelp, and Facebook reviews stream into one feed.
                Filter by platform, rating, sentiment, or response status.
              </p>
              <div className="mt-8 flex gap-2">
                {["Google", "Yelp", "Facebook"].map((p) => (
                  <span key={p} className="rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs text-[#8b8b9e] ring-1 ring-white/[0.06]">{p}</span>
                ))}
              </div>
            </div>

            {/* Tall — spans 2 rows */}
            <div className="bento flex flex-col justify-between p-8 md:p-10 md:row-span-2">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6366f1]/[0.08] ring-1 ring-[#6366f1]/15">
                  <Zap className="h-5 w-5 text-[#818cf8]" />
                </div>
                <h3 className="mb-3 font-display text-xl font-semibold tracking-tight">AI Responses</h3>
                <p className="text-sm leading-relaxed text-[#8b8b9e]">
                  One click generates a personalized, tone-aware reply draft.
                  Save your best replies as reusable templates.
                </p>
              </div>
              <div className="mt-8 space-y-2">
                {[
                  { tone: "Professional", color: "#6366f1" },
                  { tone: "Friendly", color: "#2dd4bf" },
                  { tone: "Apologetic", color: "#ff6b4a" },
                ].map(({ tone, color }) => (
                  <div key={tone} className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3 text-[13px] text-[#8b8b9e] ring-1 ring-white/[0.05]">
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                    {tone} tone
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom left */}
            <div className="bento p-8 md:p-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2dd4bf]/[0.08] ring-1 ring-[#2dd4bf]/15">
                <BarChart3 className="h-5 w-5 text-[#2dd4bf]" />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold tracking-tight">Sentiment Analytics</h3>
              <p className="text-sm leading-relaxed text-[#8b8b9e]">
                Real-time sentiment breakdown across all platforms. Spot
                trends before they escalate.
              </p>
              <div className="mt-6 flex items-end gap-1">
                {[40, 65, 35, 80, 55, 72, 90, 60, 85].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-sm bg-gradient-to-t from-[#2dd4bf]/20 to-[#2dd4bf]/40"
                    style={{ height: `${h * 0.5}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom center */}
            <div className="bento p-8 md:p-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f59e0b]/[0.08] ring-1 ring-[#f59e0b]/15">
                <Bell className="h-5 w-5 text-[#f59e0b]" />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold tracking-tight">Instant Alerts</h3>
              <p className="text-sm leading-relaxed text-[#8b8b9e]">
                New review? You know within minutes. Fast replies drive
                4x more return visits.
              </p>
              <div className="mt-6 rounded-xl bg-white/[0.02] p-3.5 ring-1 ring-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f59e0b]/[0.12] text-xs font-bold text-[#f59e0b]">
                    G
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-[#eeeef0]">New 5-star review</p>
                    <p className="text-[#4a4a5e]">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Social Proof ═══ */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.04] bg-gradient-to-b from-white/[0.025] to-transparent p-12 text-center md:p-20">
            {/* Shimmer overlay */}
            <div className="shimmer absolute inset-0 rounded-[1.5rem]" />
            <div className="relative z-10">
              <div className="mb-10 flex flex-wrap items-center justify-center gap-12 md:gap-16">
                {[
                  { label: "500+", sub: "Businesses" },
                  { label: "50K+", sub: "Reviews Managed" },
                  { label: "4.8x", sub: "Faster Replies" },
                  { label: "32%", sub: "More Return Visits" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-3xl font-bold tracking-tight gradient-text md:text-4xl">{stat.label}</p>
                    <p className="mt-2 text-xs text-[#4a4a5e] tracking-wide">{stat.sub}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 text-[#4a4a5e]">
                <span className="flex items-center gap-2 text-[13px]"><Star className="h-3.5 w-3.5 text-yellow-500/70" /> Google</span>
                <span className="flex items-center gap-2 text-[13px]"><Star className="h-3.5 w-3.5 text-red-500/70" /> Yelp</span>
                <span className="flex items-center gap-2 text-[13px]"><Star className="h-3.5 w-3.5 text-blue-500/70" /> Facebook</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="gradient-line" />

      {/* ═══ Testimonials ═══ */}
      <section id="testimonials" className="py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-20 text-center">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.15em] text-[#ff6b4a]">Testimonials</p>
            <h2 className="font-display text-display-sm md:text-display-md">
              Businesses love <span className="gradient-text">ReviewPulse</span>
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                quote: "We went from spending 3 hours a week on reviews to 15 minutes. The AI responses are shockingly good.",
                name: "Maria C.",
                role: "Bella's Italian Kitchen",
                accent: "#ff6b4a",
              },
              {
                quote: "Our Google rating went from 3.6 to 4.4 in four months. ReviewPulse made responding to every review possible.",
                name: "James T.",
                role: "Precision Auto Care",
                accent: "#6366f1",
              },
              {
                quote: "I manage 8 locations. I catch every negative review within minutes now and my team responds fast.",
                name: "Sarah K.",
                role: "FreshFit Dental",
                accent: "#2dd4bf",
              },
            ].map((t, i) => (
              <div key={i} className="bento p-8 md:p-10">
                <div className="mb-5 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-[#ff6b4a]/80 text-[#ff6b4a]/80" />
                  ))}
                </div>
                <Quote className="mb-4 h-5 w-5 text-white/[0.06]" />
                <p className="mb-8 text-sm leading-relaxed text-[#8b8b9e]">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: `${t.accent}12`, color: t.accent }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-[#4a4a5e]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-28 md:py-36">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-20 text-center">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.15em] text-[#ff6b4a]">Pricing</p>
            <h2 className="font-display text-display-sm md:text-display-md">
              Simple, transparent pricing
            </h2>
            <p className="mt-5 text-[15px] text-[#8b8b9e]">Start free. Upgrade when you&apos;re ready.</p>
          </div>

          <PricingToggle />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent p-14 md:p-20">
            <div className="shimmer absolute inset-0" />
            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[400px] rounded-full bg-[#ff6b4a]/[0.06] blur-[100px]" />
            <div className="relative z-10">
              <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71] shadow-lg shadow-[#ff6b4a]/20">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-5 font-display text-display-sm md:text-display-md">
                Your reputation<br />can&apos;t wait
              </h2>
              <p className="mb-10 text-[15px] text-[#8b8b9e]">
                Every unanswered review is a customer lost. Set up ReviewPulse
                in under 2 minutes.
              </p>
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-[15px]"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <div className="gradient-line" />
      <footer className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-5 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
                  <MessageSquare className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-display text-sm font-bold">ReviewPulse</span>
              </Link>
              <p className="text-[13px] leading-relaxed text-[#4a4a5e]">
                Review management for<br />local businesses.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a4a5e]">Product</h4>
              <ul className="space-y-2.5 text-[13px] text-[#8b8b9e]">
                <li><a href="#features" className="transition hover:text-white">Features</a></li>
                <li><a href="#pricing" className="transition hover:text-white">Pricing</a></li>
                <li><Link href="/how-it-works" className="transition hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a4a5e]">Resources</h4>
              <ul className="space-y-2.5 text-[13px] text-[#8b8b9e]">
                <li><Link href="/blog" className="transition hover:text-white">Blog</Link></li>
                <li><Link href="/faq" className="transition hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a4a5e]">Account</h4>
              <ul className="space-y-2.5 text-[13px] text-[#8b8b9e]">
                <li><Link href="/signup" className="transition hover:text-white">Sign Up</Link></li>
                <li><Link href="/login" className="transition hover:text-white">Log In</Link></li>
                <li><Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="transition hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-8 md:flex-row">
            <p className="text-[11px] text-[#4a4a5e]">&copy; {new Date().getFullYear()} ReviewPulse. All rights reserved.</p>
            <div className="flex gap-6 text-[11px] text-[#4a4a5e]">
              <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
