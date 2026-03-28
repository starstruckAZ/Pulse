import Link from "next/link";
import {
  Star,
  MessageSquare,
  TrendingUp,
  Bell,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-500" />
            <span className="text-lg font-bold tracking-tight">ReviewPulse</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-400 transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-400 transition hover:text-white">
              Pricing
            </a>
            <Link
              href="/signup"
              className="btn-glow rounded-lg px-4 py-2 text-sm font-medium text-white"
            >
              Get Started Free
            </Link>
          </div>
          <Link
            href="/signup"
            className="btn-glow rounded-lg px-4 py-2 text-sm font-medium text-white md:hidden"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute right-1/4 top-20 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400">
            <Star className="h-3.5 w-3.5" />
            Trusted by 500+ local businesses
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl md:leading-tight">
            See Every Review.{" "}
            <span className="gradient-text">Reply in Seconds.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
            Google, Yelp, Facebook — all your reviews in one dashboard. AI-powered
            responses. Sentiment tracking. Never miss a review again.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="btn-glow inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-base font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
            >
              See How It Works
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Free forever plan. No credit card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">manage your reputation</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-400">
              Stop switching between platforms. Stop missing reviews. Stop losing
              customers over bad responses.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="All Reviews in One Place"
              description="Google, Yelp, and Facebook reviews aggregated into a single dashboard. No more tab-hopping."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="AI-Powered Responses"
              description="Generate professional, personalized reply drafts in one click. Adjust tone, length, and specifics instantly."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Sentiment Tracking"
              description="See how customers feel at a glance with real-time sentiment analysis. Spot trends before they become problems."
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Instant Alerts"
              description="Get notified the moment a new review comes in. Respond fast — reviewers who get replies are 4x more likely to return."
            />
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-6 text-sm font-medium uppercase tracking-widest text-gray-500">
            Local businesses use ReviewPulse to manage
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500">
            <span className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" /> Google Reviews
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-5 w-5 text-red-500" /> Yelp Reviews
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" /> Facebook Reviews
            </span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Simple, honest{" "}
              <span className="gradient-text">pricing</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-400">
              Start free. Upgrade when you&apos;re ready. No tricks, no hidden fees.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="glow-card rounded-2xl p-8 transition">
              <div className="mb-6">
                <h3 className="mb-1 text-xl font-semibold">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <CheckIcon /> Google Reviews
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> 10 reviews tracked
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> 5 AI responses / month
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> Weekly email digest
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-xl border border-white/10 py-3 text-center text-sm font-semibold transition hover:bg-white/5"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative glow-card rounded-2xl p-8 transition">
              <div className="absolute -top-3 right-6 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="mb-1 text-xl font-semibold">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <CheckIcon /> Google, Yelp & Facebook
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> Unlimited reviews
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> Unlimited AI responses
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> Instant email alerts
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> Sentiment analytics
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon /> Response templates
                </li>
              </ul>
              <button className="btn-glow block w-full rounded-xl py-3 text-sm font-semibold text-white">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glow-card rounded-3xl p-12">
            <Shield className="mx-auto mb-6 h-12 w-12 text-indigo-500" />
            <h2 className="mb-4 text-3xl font-bold">
              Start protecting your reputation today
            </h2>
            <p className="mb-8 text-gray-400">
              Every unanswered review is a missed opportunity. Set up ReviewPulse
              in under 2 minutes and never miss another one.
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
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-semibold">ReviewPulse</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="transition hover:text-white">
                Privacy
              </a>
              <a href="#" className="transition hover:text-white">
                Terms
              </a>
              <a href="#" className="transition hover:text-white">
                Contact
              </a>
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glow-card group rounded-2xl p-8 transition">
      <div className="mb-4 inline-flex rounded-xl bg-indigo-500/10 p-3 text-indigo-400 transition group-hover:bg-indigo-500/20">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
