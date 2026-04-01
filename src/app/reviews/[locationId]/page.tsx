import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";
import ReviewsClient from "./reviews-client";

export const dynamic = "force-dynamic";

// Use service role to bypass RLS for public review pages
function createPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface PageProps {
  params: Promise<{ locationId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locationId } = await params;
  const supabase = createPublicSupabase();

  const { data: location } = await supabase
    .from("locations")
    .select("name, address")
    .eq("id", locationId)
    .single();

  if (!location) {
    return { title: "Location Not Found" };
  }

  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("location_id", locationId);

  const reviewCount = count ?? 0;

  return {
    title: `${location.name} Reviews`,
    description: `Read ${reviewCount} review${reviewCount !== 1 ? "s" : ""} for ${location.name}${location.address ? ` at ${location.address}` : ""}. See ratings, feedback, and customer experiences.`,
    openGraph: {
      title: `${location.name} Reviews | ReviewHype`,
      description: `${reviewCount} review${reviewCount !== 1 ? "s" : ""} for ${location.name}. See what customers are saying.`,
    },
  };
}

interface ReviewRow {
  id: string;
  source: string;
  rating: number;
  reviewer_name: string | null;
  review_text: string | null;
  review_url: string | null;
  sentiment: string;
  created_at: string;
  fetched_at: string;
}

export default async function PublicReviewsPage({ params }: PageProps) {
  const { locationId } = await params;
  const supabase = createPublicSupabase();

  // Fetch location
  const { data: location, error: locError } = await supabase
    .from("locations")
    .select("id, name, address")
    .eq("id", locationId)
    .single();

  if (locError || !location) {
    notFound();
  }

  // Fetch all reviews for this location
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("location_id", locationId)
    .order("rating", { ascending: false })
    .order("fetched_at", { ascending: false });

  const allReviews: ReviewRow[] = (reviews as ReviewRow[]) || [];

  // Calculate stats
  const totalCount = allReviews.length;
  const avgRating =
    totalCount > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;

  // Rating breakdown: count per star
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allReviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating]++;
    }
  });

  return (
    <div className="relative z-10 min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              Review<span className="gradient-text">Hype</span>
            </span>
          </Link>
          <Link
            href="/signup"
            className="btn-primary rounded-xl px-4 py-2 text-sm"
          >
            Get ReviewHype Free
          </Link>
        </div>
      </nav>

      {/* Mesh gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="mesh-gradient absolute -top-40 left-1/4 h-[500px] w-[500px] bg-[#ff6b4a]/20" />
        <div className="mesh-gradient absolute top-1/3 right-0 h-[400px] w-[400px] bg-[#ff3d71]/10" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="mb-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {location.name}
          </h1>
          {location.address && (
            <p className="mb-6 flex items-center justify-center gap-1.5 text-[var(--text-secondary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location.address}
            </p>
          )}

          {/* Average Rating Display */}
          <div className="glass mx-auto inline-flex items-center gap-6 rounded-2xl px-8 py-5">
            <div className="text-center">
              <div className="font-display text-5xl font-bold gradient-text">
                {totalCount > 0 ? avgRating.toFixed(1) : "--"}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">avg rating</div>
            </div>
            <div className="h-12 w-px bg-[var(--border)]" />
            <div className="text-center">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(avgRating) ? "#ff6b4a" : "none"}
                    stroke={star <= Math.round(avgRating) ? "#ff6b4a" : "var(--text-muted)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {totalCount} review{totalCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </section>

        {/* Rating Breakdown */}
        <section className="bento mx-auto mb-12 max-w-md p-6">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Rating Breakdown
          </h2>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star];
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-right font-medium text-[var(--text-secondary)]">
                    {star}<span className="text-[var(--text-muted)]">&#9733;</span>
                  </span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff3d71] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-[var(--text-muted)]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reviews List (client component for interactivity) */}
        <ReviewsClient
          reviews={allReviews}
          locationName={location.name}
          ratingCounts={ratingCounts}
          totalCount={totalCount}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="gradient-line mb-8" />
          <p className="mb-2 text-sm text-[var(--text-muted)]">
            Powered by
          </p>
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-lg font-semibold tracking-tight">
              Review<span className="gradient-text">Hype</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Manage all your reviews in one place. Response templates. Sentiment tracking.
          </p>
          <Link
            href="/signup"
            className="btn-primary mt-6 inline-block rounded-xl px-6 py-3 text-sm"
          >
            Start Free &mdash; No Credit Card
          </Link>
        </div>
      </footer>
    </div>
  );
}
