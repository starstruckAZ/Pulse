"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  LogOut,
  Settings,
  LayoutDashboard,
  BarChart3,
  MapPin,
  FileText,
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: string;
  business_name?: string;
  full_name?: string;
  plan?: string;
}

interface UpgradeClientProps {
  user: { id: string; email?: string };
  profile: Profile | null;
}

const FREE_FEATURES = [
  { name: "Locations", free: "1", pro: "Unlimited" },
  { name: "Review monitoring", free: "50/mo", pro: "Unlimited" },
  { name: "AI response suggestions", free: "10/mo", pro: "Unlimited" },
  { name: "Response templates", free: "3", pro: "Unlimited" },
  { name: "Analytics dashboard", free: "Basic", pro: "Advanced" },
  { name: "Sentiment analysis", free: false, pro: true },
  { name: "Competitor benchmarking", free: false, pro: true },
  { name: "Custom review widgets", free: false, pro: true },
  { name: "Priority support", free: false, pro: true },
  { name: "Export reports (CSV/PDF)", free: false, pro: true },
  { name: "Webhook integrations", free: false, pro: true },
  { name: "White-label responses", free: false, pro: true },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. You can cancel your Pro subscription at any time from your Stripe billing portal. Your Pro features will remain active until the end of your current billing period.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is never deleted. If you downgrade to Free, you'll retain access to all your reviews and history. Some advanced features like sentiment analysis and competitor benchmarking will become read-only.",
  },
  {
    q: "Is there a free trial?",
    a: "We don't currently offer a free trial, but the Free plan gives you a solid taste of what ReviewPulse can do. Upgrade when you're ready to unlock the full power.",
  },
];

export default function UpgradeClient({ user, profile }: UpgradeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const plan = profile?.plan || "free";
  const isPro = plan === "pro";
  const displayName =
    profile?.business_name || profile?.full_name || user.email || "User";

  useEffect(() => {
    const upgrade = searchParams.get("upgrade");
    if (upgrade === "success") {
      setToast("Welcome to Pro! Your account has been upgraded.");
    } else if (upgrade === "cancelled") {
      setToast("Upgrade cancelled. No charges were made.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setToast("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div
            className={`rounded-2xl px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${
              toast.includes("cancelled") || toast.includes("wrong")
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            }`}
          >
            {toast}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display hidden sm:inline">ReviewPulse</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </Link>
              <Link
                href="/dashboard/locations"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <MapPin className="h-3.5 w-3.5" /> Locations
              </Link>
              <Link
                href="/dashboard/templates"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <FileText className="h-3.5 w-3.5" /> Templates
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <span className="badge text-orange-400 border-orange-500/20 bg-orange-500/5 text-xs hidden sm:inline-flex">
                Free Plan
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm transition hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-white/5 mb-1">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">
              {isPro ? "You're on Pro" : "Upgrade to Pro"}
            </h1>
            <p className="text-sm text-zinc-500">
              {isPro
                ? "You have access to all ReviewPulse features."
                : "Unlock the full power of ReviewPulse for your business."}
            </p>
          </div>
          <div className="flex gap-2 md:hidden">
            <Link
              href="/dashboard"
              className="btn-ghost rounded-xl p-2"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/analytics"
              className="btn-ghost rounded-xl p-2"
            >
              <BarChart3 className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/settings"
              className="btn-ghost rounded-xl p-2"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {isPro ? (
          /* Already Pro */
          <div className="bento p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <Crown className="h-8 w-8 text-orange-400" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">
              You&apos;re a Pro member
            </h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
              You have full access to all ReviewPulse features. Manage your
              subscription and billing details through the Stripe portal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm"
              >
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                className="btn-ghost inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-6 py-3 text-sm"
              >
                <Settings className="h-4 w-4" /> Manage Settings
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Pricing Hero */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Free Plan Card */}
              <div className="bento p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-500/10">
                    <Zap className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold">Free</h2>
                    <p className="text-xs text-zinc-500">Current plan</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="font-display text-3xl font-bold">$0</span>
                  <span className="text-sm text-zinc-500">/month</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {FREE_FEATURES.slice(0, 5).map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center gap-2 text-sm text-zinc-400"
                    >
                      <Check className="h-4 w-4 shrink-0 text-zinc-600" />
                      {f.name}: {typeof f.free === "string" ? f.free : ""}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="btn-ghost w-full rounded-2xl border border-zinc-700 py-3 text-sm opacity-60 cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>

              {/* Pro Plan Card */}
              <div className="bento relative overflow-hidden p-6 border-orange-500/20">
                {/* Glow effect */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#ff3d71]/10 to-[#ff6b4a]/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                      <Sparkles className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold">Pro</h2>
                      <p className="text-xs text-orange-400">Recommended</p>
                    </div>
                    <span className="badge ml-auto text-xs text-orange-400 border-orange-500/20 bg-orange-500/10">
                      Popular
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="font-display text-3xl font-bold gradient-text">
                      $49
                    </span>
                    <span className="text-sm text-zinc-500">/month</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {FREE_FEATURES.slice(0, 5).map((f) => (
                      <li
                        key={f.name}
                        className="flex items-center gap-2 text-sm text-zinc-300"
                      >
                        <Check className="h-4 w-4 shrink-0 text-orange-400" />
                        {f.name}: {typeof f.pro === "string" ? f.pro : ""}
                      </li>
                    ))}
                    {FREE_FEATURES.slice(5).map((f) => (
                      <li
                        key={f.name}
                        className="flex items-center gap-2 text-sm text-zinc-300"
                      >
                        <Check className="h-4 w-4 shrink-0 text-orange-400" />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="btn-primary w-full rounded-2xl py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Upgrade to Pro — $49/mo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="bento mb-8 overflow-hidden">
              <div className="p-6 pb-0">
                <h2 className="font-display text-lg font-bold mb-1">
                  Feature Comparison
                </h2>
                <p className="text-sm text-zinc-500 mb-4">
                  See everything that comes with Pro.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left font-medium text-zinc-400">
                        Feature
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-zinc-400">
                        Free
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-orange-400">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FREE_FEATURES.map((f, i) => (
                      <tr
                        key={f.name}
                        className={
                          i < FREE_FEATURES.length - 1
                            ? "border-b border-white/5"
                            : ""
                        }
                      >
                        <td className="px-6 py-3 text-zinc-300">{f.name}</td>
                        <td className="px-6 py-3 text-center">
                          {typeof f.free === "string" ? (
                            <span className="text-zinc-500">{f.free}</span>
                          ) : f.free ? (
                            <Check className="mx-auto h-4 w-4 text-zinc-500" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-zinc-700" />
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {typeof f.pro === "string" ? (
                            <span className="text-orange-400 font-medium">
                              {f.pro}
                            </span>
                          ) : f.pro ? (
                            <Check className="mx-auto h-4 w-4 text-orange-400" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-zinc-700" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bento p-6 mb-8">
              <h2 className="font-display text-lg font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/5 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                    >
                      {faq.q}
                      {openFaq === i ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mb-8">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Upgrade to Pro — $49/mo
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-zinc-600">
                Secure checkout powered by Stripe. Cancel anytime.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
