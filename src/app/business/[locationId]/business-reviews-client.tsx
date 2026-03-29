"use client";

import { useState, useMemo } from "react";
import { Star, ThumbsUp, Minus, ThumbsDown, ChevronDown } from "lucide-react";

// Note: Run this SQL in Supabase: ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

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
  featured?: boolean;
}

interface Props {
  reviews: Review[];
  featuredReviews: Review[];
}

const PLATFORM_META: Record<string, { label: string; letter: string; gradient: string }> = {
  google: { label: "Google", letter: "G", gradient: "from-blue-500 to-blue-600" },
  yelp: { label: "Yelp", letter: "Y", gradient: "from-red-500 to-red-600" },
  facebook: { label: "Facebook", letter: "F", gradient: "from-indigo-500 to-indigo-600" },
};

const PAGE_SIZE = 10;

export default function BusinessReviewsClient({ reviews }: Props) {
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = [...reviews];
    if (ratingFilter !== "all") result = result.filter((r) => r.rating === parseInt(ratingFilter));
    if (platformFilter !== "all") result = result.filter((r) => r.source === platformFilter);
    return result;
  }, [reviews, ratingFilter, platformFilter]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-orange-400 text-orange-400" : "text-zinc-700"}`}
        />
      ))}
    </div>
  );

  const sentimentBadge = (sentiment: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      positive: { icon: <ThumbsUp className="h-3 w-3" />, cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
      neutral: { icon: <Minus className="h-3 w-3" />, cls: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
      negative: { icon: <ThumbsDown className="h-3 w-3" />, cls: "text-red-400 border-red-500/20 bg-red-500/10" },
    };
    const s = map[sentiment] || map.neutral;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${s.cls}`}>
        {s.icon} {sentiment}
      </span>
    );
  };

  const relativeDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
  };

  const filterBtn = (
    value: string,
    label: string,
    current: string,
    set: (v: string) => void
  ) => (
    <button
      key={value}
      onClick={() => { set(value); setVisible(PAGE_SIZE); }}
      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
        current === value
          ? "bg-gradient-to-r from-[#ff6b4a] to-[#ff3d71] text-white shadow-sm"
          : "btn-ghost"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          {["all", "5", "4", "3", "2", "1"].map((v) =>
            filterBtn(v, v === "all" ? "All" : `${v}★`, ratingFilter, setRatingFilter)
          )}
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          {(["all", "google", "yelp", "facebook"] as const).map((v) =>
            filterBtn(
              v,
              v === "all" ? "All" : PLATFORM_META[v]?.label ?? v,
              platformFilter,
              setPlatformFilter
            )
          )}
        </div>
        <span className="ml-auto text-xs text-zinc-500">
          {filtered.length} {filtered.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Review list */}
      <div className="glass overflow-hidden rounded-3xl">
        {shown.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
            <p className="text-zinc-400">No reviews match the selected filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {shown.map((review) => {
              const initials = (review.reviewer_name || "A")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const meta = PLATFORM_META[review.source] ?? {
                label: review.source,
                letter: "?",
                gradient: "from-zinc-500 to-zinc-600",
              };

              return (
                <div key={review.id} className="flex items-start gap-4 px-6 py-5 transition hover:bg-white/[0.02]">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 text-sm font-bold text-orange-400">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {review.reviewer_name || "Anonymous"}
                      </span>
                      {renderStars(review.rating)}
                      {/* Platform badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white bg-gradient-to-r ${meta.gradient}`}
                      >
                        {meta.letter} {meta.label}
                      </span>
                      {sentimentBadge(review.sentiment)}
                    </div>
                    {review.review_text && (
                      <p className="mb-1 text-sm text-zinc-400">{review.review_text}</p>
                    )}
                    <p className="text-xs text-zinc-600">{relativeDate(review.fetched_at)}</p>

                    {/* Response (if any) */}
                    {review.responded && review.response_text && (
                      <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <p className="mb-1 text-xs font-medium text-zinc-400">Owner response</p>
                        <p className="text-xs text-zinc-500">{review.response_text}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show more */}
        {hasMore && (
          <div className="border-t border-white/5 px-6 py-4 text-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="btn-ghost inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm"
            >
              Show more <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
