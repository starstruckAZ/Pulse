"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Star, TrendingUp, Clock, LogOut, Link2, ChevronRight,
  ExternalLink, ThumbsUp, Minus, ThumbsDown, X, Zap, FileText,
  BarChart3, Filter, ChevronDown, MapPin, Settings, LayoutDashboard,
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
  locations: { id: string; name: string }[];
  reviews: Review[];
  avgRating: string;
  responseRate: number;
}

type SortKey = "newest" | "oldest" | "rating-high" | "rating-low";

export default function DashboardClient({
  user, profile, locations, reviews: initialReviews, avgRating, responseRate,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);

  // Filters
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Reply modal
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);
  const [replyGenerating, setReplyGenerating] = useState(false);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  // Filtered + sorted reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (filterSource !== "all") result = result.filter((r) => r.source === filterSource);
    if (filterSentiment !== "all") result = result.filter((r) => r.sentiment === filterSentiment);
    if (filterRating !== "all") result = result.filter((r) => r.rating === parseInt(filterRating));
    if (filterStatus === "responded") result = result.filter((r) => r.responded);
    if (filterStatus === "pending") result = result.filter((r) => !r.responded);

    switch (sortBy) {
      case "oldest": result.sort((a, b) => new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime()); break;
      case "rating-high": result.sort((a, b) => b.rating - a.rating); break;
      case "rating-low": result.sort((a, b) => a.rating - b.rating); break;
      default: result.sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime());
    }
    return result;
  }, [reviews, filterSource, filterSentiment, filterRating, filterStatus, sortBy]);

  const activeFilterCount = [filterSource, filterSentiment, filterRating, filterStatus].filter((f) => f !== "all").length;

  const clearFilters = () => { setFilterSource("all"); setFilterSentiment("all"); setFilterRating("all"); setFilterStatus("all"); setSortBy("newest"); };

  const handleReply = (review: Review) => { setReplyingTo(review); setReplyText(review.response_text || ""); };

  const generateAIReply = () => {
    setReplyGenerating(true);
    const templates: Record<string, string> = {
      positive: `Thank you so much for the wonderful review, ${replyingTo?.reviewer_name || "there"}! We're thrilled to hear about your positive experience and look forward to welcoming you back soon!`,
      neutral: `Thank you for sharing your feedback, ${replyingTo?.reviewer_name || "there"}. We appreciate your honest review and are always looking for ways to improve. Please don't hesitate to reach out.`,
      negative: `Thank you for your feedback, ${replyingTo?.reviewer_name || "there"}. We're sorry your experience didn't meet expectations. We'd like the opportunity to make things right — please reach out to us directly.`,
    };
    setTimeout(() => {
      setReplyText(templates[replyingTo?.sentiment || "neutral"] || templates.neutral);
      setReplyGenerating(false);
    }, 800);
  };

  const saveReply = async () => {
    if (!replyingTo || !replyText.trim()) return;
    setReplySaving(true);
    await supabase.from("reviews").update({ responded: true, response_text: replyText.trim() }).eq("id", replyingTo.id);
    setReviews((prev) => prev.map((r) => r.id === replyingTo.id ? { ...r, responded: true, response_text: replyText.trim() } : r));
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
    return <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${s.bg} text-xs font-bold text-white`}>{s.label}</span>;
  };

  const sentimentBadge = (sentiment: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      positive: { icon: <ThumbsUp className="h-3 w-3" />, cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/8" },
      neutral: { icon: <Minus className="h-3 w-3" />, cls: "text-amber-400 border-amber-500/20 bg-amber-500/8" },
      negative: { icon: <ThumbsDown className="h-3 w-3" />, cls: "text-red-400 border-red-500/20 bg-red-500/8" },
    };
    const s = map[sentiment] || map.neutral;
    return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${s.cls}`}>{s.icon} {sentiment}</span>;
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

  const sentimentCounts = reviews.reduce((acc, r) => { acc[r.sentiment] = (acc[r.sentiment] || 0) + 1; return acc; }, {} as Record<string, number>);
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
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white bg-white/5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Welcome back, {displayName.split(" ")[0]}</h1>
            <p className="text-sm text-zinc-500">Here&apos;s what&apos;s happening with your reviews.</p>
          </div>
          {/* Mobile nav */}
          <div className="flex gap-2 md:hidden">
            <Link href="/dashboard/analytics" className="btn-ghost rounded-xl p-2"><BarChart3 className="h-4 w-4" /></Link>
            <Link href="/dashboard/locations" className="btn-ghost rounded-xl p-2"><MapPin className="h-4 w-4" /></Link>
            <Link href="/dashboard/settings" className="btn-ghost rounded-xl p-2"><Settings className="h-4 w-4" /></Link>
          </div>
        </div>

        {/* Connect CTA */}
        {locations.length === 0 && (
          <div className="bento mb-8 flex flex-col items-center justify-between gap-4 p-8 sm:flex-row">
            <div>
              <h2 className="mb-1 font-display text-lg font-bold">Connect your Google Business Profile</h2>
              <p className="text-sm text-zinc-400">Start pulling in reviews automatically. Takes 2 minutes.</p>
            </div>
            <Link href="/dashboard/locations" className="btn-primary inline-flex items-center gap-2 shrink-0 rounded-2xl px-6 py-3 text-sm">
              <Link2 className="h-4 w-4" /> Connect Google
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: <Star className="h-5 w-5" />, label: "Total Reviews", value: reviews.length.toString(), color: "text-orange-400", bg: "bg-orange-500/10" },
            { icon: <TrendingUp className="h-5 w-5" />, label: "Avg Rating", value: avgRating, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: <MessageSquare className="h-5 w-5" />, label: "Response Rate", value: `${responseRate}%`, color: "text-violet-400", bg: "bg-violet-500/10" },
            { icon: <Clock className="h-5 w-5" />, label: "This Week", value: thisWeekCount.toString(), color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bento p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sentiment + Quick Actions */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
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
          <div className="grid grid-cols-2 gap-4 content-start">
            {[
              { href: "/dashboard/analytics", icon: <BarChart3 className="h-5 w-5 text-orange-400" />, title: "Analytics", sub: "Trends & insights", bg: "bg-orange-500/10" },
              { href: "/dashboard/locations", icon: <MapPin className="h-5 w-5 text-emerald-400" />, title: "Locations", sub: "Manage locations", bg: "bg-emerald-500/10" },
              { href: "/dashboard/templates", icon: <FileText className="h-5 w-5 text-violet-400" />, title: "Templates", sub: "Response templates", bg: "bg-violet-500/10" },
              { href: "/dashboard/settings", icon: <Settings className="h-5 w-5 text-zinc-400" />, title: "Settings", sub: "Account & billing", bg: "bg-zinc-500/10" },
            ].map((action) => (
              <Link key={action.title} href={action.href} className="bento flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.bg}`}>{action.icon}</div>
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
          {/* Header + Filters */}
          <div className="border-b border-white/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-semibold">Reviews</h2>
                {reviews.length > 0 && <span className="text-sm text-zinc-600">{filteredReviews.length} of {reviews.length}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-ghost inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs ${activeFilterCount > 0 ? "border-orange-500/30 text-orange-400" : ""}`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  <ChevronDown className={`h-3 w-3 transition ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-zinc-500 transition hover:text-white">Clear</button>
                )}
              </div>
            </div>

            {/* Filter row */}
            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-3">
                <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="input py-1.5 text-xs">
                  <option value="all">All platforms</option>
                  <option value="google">Google</option>
                  <option value="yelp">Yelp</option>
                  <option value="facebook">Facebook</option>
                </select>
                <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)} className="input py-1.5 text-xs">
                  <option value="all">All sentiment</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="input py-1.5 text-xs">
                  <option value="all">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input py-1.5 text-xs">
                  <option value="all">All status</option>
                  <option value="responded">Responded</option>
                  <option value="pending">Needs reply</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="input py-1.5 text-xs">
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="rating-high">Highest rating</option>
                  <option value="rating-low">Lowest rating</option>
                </select>
              </div>
            )}
          </div>

          {/* Review list */}
          {filteredReviews.length === 0 ? (
            <div className="py-20 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
              <h3 className="mb-1 font-display text-lg font-medium text-zinc-400">
                {reviews.length === 0 ? "No reviews yet" : "No reviews match filters"}
              </h3>
              <p className="text-sm text-zinc-500">
                {reviews.length === 0 ? "Connect a location to start tracking." : "Try adjusting your filters."}
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-4 btn-ghost rounded-xl px-4 py-2 text-xs">Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredReviews.map((review) => (
                <div key={review.id} className="flex items-start gap-4 px-6 py-4 transition hover:bg-white/[0.02]">
                  {sourceIcon(review.source)}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{review.reviewer_name || "Anonymous"}</span>
                      {renderStars(review.rating)}
                      {sentimentBadge(review.sentiment)}
                      {review.responded && <span className="badge text-emerald-400 border-emerald-500/20 bg-emerald-500/8 text-xs py-0">Replied</span>}
                    </div>
                    <p className="line-clamp-2 text-sm text-zinc-400">{review.review_text || "No text"}</p>
                    <p className="mt-1 text-xs text-zinc-600">{new Date(review.fetched_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!review.responded && (
                      <button onClick={() => handleReply(review)} className="btn-ghost rounded-xl px-3 py-1.5 text-xs">Reply</button>
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

        {/* Upgrade */}
        {plan === "free" && (
          <div className="mt-8 glass rounded-3xl border-orange-500/10 p-8 text-center">
            <h3 className="mb-1 font-display font-bold">Unlock Yelp, Facebook & Unlimited AI</h3>
            <p className="mb-4 text-sm text-zinc-400">Upgrade to Pro for $49/mo.</p>
            <button className="btn-primary rounded-2xl px-6 py-3 text-sm">Upgrade to Pro <ChevronRight className="inline h-4 w-4" /></button>
          </div>
        )}
      </main>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Reply to Review</h2>
              <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="rounded-xl p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
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
                  <Zap className="h-3 w-3" /> {replyGenerating ? "Generating..." : "Generate with AI"}
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
