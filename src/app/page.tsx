import Link from "next/link";
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
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background mesh */}
      <div className="mesh-gradient left-[-20%] top-[-10%] h-[600px] w-[600px] bg-orange-500/8 animate-glow" />
      <div className="mesh-gradient right-[-10%] top-[20%] h-[500px] w-[500px] bg-violet-500/6 animate-glow" />
      <div className="mesh-gradient left-[30%] top-[60%] h-[400px] w-[400px] bg-amber-500/5" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">ReviewPulse</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-zinc-400 transition hover:text-white">Features</a>
            <a href="#pricing" className="text-sm text-zinc-400 transition hover:text-white">Pricing</a>
            <Link href="/how-it-works" className="text-sm text-zinc-400 transition hover:text-white">How It Works</Link>
            <Link href="/blog" className="text-sm text-zinc-400 transition hover:text-white">Blog</Link>
            <Link href="/login" className="text-sm text-zinc-400 transition hover:text-white">Log In</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2.5 text-sm">
              Get Started Free
            </Link>
          </div>
          <Link href="/signup" className="btn-primary rounded-xl px-4 py-2 text-sm md:hidden">
            Start Free
          </Link>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 badge text-orange-400 border-orange-500/20 bg-orange-500/5">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 500+ local businesses
          </div>

          <h1 className="mx-auto mb-8 max-w-4xl font-display text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
            Every review.
            <br />
            <span className="gradient-text">One dashboard.</span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            Pull in reviews from Google, Yelp, and Facebook automatically.
            Respond with AI in seconds. Track sentiment over time. Never let
            a review slip through the cracks.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base"
            >
              Start Free — No Card Needed <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="btn-ghost inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base"
            >
              See How It Works
            </Link>
          </div>

          {/* Mini stats row */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-orange-400" /> 2-min setup</span>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-orange-400" /> SOC 2 compliant</span>
            <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-orange-400" /> 3 platforms</span>
          </div>
        </div>
      </section>

      {/* ═══ Bento Features ═══ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">Features</p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Stop tab-hopping.<br />
              <span className="text-zinc-500">Start managing.</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {/* Large — spans 2 cols */}
            <div className="bento p-8 md:col-span-2 md:row-span-1">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10">
                <MessageSquare className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold">Unified Review Inbox</h3>
              <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                Google, Yelp, and Facebook reviews stream into one feed.
                Filter by platform, rating, sentiment, or response status.
                No more switching between three dashboards.
              </p>
              {/* Mini UI preview */}
              <div className="mt-6 flex gap-2">
                {["Google", "Yelp", "Facebook"].map((p) => (
                  <span key={p} className="badge text-xs text-zinc-400">{p}</span>
                ))}
              </div>
            </div>

            {/* Tall — spans 2 rows */}
            <div className="bento flex flex-col justify-between p-8 md:row-span-2">
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10">
                  <Zap className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold">AI Responses</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  One click generates a personalized, tone-aware reply draft.
                  Adjust for professional, friendly, or apologetic tone.
                  Save your best replies as reusable templates.
                </p>
              </div>
              <div className="mt-8 space-y-2">
                {["Professional", "Friendly", "Apologetic"].map((tone) => (
                  <div key={tone} className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-400 border border-white/5">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    {tone} tone
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom left */}
            <div className="bento p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold">Sentiment Analytics</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Real-time sentiment breakdown across all platforms. Spot
                trends before they escalate.
              </p>
              {/* Mini chart */}
              <div className="mt-5 flex items-end gap-1.5">
                {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
                  <div key={i} className="w-full rounded-md bg-emerald-500/20" style={{ height: `${h * 0.5}px` }} />
                ))}
              </div>
            </div>

            {/* Bottom center */}
            <div className="bento p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                <Bell className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold">Instant Alerts</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                New review? You know within minutes. Respond while it
                matters — fast replies drive 4x more return visits.
              </p>
              <div className="mt-5 glass rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    G
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-zinc-300">New 5-star review</p>
                    <p className="text-zinc-500">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Social Proof ═══ */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass rounded-3xl p-10 text-center md:p-16">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-10">
              {[
                { label: "500+", sub: "Businesses" },
                { label: "50K+", sub: "Reviews Managed" },
                { label: "4.8x", sub: "Faster Replies" },
                { label: "32%", sub: "More Return Visits" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-bold gradient-text">{stat.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{stat.sub}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-500">
              <span className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-yellow-500" /> Google Reviews</span>
              <span className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-red-500" /> Yelp Reviews</span>
              <span className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-blue-500" /> Facebook Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section id="testimonials" className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">Testimonials</p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Businesses love <span className="gradient-text">ReviewPulse</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                quote: "We went from spending 3 hours a week on reviews to 15 minutes. The AI responses are shockingly good.",
                name: "Maria C.",
                role: "Bella's Italian Kitchen",
              },
              {
                quote: "Our Google rating went from 3.6 to 4.4 in four months. ReviewPulse made responding to every review possible.",
                name: "James T.",
                role: "Precision Auto Care",
              },
              {
                quote: "I manage 8 locations. I catch every negative review within minutes now and my team responds fast.",
                name: "Sarah K.",
                role: "FreshFit Dental",
              },
            ].map((t, i) => (
              <div key={i} className="bento p-8">
                <div className="mb-4 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <Quote className="mb-3 h-5 w-5 text-zinc-700" />
                <p className="mb-6 text-sm leading-relaxed text-zinc-300">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">Pricing</p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-zinc-400">Start free. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free */}
            <div className="bento p-8">
              <p className="mb-1 text-sm font-medium text-zinc-400">Free</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">$0</span>
                <span className="text-zinc-500">/mo</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-zinc-300">
                {["Google Reviews", "10 reviews tracked", "5 AI responses / month", "Weekly email digest"].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-zinc-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-ghost block w-full rounded-2xl py-3.5 text-center text-sm">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bento border-orange-500/20 p-8">
              <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
              <p className="mb-1 text-sm font-medium text-orange-400">Pro</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">$49</span>
                <span className="text-zinc-500">/mo</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-zinc-300">
                {["Google, Yelp & Facebook", "Unlimited reviews", "Unlimited AI responses", "Instant email alerts", "Sentiment analytics", "Response templates"].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-orange-400" /> {f}
                  </li>
                ))}
              </ul>
              <button className="btn-primary block w-full rounded-2xl py-3.5 text-sm">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glass rounded-[2rem] p-12 md:p-16">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              Your reputation can&apos;t wait
            </h2>
            <p className="mb-8 text-zinc-400">
              Every unanswered review is a customer lost. Set up ReviewPulse
              in under 2 minutes.
            </p>
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                  <MessageSquare className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-display text-sm font-bold">ReviewPulse</span>
              </Link>
              <p className="text-sm text-zinc-500">
                Review management for<br />local businesses.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#features" className="transition hover:text-white">Features</a></li>
                <li><a href="#pricing" className="transition hover:text-white">Pricing</a></li>
                <li><Link href="/how-it-works" className="transition hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/blog" className="transition hover:text-white">Blog</Link></li>
                <li><Link href="/faq" className="transition hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Account</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/signup" className="transition hover:text-white">Sign Up</Link></li>
                <li><Link href="/login" className="transition hover:text-white">Log In</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
            <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} ReviewPulse</p>
            <div className="flex gap-6 text-xs text-zinc-600">
              <a href="#" className="transition hover:text-white">Privacy</a>
              <a href="#" className="transition hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
