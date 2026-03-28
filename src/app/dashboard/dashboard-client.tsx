"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  LogOut,
  Link2,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  Minus,
  ThumbsDown,
} from "lucide-react";

interface Review {
  id: string;
  source: string;
  rating: number;
  reviewer_name: string | null;
  review_text: string | null;
  review_url: string | null;
  responded: boolean;
  sentiment: string;
  fetched_at: string;
}

interface DashboardClientProps {
  user: any;
  profile: any;
  locations: any[];
  reviews: Review[];
  avgRating: string;
  responseRate: number;
}

export default function DashboardClient({
  user,
  profile,
  locations,
  reviews,
  avgRating,
  responseRate,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const sourceIcon = (source: string) => {
    const map: Record<string, { label: string; color: string }> = {
      google: { label: "G", color: "bg-blue-500" },
      yelp: { label: "Y", color: "bg-red-500" },
      facebook: { label: "F", color: "bg-indigo-500" },
    };
    const s = map[source] || { label: "?", color: "bg-gray-500" };
    return (
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${s.color}`}
      >
        {s.label}
      </span>
    );
  };

  const sentimentBadge = (sentiment: string) => {
    const map: Record<string, { icon: React.ReactNode; color: string }> = {
      positive: {
        icon: <ThumbsUp className="h-3 w-3" />,
        color: "bg-green-500/15 text-green-400 border-green-500/20",
      },
      neutral: {
        icon: <Minus className="h-3 w-3" />,
        color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
      },
      negative: {
        icon: <ThumbsDown className="h-3 w-3" />,
        color: "bg-red-500/15 text-red-400 border-red-500/20",
      },
    };
    const s = map[sentiment] || map.neutral;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${s.color}`}
      >
        {s.icon} {sentiment}
      </span>
    );
  };

  const stars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  );

  const displayName =
    profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top Nav */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold"
            >
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              ReviewPulse
            </Link>
            <span className="hidden text-sm text-gray-500 md:inline">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            {plan === "free" && (
              <Link
                href="#"
                className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
              >
                ⚡ Upgrade to Pro
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition hover:bg-white/5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-400">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
                <span className="hidden md:inline">{displayName}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#1a1a2e] p-2 shadow-xl">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {displayName.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-400">
            Here&apos;s what&apos;s happening with your reviews.
          </p>
        </div>

        {/* Connect CTA */}
        {locations.length === 0 && (
          <div className="glow-card mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl p-8 sm:flex-row">
            <div>
              <h2 className="mb-1 text-lg font-semibold">
                Connect your Google Business Profile
              </h2>
              <p className="text-sm text-gray-400">
                Start pulling in reviews automatically. Takes 2 minutes.
              </p>
            </div>
            <button className="btn-glow inline-flex items-center gap-2 shrink-0 rounded-xl px-6 py-2.5 text-sm font-semibold text-white">
              <Link2 className="h-4 w-4" /> Connect Google
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={<Star className="h-5 w-5" />}
            label="Total Reviews"
            value={reviews.length.toString()}
            color="text-yellow-400"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Average Rating"
            value={avgRating}
            color="text-green-400"
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5" />}
            label="Response Rate"
            value={`${responseRate}%`}
            color="text-indigo-400"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="This Week"
            value="—"
            color="text-purple-400"
          />
        </div>

        {/* Reviews Table */}
        <div className="glow-card overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <h2 className="font-semibold">Recent Reviews</h2>
            {reviews.length > 0 && (
              <span className="text-sm text-gray-500">
                {reviews.length} total
              </span>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="py-20 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <h3 className="mb-1 text-lg font-medium text-gray-400">
                No reviews yet
              </h3>
              <p className="text-sm text-gray-500">
                Connect your Google Business Profile to start tracking reviews.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
                >
                  {sourceIcon(review.source)}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {review.reviewer_name || "Anonymous"}
                      </span>
                      {stars(review.rating)}
                      {sentimentBadge(review.sentiment)}
                      {review.responded && (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-400">
                      {review.review_text || "No text"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!review.responded && (
                      <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/5">
                        Reply
                      </button>
                    )}
                    {review.review_url && (
                      <a
                        href={review.review_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free plan banner */}
        {plan === "free" && (
          <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-center">
            <h3 className="mb-1 font-semibold">
              Unlock Yelp, Facebook & Unlimited AI Responses
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Upgrade to Pro for $49/mo and manage reviews from all platforms.
            </p>
            <button className="btn-glow rounded-xl px-6 py-2.5 text-sm font-semibold text-white">
              Upgrade to Pro <ChevronRight className="inline h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glow-card rounded-xl p-5 transition">
      <div className={`mb-3 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
