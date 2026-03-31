import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, CheckCircle, MessageSquare } from "lucide-react";
import BusinessReviewsClient from "./business-reviews-client";

export const dynamic = "force-dynamic";

// Use service role to bypass RLS for public profile pages
const createPublicClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

interface Location {
  id: string;
  name: string;
  address?: string | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locationId: string }> }) {
  const { locationId } = await params;
  const supabase = createPublicClient();

  const { data: location } = await supabase
    .from("locations")
    .select("name, address")
    .eq("id", locationId)
    .single();

  if (!location) {
    return { title: "Business Not Found — ReviewHype" };
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("location_id", locationId);

  const count = reviews?.length ?? 0;
  const avg =
    count > 0
      ? ((reviews ?? []).reduce((s, r) => s + r.rating, 0) / count).toFixed(1)
      : null;

  const description = avg
    ? `${location.name} has a ${avg}-star average rating based on ${count} review${count !== 1 ? "s" : ""}. See all reviews on ReviewHype.`
    : `See reviews for ${location.name} on ReviewHype.`;

  return {
    title: `${location.name} — Reviews`,
    description,
    openGraph: {
      title: `${location.name} — Reviews`,
      description,
      type: "website",
    },
  };
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const supabase = createPublicClient();

  // Fetch location
  const { data: location } = await supabase
    .from("locations")
    .select("id, name, address")
    .eq("id", locationId)
    .single<Location>();

  if (!location) notFound();

  // Fetch ALL reviews ordered by rating desc
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("location_id", locationId)
    .order("rating", { ascending: false });

  const reviews: Review[] = (allReviews as Review[]) ?? [];

  // Featured reviews: use the `featured` flag if present, otherwise fall back to rating >= 4
  // Note: Run this SQL in Supabase: ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
  const featuredReviews = reviews.filter((r) =>
    r.featured === true ? true : r.featured === undefined || r.featured === null ? r.rating >= 4 : false
  );

  // ── Calculations ──────────────────────────────────────────────────────────
  const totalCount = reviews.length;
  const avgRating =
    totalCount > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / totalCount
      : 0;

  // Per-star distribution
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) starCounts[r.rating]++;
  });

  // Platform breakdown
  const platforms = ["google", "yelp", "facebook"] as const;
  type Platform = (typeof platforms)[number];
  const platformData: Record<Platform, { count: number; sum: number }> = {
    google: { count: 0, sum: 0 },
    yelp: { count: 0, sum: 0 },
    facebook: { count: 0, sum: 0 },
  };
  reviews.forEach((r) => {
    const src = r.source as Platform;
    if (platformData[src]) {
      platformData[src].count++;
      platformData[src].sum += r.rating;
    }
  });

  const respondedCount = reviews.filter((r) => r.responded).length;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const renderStars = (rating: number, size = "h-5 w-5") => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(rating) ? "fill-orange-400 text-orange-400" : "text-zinc-700"}`}
        />
      ))}
    </div>
  );

  const platformMeta: Record<Platform, { label: string; letter: string; gradient: string }> = {
    google: { label: "Google", letter: "G", gradient: "from-blue-500 to-blue-600" },
    yelp: { label: "Yelp", letter: "Y", gradient: "from-red-500 to-red-600" },
    facebook: { label: "Facebook", letter: "F", gradient: "from-indigo-500 to-indigo-600" },
  };

  const addressLine = location.address ?? "";

  // ── JSON-LD structured data ───────────────────────────────────────────────
  const top5Reviews = reviews.slice(0, 5);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: location.name,
    ...(addressLine ? { address: addressLine } : {}),
    ...(totalCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: totalCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    ...(top5Reviews.length > 0
      ? {
          review: top5Reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.reviewer_name || "Anonymous" },
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            ...(r.review_text ? { reviewBody: r.review_text } : {}),
          })),
        }
      : {}),
  };

  return (
    <div className="min-h-screen dot-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background blobs */}
      <div className="mesh-gradient fixed left-1/4 top-0 h-[500px] w-[500px] bg-[#ff6b4a] opacity-[0.04]" />
      <div className="mesh-gradient fixed right-1/4 top-1/4 h-[400px] w-[400px] bg-[#ff3d71] opacity-[0.03]" />

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display hidden sm:inline">ReviewHype</span>
          </Link>
          <Link
            href="/signup"
            className="btn-primary rounded-2xl px-5 py-2 text-sm"
          >
            Get your free profile
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <span className="badge text-emerald-400 border-emerald-500/20 bg-emerald-500/8">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified Business
            </span>
          </div>
          <h1 className="font-display mb-3 text-4xl font-bold sm:text-5xl md:text-6xl gradient-text">
            {location.name}
          </h1>
          {addressLine && (
            <p className="flex items-center justify-center gap-1.5 text-zinc-400">
              <MapPin className="h-4 w-4 text-zinc-500" />
              {addressLine}
            </p>
          )}
        </div>

        {/* ── Rating Hero ───────────────────────────────────────────────────── */}
        <div className="bento mb-8 p-8 text-center">
          <p className="font-display mb-1 text-7xl font-bold gradient-text">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </p>
          <div className="mb-2 flex justify-center">
            {renderStars(avgRating, "h-7 w-7")}
          </div>
          <p className="mb-3 text-zinc-400">
            Based on{" "}
            <span className="font-semibold text-white">{totalCount}</span>{" "}
            {totalCount === 1 ? "review" : "reviews"}
            {respondedCount > 0 && (
              <> · <span className="text-emerald-400">{respondedCount} responded</span></>
            )}
          </p>
          <p className="text-xs text-zinc-600">Powered by ReviewHype</p>
        </div>

        {/* ── Platform Breakdown + Rating Distribution ─────────────────────── */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* Platform cards */}
          <div className="bento p-6">
            <h2 className="font-display mb-4 font-semibold text-zinc-300">Reviews by Platform</h2>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((p) => {
                const d = platformData[p];
                const avg = d.count > 0 ? (d.sum / d.count).toFixed(1) : "—";
                const meta = platformMeta[p];
                return (
                  <div
                    key={p}
                    className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center"
                  >
                    <div
                      className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-sm font-bold text-white`}
                    >
                      {meta.letter}
                    </div>
                    <p className="text-xs text-zinc-500">{meta.label}</p>
                    <p className="font-display font-bold text-white">{d.count}</p>
                    <p className="text-xs text-orange-400">{avg} ★</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating distribution */}
          <div className="bento p-6">
            <h2 className="font-display mb-4 font-semibold text-zinc-300">Rating Distribution</h2>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star] ?? 0;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-right text-xs text-zinc-500">{star}</span>
                    <Star className="h-3.5 w-3.5 shrink-0 fill-orange-400 text-orange-400" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff3d71] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-zinc-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Featured Reviews ──────────────────────────────────────────────── */}
        {featuredReviews.length > 0 && (
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
              <h2 className="font-display text-xl font-bold">Customer Favorites</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredReviews.slice(0, 6).map((review) => {
                const initials = (review.reviewer_name || "A")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const src = review.source as Platform;
                const meta = platformMeta[src] ?? { label: review.source, letter: "?", gradient: "from-zinc-500 to-zinc-600" };
                return (
                  <div key={review.id} className="bento flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 text-sm font-bold text-orange-400">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {review.reviewer_name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {renderStars(review.rating, "h-3.5 w-3.5")}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${meta.gradient} bg-opacity-20 text-white`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="line-clamp-3 text-sm text-zinc-400">{review.review_text}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── All Reviews (client component for filtering) ──────────────────── */}
        <BusinessReviewsClient reviews={reviews} featuredReviews={featuredReviews} />

        {/* ── Footer CTA ───────────────────────────────────────────────────── */}
        <div className="mt-12 glass rounded-3xl border-[rgba(255,107,74,0.1)] p-10 text-center">
          <h3 className="font-display mb-2 text-xl font-bold">Is this your business?</h3>
          <p className="mb-6 text-zinc-400">
            Claim your profile on ReviewHype and start responding to reviews, tracking sentiment, and growing your reputation.
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm"
          >
            Claim your free profile
          </Link>
        </div>
      </main>

      {/* ── Sticky Footer ─────────────────────────────────────────────────── */}
      <footer className="glass mt-8 border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-zinc-400">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
            <MessageSquare className="h-2.5 w-2.5 text-white" />
          </div>
          Powered by ReviewHype
        </Link>
      </footer>
    </div>
  );
}
