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
  X,
  Zap,
  FileText,
  BarChart3,
} from "lucide-react";

interface Review {
  id: string;
  source: string;
  rating: number;
  reviewer_name: string | null;
  review_text: string | null;
  review_url: string | null;
  responded: boolean;
  response_text: string | null;
  sentiment: string;
  fetched_at: string;
}

interface Profile {
  business_name?: string;
  full_name?: string;
  plan?: string;
}

interface DashboardClientProps {
  user: { email?: string };
  profile: Profile | null;
  locations: { id: string }[];
  reviews: Review[];
  avgRating: string;
  responseRate: number;
}

export default function DashboardClient({
  user,
  profile,
  locations,
  reviews: initialReviews,
  avgRating,
  responseRate,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);
  const [replyGenerating, setReplyGenerating] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleReply = (review: Review) => {
    setReplyingTo(review);
    setReplyText(review.response_text || "");
  };

  const generateAIReply = () => {
    setReplyGenerating(true);
    // Simulate AI generation — replace with real API call
    const templates: Record<string, string> = {
      positive: `Thank you so much for the wonderful review, ${replyingTo?.reviewer_name || "there"}! We're thrilled to hear about your positive experience. Your feedback means the world to our team, and we look forward to welcoming you back soon!`,
      neutral: `Thank you for taking the time to share your feedback, ${replyingTo?.reviewer_name || "there"}. We appreciate your honest review and are always looking for ways to improve. If there's anything specific we can do better, please don't hesitate to reach out to us directly.`,
      negative: `Thank you for your feedback, ${replyingTo?.reviewer_name || "there"}. We're sorry to hear that your experience didn't meet expectations. This is not the standard we strive for, and we'd like the opportunity to make things right. Please reach out to us directly so we can address your concerns.`,
    };
    setTimeout(() => {
      setReplyText(templates[replyingTo?.sentiment || "neutral"] || templates.neutral);
      setReplyGenerating(false);
    }, 800);
  };

  const saveReply = async () => {
    if (!replyingTo || !replyText.trim()) return;
    setReplySaving(true);

    await supabase
      .from("reviews")
      .update({
        responded: true,
        response_text: replyText.trim(),
      })
      .eq("id", replyingTo.id);

    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyingTo.id
          ? { ...r, responded: true, response_text: replyText.trim() }
          : r
      )
    );

    setReplySaving(false);
    setReplyingTo(null);
    setReplyText("");
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

  // Sentiment breakdown
  const sentimentCounts = reviews.reduce(
    (acc, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const totalReviews = reviews.length || 1;
  const positivePercent = Math.round(((sentimentCounts.positive || 0) / totalReviews) * 100);
  const neutralPercent = Math.round(((sentimentCounts.neutral || 0) / totalReviews) * 100);
  const negativePercent = Math.round(((sentimentCounts.negative || 0) / totalReviews) * 100);

  // This week count
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = reviews.filter(
    (r) => new Date(r.fetched_at) >= oneWeekAgo
  ).length;

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
            <span className="hidden text-sm text-gray-300 md:inline">
              Dashboard
            </span>
            <Link
              href="/dashboard/templates"
              className="hidden text-sm text-gray-500 transition hover:text-white md:inline"
            >
              Templates
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {plan === "free" && (
              <Link
                href="#"
                className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
              >
                Upgrade to Pro
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
            value={thisWeekCount.toString()}
            color="text-purple-400"
          />
        </div>

        {/* Sentiment Analytics */}
        {reviews.length > 0 && (
          <div className="glow-card mb-8 rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <h2 className="font-semibold">Sentiment Breakdown</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SentimentBar
                label="Positive"
                count={sentimentCounts.positive || 0}
                percent={positivePercent}
                color="bg-green-500"
                textColor="text-green-400"
              />
              <SentimentBar
                label="Neutral"
                count={sentimentCounts.neutral || 0}
                percent={neutralPercent}
                color="bg-yellow-500"
                textColor="text-yellow-400"
              />
              <SentimentBar
                label="Negative"
                count={sentimentCounts.negative || 0}
                percent={negativePercent}
                color="bg-red-500"
                textColor="text-red-400"
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/templates"
            className="glow-card flex items-center gap-3 rounded-xl p-4 transition hover:border-indigo-500/30"
          >
            <FileText className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-sm font-semibold">Templates</p>
              <p className="text-xs text-gray-500">Manage response templates</p>
            </div>
          </Link>
          <button className="glow-card flex items-center gap-3 rounded-xl p-4 text-left transition hover:border-indigo-500/30">
            <Zap className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-sm font-semibold">AI Responses</p>
              <p className="text-xs text-gray-500">Generate replies with AI</p>
            </div>
          </button>
          <button className="glow-card flex items-center gap-3 rounded-xl p-4 text-left transition hover:border-indigo-500/30">
            <Link2 className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-sm font-semibold">Connect</p>
              <p className="text-xs text-gray-500">Add more platforms</p>
            </div>
          </button>
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
                    <div className="mb-1 flex flex-wrap items-center gap-2">
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
                      <button
                        onClick={() => handleReply(review)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/5"
                      >
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

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121a] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Reply to Review</h2>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText("");
                }}
                className="rounded-lg p-1 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Review preview */}
            <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center gap-2">
                {sourceIcon(replyingTo.source)}
                <span className="text-sm font-medium">
                  {replyingTo.reviewer_name || "Anonymous"}
                </span>
                {stars(replyingTo.rating)}
                {sentimentBadge(replyingTo.sentiment)}
              </div>
              <p className="text-sm text-gray-400">
                {replyingTo.review_text || "No text"}
              </p>
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Your Response
                </label>
                <button
                  onClick={generateAIReply}
                  disabled={replyGenerating}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/20 disabled:opacity-50"
                >
                  <Zap className="h-3 w-3" />
                  {replyGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="Write your response..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText("");
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={saveReply}
                disabled={replySaving || !replyText.trim()}
                className="btn-glow rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {replySaving ? "Saving..." : "Save Response"}
              </button>
            </div>
          </div>
        </div>
      )}
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

function SentimentBar({
  label,
  count,
  percent,
  color,
  textColor,
}: {
  label: string;
  count: number;
  percent: number;
  color: string;
  textColor: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className={textColor}>{label}</span>
        <span className="text-gray-500">
          {count} ({percent}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
