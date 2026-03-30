"use client";

import { useState, useMemo } from "react";

interface Review {
  id: string;
  source: string;
  rating: number;
  reviewer_name: string | null;
  review_text: string | null;
  review_url: string | null;
  sentiment: string;
  fetched_at: string;
}

interface ReviewsClientProps {
  reviews: Review[];
  locationName: string;
  ratingCounts: Record<number, number>;
  totalCount: number;
}

const REVIEWS_PER_PAGE = 10;

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  if (diffWeek > 0) return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  return "just now";
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function sentimentColor(sentiment: string): string {
  switch (sentiment?.toLowerCase()) {
    case "positive":
      return "border-emerald-500/20 bg-emerald-500/8 text-emerald-400";
    case "negative":
      return "border-red-500/20 bg-red-500/8 text-red-400";
    case "neutral":
    case "mixed":
    default:
      return "border-amber-500/20 bg-amber-500/8 text-amber-400";
  }
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#ff6b4a" : "none"}
          stroke={star <= rating ? "#ff6b4a" : "var(--text-muted)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsClient({
  reviews,
  locationName,
  ratingCounts,
  totalCount,
}: ReviewsClientProps) {
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  const filteredReviews = useMemo(() => {
    if (activeFilter === null) return reviews;
    return reviews.filter((r) => r.rating === activeFilter);
  }, [reviews, activeFilter]);

  const displayedReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  const filterButtons = [
    { label: "All", value: null, count: totalCount },
    { label: "5 Star", value: 5, count: ratingCounts[5] },
    { label: "4 Star", value: 4, count: ratingCounts[4] },
    { label: "3 Star", value: 3, count: ratingCounts[3] },
    { label: "2 Star", value: 2, count: ratingCounts[2] },
    { label: "1 Star", value: 1, count: ratingCounts[1] },
  ];

  return (
    <section>
      {/* Filter Buttons */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => {
              setActiveFilter(btn.value);
              setVisibleCount(REVIEWS_PER_PAGE);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === btn.value
                ? "btn-primary"
                : "btn-ghost"
            }`}
          >
            {btn.label}
            <span className="ml-1.5 text-xs opacity-60">({btn.count})</span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {displayedReviews.length === 0 ? (
        <div className="bento p-12 text-center">
          <p className="text-[var(--text-muted)]">
            {activeFilter !== null
              ? `No ${activeFilter}-star reviews yet.`
              : "No reviews yet for this location."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <article key={review.id} className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-3)] text-sm font-semibold text-[var(--text-secondary)]">
                  {getInitials(review.reviewer_name)}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Header row */}
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-medium text-[var(--text)]">
                      {review.reviewer_name || "Anonymous"}
                    </span>
                    <StarDisplay rating={review.rating} />
                    <span className="text-xs text-[var(--text-muted)]">
                      {relativeTime(review.fetched_at)}
                    </span>
                    {review.sentiment && (
                      <span
                        className={`badge text-[0.65rem] ${sentimentColor(review.sentiment)}`}
                      >
                        {review.sentiment}
                      </span>
                    )}
                    {review.source && (
                      <span className="badge text-[0.65rem] text-[var(--text-muted)]">
                        {review.source}
                      </span>
                    )}
                  </div>

                  {/* Review text */}
                  {review.review_text && (
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {review.review_text}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Show More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + REVIEWS_PER_PAGE)}
            className="btn-ghost rounded-xl px-6 py-3 text-sm"
          >
            Show More Reviews
            <span className="ml-1.5 text-xs opacity-60">
              ({filteredReviews.length - visibleCount} remaining)
            </span>
          </button>
        </div>
      )}

      {/* Review count summary */}
      {filteredReviews.length > 0 && (
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Showing {Math.min(visibleCount, filteredReviews.length)} of{" "}
          {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
          {activeFilter !== null ? ` (${activeFilter}-star)` : ""} for {locationName}
        </p>
      )}
    </section>
  );
}
