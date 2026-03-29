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
    const templates: Record<string, string> = {
      positive: `Thank you so much for the wonderful review, ${replyingTo?.reviewer_name || "there"}! We're thrilled to hear about your positive experience. Your feedback means the world to our team, and we look forward to welcoming you back soon!`,
      neutral: `Thank you for taking the time to share your feedback, ${replyingTo?.reviewer_name || "there"}. We appreciate your honest review and are always looking for ways to improve. If there's anything specific we can do better, please don't hesitate to reach out.`,
      negative: `Thank you for your feedback, ${replyingTo?.reviewer_name || "there"}. We're sorry to hear that your experience didn't meet expectations. We'd like the opportunity to make things right. Please reach out to us directly so we can address your concerns.`,
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
      .update({ responded: true, response_text: replyText.trim() })
      .eq("id", replyingTo.id);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyingTo.id ? { ...r, responded: true, response_text: replyText.trim() } : r
      )
    );
    setReplySaving(false);
    setReplyingTo(null);
    setReplyText("");
  };

  const sourceIcon = (source: string) => {
    const map: Record<string, { label: string; bg: string }> = {
      google: { label: "G", bg: "from-blue-500 to-blue-600" },
      yelp: { label: "Y", bg: "from-red-500 to-red-600" },
      facebook: { label: "F", bg: "from-indigo-500 to-indigo-600" },
    };
    const s = map[source] || { label: "?", bg: "from-zinc-500 to-zinc-600" };
    return (
      <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${s.bg} text-xs font-bold text-white`}>
        {s.label}
      </span>
    );
  };

  const sentimentBadge = (sentiment: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      positive: { icon: <ThumbsUp className="h-3 w-3" />, cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/8" },
      neutral: { icon: <Minus className="h-3 w-3" />, cls: "text-amber-400 border-amber-500/20 bg-amber-500/8" },
      negative: { icon: <ThumbsDown className="h-3 w-3" />, cls: "text-red-400 border-red-500/20 bg-red-500/8" },
    };
    const s = map[sentiment] || map.neutral;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${s.cls}`}>
        {s.icon} {sentiment}
      </span>
    );
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? "fill-orange-400 text-orange-400" : "text-zinc-700"}`} />
      ))}
    </div>
  );

  const displayName = profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  const sentimentCounts = reviews.reduce(
    (acc, r) => { acc[r.sentiment] = (acc[r.sentiment] || 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const total = reviews.length || 1;
  const posPercent = Math.round(((sentimentCounts.positive || 0) / total) * 100);
  const neuPercent = Math.round(((sentimentCounts.neutral || 0) / total) * 100);
  const negPercent = Math.round(((sentimentCounts.negative || 0) / total) * 100);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = reviews.filter((r) => new Date(r.fetched_at) >= oneWeekAgo).length;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass sticky top-0 z-40 border-b-0 border-t-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display">ReviewPulse</span>
            </Link>
            <span className="hidden text-sm text-zinc-300 md:inline">Dashboard</span>
            <Link href="/dashboard/templates" className="hidden text-sm text-zinc-500 transition hover:text-white md:inline">
              Templates
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {plan === "free" && (
              <Link href="#" className="badge text-orange-400 border-orange-500/20 bg-orange-500/5 text-xs">
                Upgrade to Pro
              </Link>
            )}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm transition hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
                <span className="hidden md:inline text-zinc-300">{displayName}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl">
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">
            Welcome back, {displayName.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-500">Here&apos;s what&apos;s happening with your reviews.</p>
        </div>

        {/* Connect CTA */}
        {locations.length === 0 && (
          <div className="bento mb-8 flex flex-col items-center justify-between gap-4 p-8 sm:flex-row">
            <div>
              <h2 className="mb-1 font-display text-lg font-bold">Connect your Google Business Profile</h2>
              <p className="text-sm text-zinc-400">Start pulling in reviews automatically. Takes 2 minutes.</p>
            </div>
            <button className="btn-primary inline-flex items-center gap-2 shrink-0 rounded-2xl px-6 py-3 text-sm">
              <Link2 className="h-4 w-4" /> Connect Google
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: <Star className="h-5 w-5" />, label: "Total Reviews", value: reviews.length.toString(), color: "text-orange-400", bg: "bg-orange-500/10" },
            { icon: <TrendingUp className="h-5 w-5" />, label: "Avg Rating", value: avgRating, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: <MessageSquare className="h-5 w-5" />, label: "Response Rate", value: `${responseRate}%`, color: "text-violet-400", bg: "bg-violet-500/10" },
            { icon: <Clock className="h-5 w-5" />, label: "This Week", value: thisWeekCount.toString(), color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bento p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sentiment + Quick Actions row */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {/* Sentiment */}
          {reviews.length > 0 && (
            <div className="bento p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-400" />
                <h2 className="font-display font-semibold">Sentiment</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Positive", count: sentimentCounts.positive || 0, pct: posPercent, color: "bg-emerald-500", text: "text-emerald-400" },
                  { label: "Neutral", count: sentimentCounts.neutral || 0, pct: neuPercent, color: "bg-amber-500", text: "text-amber-400" },
                  { label: "Negative", count: sentimentCounts.negative || 0, pct: negPercent, color: "bg-red-500", text: "text-red-400" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className={s.text}>{s.label}</span>
                      <span className="text-zinc-500">{s.count} ({s.pct}%)</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            {[
              { href: "/dashboard/templates", icon: <FileText className="h-5 w-5 text-violet-400" />, title: "Templates", sub: "Manage response templates", bg: "bg-violet-500/10" },
              { href: "#", icon: <Zap className="h-5 w-5 text-orange-400" />, title: "AI Responses", sub: "Generate replies with AI", bg: "bg-orange-500/10" },
              { href: "#", icon: <Link2 className="h-5 w-5 text-emerald-400" />, title: "Connect", sub: "Add more platforms", bg: "bg-emerald-500/10" },
            ].map((action) => (
              <Link key={action.title} href={action.href} className="bento flex items-center gap-4 p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.bg}`}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="text-xs text-zinc-500">{action.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="glass overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <h2 className="font-display font-semibold">Recent Reviews</h2>
            {reviews.length > 0 && <span className="text-sm text-zinc-500">{reviews.length} total</span>}
          </div>

          {reviews.length === 0 ? (
            <div className="py-20 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
              <h3 className="mb-1 font-display text-lg font-medium text-zinc-400">No reviews yet</h3>
              <p className="text-sm text-zinc-500">Connect your Google Business Profile to start.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-4 px-6 py-4 transition hover:bg-white/[0.02]">
                  {sourceIcon(review.source)}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{review.reviewer_name || "Anonymous"}</span>
                      {renderStars(review.rating)}
                      {sentimentBadge(review.sentiment)}
                      {review.responded && (
                        <span className="badge text-emerald-400 border-emerald-500/20 bg-emerald-500/8 text-xs py-0">Replied</span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-zinc-400">{review.review_text || "No text"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!review.responded && (
                      <button onClick={() => handleReply(review)} className="btn-ghost rounded-xl px-3 py-1.5 text-xs">
                        Reply
                      </button>
                    )}
                    {review.review_url && (
                      <a href={review.review_url} target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 text-zinc-600 transition hover:bg-white/5 hover:text-white">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade banner */}
        {plan === "free" && (
          <div className="mt-8 glass rounded-3xl border-orange-500/10 p-8 text-center">
            <h3 className="mb-1 font-display font-bold">Unlock Yelp, Facebook & Unlimited AI</h3>
            <p className="mb-4 text-sm text-zinc-400">Upgrade to Pro for $49/mo.</p>
            <button className="btn-primary rounded-2xl px-6 py-3 text-sm">
              Upgrade to Pro <ChevronRight className="inline h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Reply to Review</h2>
              <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="rounded-xl p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center gap-2">
                {sourceIcon(replyingTo.source)}
                <span className="text-sm font-medium">{replyingTo.reviewer_name || "Anonymous"}</span>
                {renderStars(replyingTo.rating)}
                {sentimentBadge(replyingTo.sentiment)}
              </div>
              <p className="text-sm text-zinc-400">{replyingTo.review_text || "No text"}</p>
            </div>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Your Response</label>
                <button onClick={generateAIReply} disabled={replyGenerating} className="badge text-orange-400 border-orange-500/20 bg-orange-500/5 text-xs cursor-pointer hover:bg-orange-500/10 transition disabled:opacity-50">
                  <Zap className="h-3 w-3" />
                  {replyGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} className="input w-full" placeholder="Write your response..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="btn-ghost rounded-2xl px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={saveReply} disabled={replySaving || !replyText.trim()} className="btn-primary rounded-2xl px-6 py-2.5 text-sm disabled:opacity-50">
                {replySaving ? "Saving..." : "Save Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
