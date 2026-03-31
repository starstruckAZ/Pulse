import Link from "next/link";
import PricingToggle from "./pricing-toggle";
import HomepageSearch from "./homepage-search";
import {
  Star, MessageSquare, Bell, ArrowRight,
  Shield, Globe, Clock, ChevronRight, Layers, BarChart3, Search,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#e1dcd8] bg-[rgba(250,245,242,0.85)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-0 h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold tracking-tight text-primary">ReviewHype</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/search" className="text-[13px] font-medium text-[#5d5b59] transition hover:text-[#302e2d] inline-flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />Search
            </Link>
            <Link href="/discover" className="text-[13px] font-medium text-[#5d5b59] transition hover:text-[#302e2d]">Discover</Link>
            <a href="#features" className="text-[13px] font-medium text-[#5d5b59] transition hover:text-[#302e2d]">Features</a>
            <a href="#pricing" className="text-[13px] font-medium text-[#5d5b59] transition hover:text-[#302e2d]">Pricing</a>
            <Link href="/blog" className="text-[13px] font-medium text-[#5d5b59] transition hover:text-[#302e2d]">Blog</Link>
            <Link href="/login" className="text-[13px] font-medium text-[#5d5b59] transition hover:text-[#302e2d]">Log In</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2.5 text-[13px]">
              Get Started Free
            </Link>
          </div>
          <Link href="/signup" className="btn-primary rounded-xl px-4 py-2 text-[13px] md:hidden">
            Start Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-44 pb-28 md:pt-52 md:pb-40">
        <div className="mx-auto max-w-7xl px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#e1dcd8] bg-[#f5f0ed] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#aa2c32]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#5d5b59]">Trusted by 500+ local businesses</span>
              <ChevronRight className="h-3 w-3 text-[#797674]" />
            </div>

            <h1 className="font-headline mb-6 text-6xl font-extrabold tracking-tight leading-[0.95] text-[#302e2d] md:text-7xl lg:text-8xl">
              Find &amp; manage{" "}
              <span className="italic text-[#aa2c32]">your reviews.</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#5d5b59]">
              Search any business. Claim yours. Pull in reviews from Google, Yelp,
              and Facebook — all in one dashboard.
            </p>

            {/* Search bar */}
            <HomepageSearch />

            {/* Trust signals */}
            <div className="mt-14 flex flex-wrap items-center gap-8 text-[13px] text-[#797674]">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#aa2c32]/50" /> 2-min setup</span>
              <span className="h-3 w-px bg-[#e1dcd8]" />
              <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#40606d]/50" /> SOC 2 compliant</span>
              <span className="h-3 w-px bg-[#e1dcd8]" />
              <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#735801]/50" /> 3 platforms</span>
            </div>
          </div>

          {/* Asymmetric score badge (editorial style) */}
          <div className="pointer-events-none absolute right-12 top-40 hidden lg:block">
            <div className="rotate-2 rounded-2xl bg-[#f9d377] p-8 shadow-xl">
              <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-[#5f4800]">Pulse Score</p>
              <p className="font-headline text-7xl font-extrabold leading-none text-[#735801]">4.8</p>
              <div className="mt-3 flex justify-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-[#735801] text-[#735801]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* ── Features ── */}
      <section id="features" className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-20 max-w-2xl">
            <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#aa2c32]">
              <Layers className="h-3.5 w-3.5" />
              Features
            </p>
            <h2 className="font-headline text-5xl font-bold tracking-tight text-[#302e2d] md:text-6xl">
              Stop tab-hopping.<br />
              <span className="italic text-[#5d5b59]">Start managing.</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {/* Large — spans 2 cols */}
            <div className="bento p-8 md:col-span-2 md:p-10">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#aa2c32]/10">
                <MessageSquare className="h-5 w-5 text-[#aa2c32]" />
              </div>
              <h3 className="mb-3 font-headline text-2xl font-bold text-[#302e2d]">Unified Review Inbox</h3>
              <p className="max-w-lg text-sm leading-relaxed text-[#5d5b59]">
                Google, Yelp, and Facebook reviews stream into one feed.
                Filter by platform, rating, sentiment, or response status.
              </p>
              <div className="mt-8 flex gap-2">
                {[
                  { label: "Google", color: "bg-blue-100 text-blue-700" },
                  { label: "Yelp",   color: "bg-red-100 text-red-700" },
                  { label: "Facebook", color: "bg-indigo-100 text-indigo-700" },
                ].map(({ label, color }) => (
                  <span key={label} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${color}`}>{label}</span>
                ))}
              </div>
            </div>

            {/* Tall — spans 2 rows */}
            <div className="bento flex flex-col justify-between p-8 md:row-span-2 md:p-10">
              <div>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f9d377]/60">
                  <Search className="h-5 w-5 text-[#735801]" />
                </div>
                <h3 className="mb-3 font-headline text-2xl font-bold text-[#302e2d]">Business Search</h3>
                <p className="text-sm leading-relaxed text-[#5d5b59]">
                  Search for any business by name or location. See Google ratings
                  at a glance. Claim your business in one click to start managing reviews.
                </p>
              </div>
              <div className="mt-8 space-y-2">
                {[
                  { step: "Search", desc: "Find any business", bg: "bg-[#aa2c32]/8", text: "text-[#aa2c32]" },
                  { step: "Verify", desc: "Sign in with Google", bg: "bg-[#40606d]/8", text: "text-[#40606d]" },
                  { step: "Claim",  desc: "Start managing reviews", bg: "bg-[#735801]/8", text: "text-[#735801]" },
                ].map(({ step, desc, bg, text }) => (
                  <div key={step} className={`flex items-center gap-3 rounded-lg ${bg} px-4 py-3 text-[13px] font-medium ${text}`}>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
                    <span className="font-bold">{step}</span> — {desc}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom left */}
            <div className="bento p-8 md:p-10">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#ccedfe]/60">
                <BarChart3 className="h-5 w-5 text-[#40606d]" />
              </div>
              <h3 className="mb-3 font-headline text-2xl font-bold text-[#302e2d]">Sentiment Analytics</h3>
              <p className="text-sm leading-relaxed text-[#5d5b59]">
                Real-time sentiment breakdown. Spot trends before they escalate.
              </p>
              <div className="mt-6 flex items-end gap-1 h-12">
                {[40, 65, 35, 80, 55, 72, 90, 60, 85].map((h, i) => (
                  <div key={i} className="w-full rounded-sm bg-gradient-to-t from-[#40606d]/30 to-[#40606d]/60"
                    style={{ height: `${h * 0.48}px` }} />
                ))}
              </div>
            </div>

            {/* Bottom center */}
            <div className="bento p-8 md:p-10">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f9d377]/60">
                <Bell className="h-5 w-5 text-[#735801]" />
              </div>
              <h3 className="mb-3 font-headline text-2xl font-bold text-[#302e2d]">Instant Alerts</h3>
              <p className="text-sm leading-relaxed text-[#5d5b59]">
                New review? You know within minutes. Fast replies drive 4× more return visits.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#e1dcd8] bg-[#f5f0ed] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">G</div>
                <div>
                  <p className="text-xs font-semibold text-[#302e2d]">New 5-star review</p>
                  <p className="text-xs text-[#797674]">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#f5f0ed] py-20">
        <div className="mx-auto max-w-5xl px-8">
          <div className="flex flex-wrap items-center justify-center gap-16 md:gap-24">
            {[
              { label: "500+",  sub: "Businesses" },
              { label: "50K+",  sub: "Reviews Managed" },
              { label: "4.8×",  sub: "Faster Replies" },
              { label: "32%",   sub: "More Return Visits" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-headline text-4xl font-extrabold text-[#aa2c32] md:text-5xl">{stat.label}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#797674]">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* ── Testimonials ── */}
      <section className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-20">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#aa2c32]">Testimonials</p>
            <h2 className="font-headline text-5xl font-bold tracking-tight text-[#302e2d] md:text-6xl">
              Businesses love <span className="italic text-[#aa2c32]">ReviewHype</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "We went from spending 3 hours a week on reviews to 15 minutes. Having everything in one place changed the game.",
                name: "Maria C.",
                role: "Bella's Italian Kitchen",
                accentBg: "bg-[#aa2c32]/8",
                accentText: "text-[#aa2c32]",
              },
              {
                quote: "Our Google rating went from 3.6 to 4.4 in four months. ReviewHype made responding to every review possible.",
                name: "James T.",
                role: "Precision Auto Care",
                accentBg: "bg-[#40606d]/8",
                accentText: "text-[#40606d]",
              },
              {
                quote: "I manage 8 locations. I catch every negative review within minutes and my team responds fast.",
                name: "Sarah K.",
                role: "FreshFit Dental",
                accentBg: "bg-[#735801]/8",
                accentText: "text-[#735801]",
              },
            ].map((t, i) => (
              <div key={i} className="bento p-8 md:p-10">
                <div className="mb-4 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-[#735801] text-[#735801]" />
                  ))}
                </div>
                <p className="font-headline mb-6 text-xl font-medium italic leading-snug text-[#302e2d]">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.accentBg} text-sm font-bold ${t.accentText}`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#302e2d]">{t.name}</p>
                    <p className="text-xs text-[#797674]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pulse quote */}
          <div className="mt-12 rounded-2xl bg-[#f9d377] p-12 md:p-16 relative overflow-hidden">
            <span className="absolute -top-4 -left-2 font-headline text-[160px] font-extrabold leading-none text-[#735801]/10 select-none">&ldquo;</span>
            <blockquote className="relative z-10 max-w-3xl">
              <p className="font-headline text-3xl font-bold italic leading-tight text-[#302e2d] md:text-4xl">
                ReviewHype isn&apos;t just a dashboard — it&apos;s the difference between a business that listens and one that doesn&apos;t.
              </p>
              <p className="mt-6 text-sm font-bold text-[#735801]">— Sarah K., Multi-location Practice Owner</p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-[#f5f0ed] py-28 md:py-36">
        <div className="mx-auto max-w-4xl px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#aa2c32]">Pricing</p>
            <h2 className="font-headline text-5xl font-bold tracking-tight text-[#302e2d] md:text-6xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-5 text-base text-[#5d5b59]">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <PricingToggle />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 md:py-36">
        <div className="mx-auto max-w-4xl px-8 text-center">
          <div className="rounded-2xl bg-[#ece7e4] p-14 md:p-20 relative overflow-hidden border border-[#e1dcd8]">
            <span className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(170,44,50,0.06) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#aa2c32] to-[#ff7574] shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-headline mb-5 text-5xl font-extrabold tracking-tight text-[#302e2d] md:text-6xl">
                Your reputation<br />can&apos;t wait
              </h2>
              <p className="mb-10 text-base text-[#5d5b59]">
                Every unanswered review is a customer lost. Set up ReviewHype in under 2 minutes.
              </p>
              <Link href="/search" className="btn-primary inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-[15px]">
                Search Your Business <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e1dcd8] bg-[#f5f0ed] py-16">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-5 block font-headline text-xl font-bold italic text-[#302e2d]">
                ReviewHype.
              </Link>
              <p className="text-sm leading-relaxed text-[#797674]">
                Review management for<br />local businesses.
              </p>
            </div>
            <div>
              <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#302e2d]">Product</h4>
              <ul className="space-y-3 text-sm text-[#797674]">
                <li><a href="#features" className="transition hover:text-[#302e2d]">Features</a></li>
                <li><a href="#pricing" className="transition hover:text-[#302e2d]">Pricing</a></li>
                <li><Link href="/how-it-works" className="transition hover:text-[#302e2d]">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#302e2d]">Resources</h4>
              <ul className="space-y-3 text-sm text-[#797674]">
                <li><Link href="/search" className="transition hover:text-[#302e2d]">Search Businesses</Link></li>
                <li><Link href="/discover" className="transition hover:text-[#302e2d]">Business Directory</Link></li>
                <li><Link href="/blog" className="transition hover:text-[#302e2d]">Blog</Link></li>
                <li><Link href="/faq" className="transition hover:text-[#302e2d]">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#302e2d]">Account & Legal</h4>
              <ul className="space-y-3 text-sm text-[#797674]">
                <li><Link href="/signup" className="transition hover:text-[#302e2d]">Sign Up</Link></li>
                <li><Link href="/login" className="transition hover:text-[#302e2d]">Log In</Link></li>
                <li><Link href="/privacy" className="transition hover:text-[#302e2d]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="transition hover:text-[#302e2d]">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e1dcd8] pt-8 md:flex-row">
            <p className="text-xs text-[#b0acaa]">&copy; {new Date().getFullYear()} ReviewHype. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-[#b0acaa]">
              <Link href="/privacy" className="transition hover:text-[#302e2d]">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-[#302e2d]">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
