import { createClient as createPublicClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Star, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import PrintButton from "./print-button";

export const dynamic = "force-dynamic";

interface Review {
  id: string;
  location_id: string;
  source: string;
  rating: number;
  reviewer_name: string | null;
  review_text: string | null;
  responded: boolean;
  sentiment: string;
  fetched_at: string;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfLastMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

function endOfLastMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
}

function weekKey(d: Date) {
  // ISO week number trick: Monday-anchored
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function avgOf(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sentimentScore(reviews: Review[]) {
  if (!reviews.length) return 0;
  let score = 0;
  reviews.forEach((r) => {
    if (r.sentiment === "positive") score += 1;
    else if (r.sentiment === "negative") score -= 1;
  });
  return Math.round(((score + reviews.length) / (2 * reviews.length)) * 100);
}

function renderStarsFn(rating: number, size = "h-4 w-4") {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${
            i <= Math.round(rating)
              ? "fill-orange-400 text-orange-400"
              : "text-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

export default async function MonthlyReportPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;

  // Auth check with cookie client
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const authSupabase = createClient(await cookieStore);
  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify ownership
  const { data: locationCheck } = await authSupabase
    .from("locations")
    .select("id, name, address, user_id")
    .eq("id", locationId)
    .single();

  if (!locationCheck || locationCheck.user_id !== user.id) notFound();

  // Use service role for data fetch
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, location_id, source, rating, reviewer_name, review_text, responded, sentiment, fetched_at")
    .eq("location_id", locationId)
    .order("fetched_at", { ascending: false });

  const allReviews: Review[] = reviewsData ?? [];

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfLastMonth(now);
  const lastMonthEnd = endOfLastMonth(now);

  const thisMonthReviews = allReviews.filter(
    (r) => new Date(r.fetched_at) >= thisMonthStart
  );
  const lastMonthReviews = allReviews.filter((r) => {
    const d = new Date(r.fetched_at);
    return d >= lastMonthStart && d <= lastMonthEnd;
  });

  // ── Core metrics ─────────────────────────────────────────────────────────
  const thisCount = thisMonthReviews.length;
  const lastCount = lastMonthReviews.length;

  const thisAvg = avgOf(thisMonthReviews.map((r) => r.rating));
  const lastAvg = avgOf(lastMonthReviews.map((r) => r.rating));

  const thisResponded = thisMonthReviews.filter((r) => r.responded).length;
  const thisResponseRate = thisCount > 0 ? Math.round((thisResponded / thisCount) * 100) : 0;
  const lastResponded = lastMonthReviews.filter((r) => r.responded).length;
  const lastResponseRate = lastCount > 0 ? Math.round((lastResponded / lastCount) * 100) : 0;

  const thisSentimentScore = sentimentScore(thisMonthReviews);
  const lastSentimentScore = sentimentScore(lastMonthReviews);

  // ── Unanswered reviews ────────────────────────────────────────────────────
  const unanswered = thisMonthReviews.filter((r) => !r.responded).slice(0, 5);

  // ── Top review of the month ───────────────────────────────────────────────
  const topReview = [...thisMonthReviews]
    .filter((r) => r.review_text)
    .sort((a, b) => b.rating - a.rating)[0] ?? null;

  // ── Sentiment breakdown this month ────────────────────────────────────────
  const sentimentBreakdown = {
    positive: thisMonthReviews.filter((r) => r.sentiment === "positive").length,
    neutral: thisMonthReviews.filter((r) => r.sentiment === "neutral").length,
    negative: thisMonthReviews.filter((r) => r.sentiment === "negative").length,
  };
  const sentTotal = thisCount || 1;
  const positivePct = Math.round((sentimentBreakdown.positive / sentTotal) * 100);
  const neutralPct = Math.round((sentimentBreakdown.neutral / sentTotal) * 100);
  const negativePct = 100 - positivePct - neutralPct;

  // ── Most active platform this month ──────────────────────────────────────
  const platformCounts: Record<string, number> = {};
  thisMonthReviews.forEach((r) => {
    platformCounts[r.source] = (platformCounts[r.source] ?? 0) + 1;
  });
  const topPlatform =
    Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // ── Weekly bar chart (last 8 weeks) ──────────────────────────────────────
  // Build ordered list of last 8 weeks
  const weekLabels: string[] = [];
  const weekRef = new Date(now);
  for (let i = 7; i >= 0; i--) {
    const d = new Date(weekRef);
    d.setDate(d.getDate() - i * 7);
    weekLabels.push(weekKey(d));
  }
  const weekCounts: Record<string, number> = {};
  weekLabels.forEach((w) => (weekCounts[w] = 0));
  allReviews.forEach((r) => {
    const wk = weekKey(new Date(r.fetched_at));
    if (wk in weekCounts) weekCounts[wk]++;
  });
  const weekData = weekLabels.map((w) => ({
    label: w.split("-W")[1] ? `W${w.split("-W")[1]}` : w,
    count: weekCounts[w],
  }));
  const maxWeekCount = Math.max(...weekData.map((w) => w.count), 1);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function Trend({
    current,
    previous,
    higherIsBetter = true,
    suffix = "",
  }: {
    current: number;
    previous: number;
    higherIsBetter?: boolean;
    suffix?: string;
  }) {
    const diff = current - previous;
    if (diff === 0 || previous === 0) return <span className="text-xs text-zinc-600">No change</span>;
    const better = higherIsBetter ? diff > 0 : diff < 0;
    const Icon = diff > 0 ? TrendingUp : TrendingDown;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium ${
          better ? "text-emerald-400" : "text-red-400"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {diff > 0 ? "+" : ""}
        {diff.toFixed(suffix ? 0 : 1)}
        {suffix} vs last month
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Nav — hidden when printing */}
      <nav className="glass sticky top-0 z-40 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display">ReviewPulse</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/locations"
              className="btn-ghost rounded-2xl px-4 py-2 text-sm"
            >
              Back to Locations
            </Link>
            <PrintButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10 print:py-4 print:px-8">
        {/* ── Report Header ─────────────────────────────────────────────────── */}
        <div className="mb-10 flex items-start justify-between print:mb-6">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-zinc-500">
              <Link
                href={`/business/${locationId}`}
                className="transition hover:text-white print:pointer-events-none"
              >
                {locationCheck.name}
              </Link>
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Monthly Report
            </h1>
            <p className="mt-1 text-lg text-zinc-400">{monthLabel}</p>
            {locationCheck.address && (
              <p className="mt-1 text-sm text-zinc-600">{locationCheck.address}</p>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs text-zinc-600">ReviewPulse</span>
          </div>
        </div>

        {/* ── 4 Stat Cards ──────────────────────────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-3">
          {/* Total Reviews */}
          <div className="bento p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
              Total Reviews
            </p>
            <p className="font-display text-4xl font-bold gradient-text">{thisCount}</p>
            <div className="mt-2">
              <Trend current={thisCount} previous={lastCount} suffix="" />
            </div>
          </div>

          {/* Avg Rating */}
          <div className="bento p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
              Avg Rating
            </p>
            <p className="font-display text-4xl font-bold gradient-text">
              {thisCount > 0 ? thisAvg.toFixed(1) : "—"}
            </p>
            <div className="mt-2">
              {thisCount > 0 && lastCount > 0 ? (
                <Trend current={thisAvg} previous={lastAvg} />
              ) : (
                <span className="text-xs text-zinc-600">No data</span>
              )}
            </div>
          </div>

          {/* Response Rate */}
          <div className="bento p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
              Response Rate
            </p>
            <p className="font-display text-4xl font-bold gradient-text">
              {thisResponseRate}%
            </p>
            <div className="mt-2">
              <Trend current={thisResponseRate} previous={lastResponseRate} suffix="%" />
            </div>
          </div>

          {/* Sentiment Score */}
          <div className="bento p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
              Sentiment Score
            </p>
            <p className="font-display text-4xl font-bold gradient-text">
              {thisCount > 0 ? `${thisSentimentScore}%` : "—"}
            </p>
            <div className="mt-2">
              {thisCount > 0 && lastCount > 0 ? (
                <Trend current={thisSentimentScore} previous={lastSentimentScore} suffix="%" />
              ) : (
                <span className="text-xs text-zinc-600">No data</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* ── Weekly Bar Chart ─────────────────────────────────────────────── */}
          <div className="bento p-6">
            <h2 className="font-display mb-5 font-semibold text-zinc-200">
              Weekly Review Trend (Last 8 Weeks)
            </h2>
            <div className="flex items-end gap-2 h-36">
              {weekData.map((week) => {
                const heightPct = Math.round((week.count / maxWeekCount) * 100);
                return (
                  <div
                    key={week.label}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <span className="text-xs text-zinc-600 tabular-nums">
                      {week.count > 0 ? week.count : ""}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#ff6b4a] to-[#ff3d71] transition-all"
                        style={{
                          height: week.count > 0 ? `${heightPct}%` : "4px",
                          opacity: week.count > 0 ? 1 : 0.15,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-600">{week.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sentiment Breakdown ──────────────────────────────────────────── */}
          <div className="bento p-6">
            <h2 className="font-display mb-5 font-semibold text-zinc-200">
              Sentiment Breakdown — This Month
            </h2>
            {thisCount > 0 ? (
              <div className="space-y-5">
                {/* CSS pie via stacked bar */}
                <div className="flex h-6 w-full overflow-hidden rounded-full">
                  {positivePct > 0 && (
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${positivePct}%` }}
                      title={`Positive ${positivePct}%`}
                    />
                  )}
                  {neutralPct > 0 && (
                    <div
                      className="h-full bg-zinc-500 transition-all"
                      style={{ width: `${neutralPct}%` }}
                      title={`Neutral ${neutralPct}%`}
                    />
                  )}
                  {negativePct > 0 && (
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${negativePct}%` }}
                      title={`Negative ${negativePct}%`}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Positive",
                      count: sentimentBreakdown.positive,
                      pct: positivePct,
                      color: "bg-emerald-500",
                      textColor: "text-emerald-400",
                    },
                    {
                      label: "Neutral",
                      count: sentimentBreakdown.neutral,
                      pct: neutralPct,
                      color: "bg-zinc-500",
                      textColor: "text-zinc-400",
                    },
                    {
                      label: "Negative",
                      count: sentimentBreakdown.negative,
                      pct: negativePct,
                      color: "bg-red-500",
                      textColor: "text-red-400",
                    },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.color}`} />
                      <span className="flex-1 text-sm text-zinc-400">{s.label}</span>
                      <span className={`text-sm font-semibold ${s.textColor}`}>
                        {s.count}
                      </span>
                      <span className="w-10 text-right text-xs text-zinc-600">
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>

                {topPlatform && (
                  <p className="text-xs text-zinc-500 border-t border-white/5 pt-3">
                    Most active platform:{" "}
                    <span className="font-semibold capitalize text-zinc-300">
                      {topPlatform}
                    </span>{" "}
                    ({platformCounts[topPlatform]} reviews)
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-zinc-600 text-sm">
                No reviews this month
              </div>
            )}
          </div>
        </div>

        {/* ── Top Review ────────────────────────────────────────────────────── */}
        {topReview && (
          <div className="mb-6 bento p-6 border-[rgba(255,107,74,0.15)]">
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
              <h2 className="font-display font-semibold text-zinc-200">
                Top Review of the Month
              </h2>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-5 border border-white/5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 text-sm font-bold text-orange-400">
                    {(topReview.reviewer_name?.[0] ?? "A").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {topReview.reviewer_name ?? "Anonymous"}
                    </p>
                    <p className="text-xs capitalize text-zinc-500">{topReview.source}</p>
                  </div>
                </div>
                {renderStarsFn(topReview.rating)}
              </div>
              {topReview.review_text && (
                <p className="text-sm text-zinc-300 leading-relaxed">
                  &ldquo;{topReview.review_text}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Action Items ──────────────────────────────────────────────────── */}
        <div className="mb-8 bento p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-zinc-200">
              Action Items — Unanswered Reviews
            </h2>
            {unanswered.length > 0 && (
              <span className="badge text-red-400 border-red-500/20 bg-red-500/5 text-xs">
                {thisMonthReviews.filter((r) => !r.responded).length} pending
              </span>
            )}
          </div>

          {unanswered.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-4">
              <span className="text-emerald-400 text-lg">✓</span>
              <p className="text-sm text-emerald-400 font-medium">
                All reviews this month have been responded to. Great work!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unanswered.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 rounded-2xl bg-white/[0.02] border border-white/5 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 text-xs font-bold text-zinc-400">
                    {(r.reviewer_name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {r.reviewer_name ?? "Anonymous"}
                      </span>
                      {renderStarsFn(r.rating, "h-3.5 w-3.5")}
                      <span className="text-xs capitalize text-zinc-500">{r.source}</span>
                    </div>
                    {r.review_text && (
                      <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                        {r.review_text}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/dashboard"
                    className="btn-ghost shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs print:hidden"
                  >
                    Reply <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Print CTA ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 print:hidden">
          <PrintButton className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm" />
          <Link
            href="/dashboard"
            className="btn-ghost inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>

      {/* Print footer */}
      <footer className="hidden print:block text-center text-xs text-zinc-600 py-4 border-t border-white/5">
        Generated by ReviewPulse · {new Date().toLocaleDateString()}
      </footer>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: #111 !important; }
          .bento { border: 1px solid #e5e7eb !important; background: #fafafa !important; break-inside: avoid; }
          .gradient-text { color: #ff6b4a !important; -webkit-text-fill-color: #ff6b4a !important; }
          .glass { background: transparent !important; border: none !important; }
          nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
