"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Star, TrendingUp, Clock, LogOut, Link2, ChevronRight,
  ExternalLink, ThumbsUp, Minus, ThumbsDown, X, FileText,
  BarChart3, Filter, ChevronDown, MapPin, Settings, LayoutDashboard, Code2, Bookmark,
  User, Share2, Check, Flame, Trophy, Zap,
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
  // Note: Run this SQL in Supabase: ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
  featured?: boolean;
}

interface Profile {
  business_name?: string;
  full_name?: string;
  plan?: string;
}

interface Template {
  id: string;
  name: string;
  template_text: string;
  sentiment_filter: string | null;
}

interface DashboardClientProps {
  user: { email?: string };
  profile: Profile | null;
  locations: { id: string; name: string }[];
  reviews: Review[];
  avgRating: string;
  responseRate: number;
  templates: Template[];
  streak?: number;
  xp?: number;
  totalResponses?: number;
}

type SortKey = "newest" | "oldest" | "rating-high" | "rating-low";

/** XP needed to level up at each level */
function xpForLevel(level: number): number { return level * 100; }
function levelFromXP(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) { remaining -= xpForLevel(level); level++; }
  return level;
}
function xpProgressInLevel(xp: number): number {
  let remaining = xp;
  let level = 1;
  while (remaining >= xpForLevel(level)) { remaining -= xpForLevel(level); level++; }
  return remaining;
}

