"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Star, TrendingUp, Clock, LogOut,
  BarChart3, MapPin, Settings, LayoutDashboard, FileText,
  ThumbsUp, Minus, ThumbsDown, Activity, ChevronDown,
} from "lucide-react";

interface Review {
  id: string;
  location_id: string;
  reviewer_name: string | null;
  review_text: string | null;
  rating: number;
  sentiment: string;
  source: string;
  status: string;
  created_at: string;
  fetched_at: string;
}

interface Profile {
  business_name?: string;
  full_name?: string;
  plan?: string;
}

interface Location {
  id: string;
  name: string;
}

interface AnalyticsClientProps {
  user: { email?: string };
  profile: Profile | null;
  locations: Location[];
  reviews: Review[];
}

type TimePeriod = "7d" | "30d" | "90d" | "all";

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

export default function AnalyticsClient({
  user, profile, locations, reviews,
}: AnalyticsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName = profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  // Filter reviews by time period
  const filteredReviews = useMemo(() => {
    if (timePeriod === "all") return reviews;
    const now = new Date();
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const cutoff = new Date(now.getTime() - daysMap[timePeriod] * 86400000);
    return reviews.filter((r) => new Date(r.fetched_at) >= cutoff);
  }, [reviews, timePeriod]);

  // Overview stats
  const stats = useMemo(() => {
    const total = filteredReviews.length;
    const avgRating = total > 0
      ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : "0.0";
    const respondedCount = filteredReviews.filter((r) => r.status === "responded").length;
    const responseRate = total > 0 ? Math.round((respondedCount / total) * 100) : 0;

    const sentimentScores: Record<string, number> = { positive: 1, neutral: 0, negative: -1 };
    const avgSentiment = total > 0
      ? filteredReviews.reduce((sum, r) => sum + (sentimentScores[r.sentiment] ?? 0), 0) / total
      : 0;

    return { total, avgRating, responseRate, avgSentiment };
  }, [filteredReviews]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach((r) => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    const maxCount = Math.max(...Object.values(counts), 1);
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      pct: filteredReviews.length > 0 ? Math.round((counts[star] / filteredReviews.length) * 100) : 0,
      barWidth: Math.round((counts[star] / maxCount) * 100),
    }));
  }, [filteredReviews]);

  // Sentiment breakdown
  const sentimentBreakdown = useMemo(() => {
    const counts: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    filteredReviews.forEach((r) => {
      if (counts[r.sentiment] !== undefined) counts[r.sentiment]++;
    });
    const total = filteredReviews.length || 1;
    return {
      positive: { count: counts.positive, pct: Math.round((counts.positive / total) * 100) },
      neutral: { count: counts.neutral, pct: Math.round((counts.neutral / total) * 100) },
      negative: { count: counts.negative, pct: Math.round((counts.negative / total) * 100) },
    };
  }, [filteredReviews]);

  // Reviews over time (weekly for 7d/30d, monthly for 90d/all)
  const reviewsOverTime = useMemo(() => {
    const useMonthly = timePeriod === "90d" || timePeriod === "all";

    const bucketKey = (dateStr: string) => {
      const d = new Date(dateStr);
      if (useMonthly) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
      // Weekly: use Monday of the week
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((day + 6) % 7));
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
    };

    const bucketLabel = (key: string) => {
      if (useMonthly) {
        const [y, m] = key.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
      }
      const d = new Date(key + "T00:00:00");
      return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    const buckets: Record<string, number> = {};
    filteredReviews.forEach((r) => {
      const key = bucketKey(r.fetched_at);
      buckets[key] = (buckets[key] || 0) + 1;
    });

    const sorted = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
    const maxCount = Math.max(...sorted.map(([, c]) => c), 1);

    return sorted.map(([key, count]) => ({
      label: bucketLabel(key),
      count,
      heightPct: Math.round((count / maxCount) * 100),
    }));
  }, [filteredReviews, timePeriod]);

  // Top sources
  const topSources = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReviews.forEach((r) => {
      counts[r.source] = (counts[r.source] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    const maxCount = Math.max(...sorted.map(([, c]) => c), 1);
    return sorted.map(([source, count]) => ({
      source,
      count,
      barWidth: Math.round((count / maxCount) * 100),
    }));
  }, [filteredReviews]);

  // Recent activity (last 10 from filtered)
  const recentActivity = useMemo(() => {
    return filteredReviews.slice(0, 10);
  }, [filteredReviews]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? "fill-orange-400 text-orange-400" : "text-zinc-700"}`} />
      ))}
    </div>
  );

  const sentimentBadge = (sentiment: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      positive: { icon: <ThumbsUp className="h-3 w-3" />, cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/8" },
      neutral: { icon: <Minus className="h-3 w-3" />, cls: "text-amber-400 border-amber-500/20 bg-amber-500/8" },
      negative: { icon: <ThumbsDown className="h-3 w-3" />, cls: "text-red-400 border-red-500/20 bg-red-500/8" },
    };
    const s = map[sentiment] || map.neutral;
    return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${s.cls}`}>{s.icon} {sentiment}</span>;
  };

  const sourceColors: Record<string, string> = {
    google: "from-blue-500 to-blue-600",
    yelp: "from-red-500 to-red-600",
    facebook: "from-indigo-500 to-indigo-600",
  };

  const sentimentScoreLabel = (score: number) => {
    if (score >= 0.5) return { label: "Very Positive", cls: "text-emerald-400" };
    if (score >= 0.1) return { label: "Positive", cls: "text-emerald-400" };
    if (score >= -0.1) return { label: "Neutral", cls: "text-amber-400" };
    if (score >= -0.5) return { label: "Negative", cls: "text-red-400" };
    return { label: "Very Negative", cls: "text-red-400" };
  };

  const sentimentInfo = sentimentScoreLabel(stats.avgSentiment);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display hidden sm:inline">ReviewPulse</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white bg-white/5">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </Link>
              <Link href="/dashboard/locations" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <MapPin className="h-3.5 w-3.5" /> Locations
              </Link>
              <Link href="/dashboard/templates" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <FileText className="h-3.5 w-3.5" /> Templates
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {plan === "free" && (
              <Link href="#" className="badge text-orange-400 border-orange-500/20 bg-orange-500/5 text-xs hidden sm:inline-flex">Upgrade to Pro</Link>
            )}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm transition hover:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-white/5 mb-1">{user.email}</div>
                  <Link href="/dashboard/settings" className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-zinc-500">
              Insights across {locations.length} location{locations.length !== 1 ? "s" : ""} and {reviews.length} review{reviews.length !== 1 ? "s" : ""}.
            </p>
          </div>
          {/* Mobile nav */}
          <div className="flex gap-2 sm:hidden">
            <Link href="/dashboard" className="btn-ghost rounded-xl p-2"><LayoutDashboard className="h-4 w-4" /></Link>
            <Link href="/dashboard/locations" className="btn-ghost rounded-xl p-2"><MapPin className="h-4 w-4" /></Link>
            <Link href="/dashboard/settings" className="btn-ghost rounded-xl p-2"><Settings className="h-4 w-4" /></Link>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="mb-6 flex items-center gap-2">
          <Clock className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-500 mr-1">Period:</span>
          {(["7d", "30d", "90d", "all"] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                timePeriod === period
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
                  : "btn-ghost"
              }`}
            >
              {period === "all" ? "All Time" : period}
            </button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bento p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-zinc-500">Total Reviews</p>
          </div>
          <div className="bento p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="h-5 w-5 fill-amber-400" />
            </div>
            <p className="font-display text-2xl font-bold">{stats.avgRating}</p>
            <p className="text-xs text-zinc-500">Average Rating</p>
          </div>
          <div className="bento p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{stats.responseRate}%</p>
            <p className="text-xs text-zinc-500">Response Rate</p>
          </div>
          <div className="bento p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <p className={`font-display text-2xl font-bold ${sentimentInfo.cls}`}>
              {stats.avgSentiment >= 0 ? "+" : ""}{stats.avgSentiment.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">Avg Sentiment Score</p>
          </div>
        </div>

        {/* Rating Distribution + Sentiment Breakdown */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {/* Rating Distribution */}
          <div className="bento p-6">
            <div className="mb-5 flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-400" />
              <h2 className="font-display font-semibold">Rating Distribution</h2>
            </div>
            <div className="space-y-3">
              {ratingDistribution.map((row) => (
                <div key={row.star} className="flex items-center gap-3">
                  <div className="flex w-12 items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                    <span className="text-zinc-300">{row.star}</span>
                  </div>
                  <div className="flex-1 h-5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${row.barWidth}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs text-zinc-500">
                    {row.count} ({row.pct}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="bento p-6">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              <h2 className="font-display font-semibold">Sentiment Breakdown</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* Positive */}
              <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="font-display text-xl font-bold text-emerald-400">{sentimentBreakdown.positive.count}</p>
                <p className="text-xs text-emerald-400/70">{sentimentBreakdown.positive.pct}%</p>
                <p className="mt-1 text-xs text-zinc-500">Positive</p>
              </div>
              {/* Neutral */}
              <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Minus className="h-5 w-5 text-amber-400" />
                </div>
                <p className="font-display text-xl font-bold text-amber-400">{sentimentBreakdown.neutral.count}</p>
                <p className="text-xs text-amber-400/70">{sentimentBreakdown.neutral.pct}%</p>
                <p className="mt-1 text-xs text-zinc-500">Neutral</p>
              </div>
              {/* Negative */}
              <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <ThumbsDown className="h-5 w-5 text-red-400" />
                </div>
                <p className="font-display text-xl font-bold text-red-400">{sentimentBreakdown.negative.count}</p>
                <p className="text-xs text-red-400/70">{sentimentBreakdown.negative.pct}%</p>
                <p className="mt-1 text-xs text-zinc-500">Negative</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Over Time + Top Sources */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {/* Reviews Over Time - 2 cols */}
          <div className="bento p-6 md:col-span-2">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <h2 className="font-display font-semibold">Reviews Over Time</h2>
              <span className="ml-auto text-xs text-zinc-600">
                {timePeriod === "7d" || timePeriod === "30d" ? "Weekly" : "Monthly"}
              </span>
            </div>
            {reviewsOverTime.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-zinc-600">
                No data for this period
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-48">
                {reviewsOverTime.map((bar, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-zinc-500">{bar.count}</span>
                    <div
                      className="w-full min-h-[4px] rounded-t-lg bg-gradient-to-t from-orange-500 to-amber-500 transition-all duration-500"
                      style={{ height: `${Math.max(bar.heightPct, 3)}%` }}
                    />
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap">{bar.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Sources - 1 col */}
          <div className="bento p-6">
            <div className="mb-5 flex items-center gap-2">
              <ChevronDown className="h-5 w-5 text-orange-400" />
              <h2 className="font-display font-semibold">Top Sources</h2>
            </div>
            {topSources.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-zinc-600">
                No sources yet
              </div>
            ) : (
              <div className="space-y-3">
                {topSources.map((s) => (
                  <div key={s.source}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${sourceColors[s.source] || "from-zinc-500 to-zinc-600"} text-[10px] font-bold text-white`}>
                          {s.source[0]?.toUpperCase()}
                        </span>
                        <span className="text-sm capitalize text-zinc-300">{s.source}</span>
                      </div>
                      <span className="text-xs text-zinc-500">{s.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${sourceColors[s.source] || "from-zinc-500 to-zinc-600"} transition-all duration-500`}
                        style={{ width: `${s.barWidth}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass overflow-hidden rounded-3xl">
          <div className="border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-400" />
              <h2 className="font-display font-semibold">Recent Activity</h2>
              <span className="ml-auto text-xs text-zinc-600">Last 10 reviews</span>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
              <h3 className="mb-1 font-display text-lg font-medium text-zinc-400">No reviews yet</h3>
              <p className="text-sm text-zinc-500">Connect a location to start tracking reviews.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentActivity.map((review) => (
                <div key={review.id} className="flex items-start gap-4 px-6 py-4 transition hover:bg-white/[0.02]">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${sourceColors[review.source] || "from-zinc-500 to-zinc-600"} text-xs font-bold text-white`}>
                    {review.source[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{review.reviewer_name || "Anonymous"}</span>
                      {renderStars(review.rating)}
                      {sentimentBadge(review.sentiment)}
                      {review.status === "responded" && (
                        <span className="badge text-emerald-400 border-emerald-500/20 bg-emerald-500/8 text-xs py-0">Replied</span>
                      )}
                    </div>
                    {review.review_text && (
                      <p className="line-clamp-1 text-sm text-zinc-400">{review.review_text}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-zinc-600">{relativeTime(review.fetched_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
