import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, MessageSquare, ChevronRight, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface LocationRow {
  id: string;
  name: string;
  address: string;
}

interface ReviewRow {
  location_id: string;
  rating: number;
  responded: boolean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return {
    title: `Best-reviewed Businesses in ${cityName} — ReviewPulse`,
    description: `Browse top-rated local businesses in ${cityName}. Real reviews from Google, Yelp, and Facebook — all in one place.`,
  };
}

export default async function CityDiscoverPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";

  // Fetch locations where address contains city name (case-insensitive)
  const supabase = getSupabase();

  const { data: locationsData } = await supabase
    .from("locations")
    .select("id, name, address")
    .ilike("address", `%${cityName}%`);

  const locations: LocationRow[] = locationsData ?? [];

  if (locations.length === 0) notFound();

  // Fetch ratings for all matching locations
  const locationIds = locations.map((l) => l.id);
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("location_id, rating, responded")
    .in("location_id", locationIds);

  const reviews: ReviewRow[] = reviewsData ?? [];

  // Build per-location aggregation
  const aggMap = new Map<
    string,
    { ratings: number[]; responded: number }
  >();
  locationIds.forEach((id) => aggMap.set(id, { ratings: [], responded: 0 }));
  reviews.forEach((r) => {
    const agg = aggMap.get(r.location_id);
    if (agg) {
      agg.ratings.push(r.rating);
      if (r.responded) agg.responded++;
    }
  });

  // Build ranked business list sorted by avg rating desc, then review count desc
  const ranked = locations
    .map((loc) => {
      const agg = aggMap.get(loc.id) ?? { ratings: [], responded: 0 };
      const count = agg.ratings.length;
      const avg =
        count > 0
          ? agg.ratings.reduce((a, b) => a + b, 0) / count
          : 0;
      return { ...loc, reviewCount: count, avgRating: avg };
    })
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return b.reviewCount - a.reviewCount;
    });

  // JSON-LD ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Businesses in ${cityName}`,
    url: `${siteUrl}/discover/${encodeURIComponent(cityName)}`,
    numberOfItems: ranked.length,
    itemListElement: ranked.slice(0, 10).map((biz, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: biz.name,
      url: `${siteUrl}/business/${biz.id}`,
      item: {
        "@type": "LocalBusiness",
        name: biz.name,
        address: biz.address,
        ...(biz.reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: biz.avgRating.toFixed(1),
                reviewCount: biz.reviewCount,
              },
            }
          : {}),
      },
    })),
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.round(rating)
              ? "fill-orange-400 text-orange-400"
              : "text-zinc-700"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen dot-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background blobs */}
      <div className="mesh-gradient fixed left-1/4 top-0 h-[500px] w-[500px] bg-[#ff6b4a] opacity-[0.04]" />
      <div className="mesh-gradient fixed right-1/4 top-1/3 h-[400px] w-[400px] bg-[#ff3d71] opacity-[0.03]" />

      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display hidden sm:inline">ReviewPulse</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <Link
              href="/discover"
              className="text-sm text-zinc-500 transition hover:text-white"
            >
              Directory
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-sm text-zinc-300">{cityName}</span>
          </div>
          <Link href="/signup" className="btn-primary rounded-2xl px-5 py-2 text-sm">
            List your business
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-14">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/discover" className="transition hover:text-white">
              Directory
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-300">{cityName}</span>
          </div>
          <h1 className="font-display mb-3 text-3xl font-bold sm:text-4xl md:text-5xl">
            Best Businesses in{" "}
            <span className="gradient-text">{cityName}</span>
          </h1>
          <p className="text-zinc-400">
            <span className="font-semibold text-white">{ranked.length}</span>{" "}
            verified {ranked.length === 1 ? "business" : "businesses"} — ranked
            by average review rating
          </p>
        </div>

        {/* Ranked list */}
        <div className="space-y-4">
          {ranked.map((biz, i) => (
            <div key={biz.id} className="bento flex items-center gap-5 p-5">
              {/* Rank */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-sm font-bold text-zinc-500">
                #{i + 1}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold leading-tight">
                  {biz.name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {biz.address}
                  </span>
                </div>
              </div>

              {/* Rating block */}
              <div className="shrink-0 text-right">
                {biz.reviewCount > 0 ? (
                  <>
                    <div className="flex items-center justify-end gap-1">
                      {renderStars(biz.avgRating)}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {biz.avgRating.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-zinc-500">
                        ({biz.reviewCount})
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-zinc-600">No reviews yet</p>
                )}
              </div>

              {/* CTA */}
              <Link
                href={`/business/${biz.id}`}
                className="btn-ghost shrink-0 rounded-2xl px-4 py-2 text-sm"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>

        {/* "Is your business here?" banner */}
        <div className="mt-10 glass rounded-3xl border-[rgba(255,107,74,0.12)] p-8 text-center">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-[#ff6b4a]" />
          <h3 className="font-display mb-1 text-lg font-bold">
            Is your business in {cityName}?
          </h3>
          <p className="mb-5 text-sm text-zinc-400">
            Get listed and start managing your online reputation with ReviewPulse.
            It&apos;s free to get started.
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm"
          >
            Add your business — free
          </Link>
        </div>
      </main>

      <footer className="glass mt-8 border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-zinc-400">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
            <MessageSquare className="h-2.5 w-2.5 text-white" />
          </div>
          Powered by ReviewPulse
        </Link>
      </footer>
    </div>
  );
}