export default function DashboardClient({
  user, profile, locations, reviews: initialReviews, avgRating, responseRate, templates,
  streak = 0, xp = 0, totalResponses = 0,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const copyReviewLink = (locId: string) => {
    const url = `${window.location.origin}/r/${locId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLinkId(locId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    });
  };

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
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  // Close template dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const handleReply = (review: Review) => {
    setReplyingTo(review);
    setReplyText(review.response_text || "");
    setShowTemplateDropdown(false);
  };

  const toggleFeatured = async (review: Review) => {
    const next = !review.featured;
    await supabase.from("reviews").update({ featured: next }).eq("id", review.id);
    setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, featured: next } : r));
  };

  const filteredTemplates = replyingTo
    ? templates.filter((t) => !t.sentiment_filter || t.sentiment_filter === replyingTo.sentiment)
    : templates;

  const saveReply = async () => {
    if (!replyingTo || !replyText.trim()) return;
    setReplySaving(true);
    await supabase.from("reviews").update({ responded: true, response_text: replyText.trim() }).eq("id", replyingTo.id);
    setReviews((prev) => prev.map((r) => r.id === replyingTo.id ? { ...r, responded: true, response_text: replyText.trim() } : r));

    // Award XP + update streak via RPC
    await supabase.rpc("award_response_xp", { xp_amount: 10 }).catch(() => null);

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
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? "fill-[#ff6b4a] text-[#ff6b4a]" : "text-zinc-700"}`} />
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
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display hidden sm:inline">ReviewHype</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white bg-white/5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </Link>
              <Link href="/dashboard/locations" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <MapPin className="h-3.5 w-3.5" /> Locations
              </Link>
              <Link href="/dashboard/templates" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <FileText className="h-3.5 w-3.5" /> Templates
              </Link>
              <Link href="/dashboard/widget" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <Code2 className="h-3.5 w-3.5" /> Widget
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {plan === "free" && (
              <Link href="/dashboard/upgrade" className="badge text-[#ff6b4a] border-[#ff6b4a]/20 bg-[#ff6b4a]/10 text-xs hidden sm:inline-flex">Upgrade to Pro</Link>
            )}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm transition hover:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 text-xs font-bold text-[#ff6b4a]">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-white/[0.04] mb-1">{user.email}</div>
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
            {/* View Profile links per location */}
            {locations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <Link
                    key={loc.id}
                    href={`/business/${loc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#ff6b4a]/20 bg-[#ff6b4a]/5 px-3 py-1 text-xs text-[#ff6b4a] transition hover:bg-[#ff6b4a]/10"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Profile{locations.length > 1 ? `: ${loc.name}` : ""}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {/* Mobile nav */}
          <div className="flex gap-2 md:hidden">
            <Link href="/dashboard/analytics" className="btn-ghost rounded-xl p-2"><BarChart3 className="h-4 w-4" /></Link>
            <Link href="/dashboard/locations" className="btn-ghost rounded-xl p-2"><MapPin className="h-4 w-4" /></Link>
            <Link href="/dashboard/settings" className="btn-ghost rounded-xl p-2"><Settings className="h-4 w-4" /></Link>
          </div>
        </div>

        {/* Gamification bar */}
        {(() => {
          const level = levelFromXP(xp);
          const progressXP = xpProgressInLevel(xp);
          const neededXP = xpForLevel(level);
          const progressPct = Math.round((progressXP / neededXP) * 100);
          const pendingResponses = reviews.filter(r => !r.responded).length;
          return (
            <div className="bento mb-6 p-4 flex flex-wrap items-center gap-4">
              {/* Level */}
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20">
                  <Trophy className="h-5 w-5 text-[#ff6b4a]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-300">Level {level}</span>
                    <span className="text-[10px] text-zinc-600">{progressXP}/{neededXP} XP</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff3d71] transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
                <Flame className={`h-4 w-4 ${streak > 0 ? "text-orange-400" : "text-zinc-600"}`} />
                <div>
                  <p className="text-sm font-bold text-zinc-200">{streak}d</p>
                  <p className="text-[10px] text-zinc-600">streak</p>
                </div>
              </div>

              {/* Responses */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
                <Zap className="h-4 w-4 text-yellow-400" />
                <div>
                  <p className="text-sm font-bold text-zinc-200">{totalResponses}</p>
                  <p className="text-[10px] text-zinc-600">responses</p>
                </div>
              </div>

              {/* Pending nudge */}
              {pendingResponses > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-[#ff6b4a]/20 bg-[#ff6b4a]/5 px-3 py-2">
                  <span className="text-[10px] font-semibold text-[#ff6b4a]">
                    +{Math.min(pendingResponses * 10, 50)} XP ready
                  </span>
                  <span className="text-[10px] text-zinc-500">— respond to {pendingResponses} review{pendingResponses !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          );
        })()}

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
            { icon: <Star className="h-5 w-5" />, label: "Total Reviews", value: reviews.length.toString(), color: "text-[#ff6b4a]", bg: "bg-[#ff6b4a]/10" },
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
                <BarChart3 className="h-5 w-5 text-[#ff6b4a]" />
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
              { href: "/dashboard/analytics", icon: <BarChart3 className="h-5 w-5 text-[#ff6b4a]" />, title: "Analytics", sub: "Trends & insights", bg: "bg-[#ff6b4a]/10" },
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

            {/* View Profile — links to first location's public profile */}
            {locations.length > 0 && (
              <Link
                href={`/business/${locations[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bento flex items-center gap-3 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                  <User className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">View Profile</p>
                  <p className="text-xs text-zinc-500">Public business page</p>
                </div>
              </Link>
            )}

            {/* Get Reviews Link — copies review request URL to clipboard */}
            {locations.length > 0 && (
              <button
                onClick={() => copyReviewLink(locations[0].id)}
                className="bento flex items-center gap-3 p-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b4a]/10">
                  {copiedLinkId ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Share2 className="h-5 w-5 text-[#ff6b4a]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {copiedLinkId ? "Copied!" : "Get Reviews Link"}
                  </p>
                  <p className="text-xs text-zinc-500">Share with customers</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="glass overflow-hidden rounded-3xl">
          {/* Header + Filters */}
          <div className="border-b border-white/[0.04] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-semibold">Reviews</h2>
                {reviews.length > 0 && <span className="text-sm text-zinc-600">{filteredReviews.length} of {reviews.length}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-ghost inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs ${activeFilterCount > 0 ? "border-[#ff6b4a]/30 text-[#ff6b4a]" : ""}`}
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
            <div className="divide-y divide-white/[0.04]">
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
                    {/* Feature toggle — marks review as featured on public profile */}
                    <button
                      onClick={() => toggleFeatured(review)}
                      title={review.featured ? "Remove from featured" : "Feature on public profile"}
                      className="rounded-xl p-2 transition hover:bg-white/5"
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 transition ${review.featured ? "fill-[#ff6b4a] text-[#ff6b4a]" : "text-zinc-600 hover:text-zinc-400"}`}
                      />
                    </button>
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
          <div className="mt-8 glass rounded-3xl border-[#ff6b4a]/10 p-8 text-center">
            <h3 className="mb-1 font-display font-bold">Unlock Yelp, Facebook & Unlimited AI</h3>
            <p className="mb-4 text-sm text-zinc-400">Upgrade to Pro for $49/mo.</p>
            <Link href="/dashboard/upgrade" className="btn-primary inline-flex items-center rounded-2xl px-6 py-3 text-sm">Upgrade to Pro <ChevronRight className="inline h-4 w-4 ml-1" /></Link>
          </div>
        )}
      </main>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Reply to Review</h2>
              <button onClick={() => { setReplyingTo(null); setReplyText(""); setShowTemplateDropdown(false); }} className="rounded-xl p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4">
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
                {/* Template dropdown */}
                <div className="relative" ref={templateDropdownRef}>
                  <button
                    onClick={() => setShowTemplateDropdown((v) => !v)}
                    className="badge text-[#ff6b4a] border-[#ff6b4a]/20 bg-[#ff6b4a]/[0.08] text-xs cursor-pointer hover:bg-[#ff6b4a]/10 transition inline-flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" /> Use Template <ChevronDown className="h-3 w-3" />
                  </button>
                  {showTemplateDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-64 glass rounded-2xl p-1.5 shadow-2xl z-10">
                      {filteredTemplates.length === 0 ? (
                        <div className="px-3 py-2.5 text-xs text-zinc-500">
                          No templates yet — <Link href="/dashboard/templates" className="text-[#ff6b4a] hover:underline" onClick={() => setShowTemplateDropdown(false)}>create one in Templates</Link>
                        </div>
                      ) : (
                        filteredTemplates.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => { setReplyText(t.template_text); setShowTemplateDropdown(false); }}
                            className="flex w-full flex-col items-start rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
                          >
                            <span className="text-xs font-medium text-zinc-200">{t.name}</span>
                            {t.sentiment_filter && (
                              <span className="text-[10px] text-zinc-500 capitalize">{t.sentiment_filter}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} className="input w-full" placeholder="Write your response..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setReplyingTo(null); setReplyText(""); setShowTemplateDropdown(false); }} className="btn-ghost rounded-2xl px-5 py-2.5 text-sm">Cancel</button>
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
