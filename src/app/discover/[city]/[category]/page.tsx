import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, MessageSquare, ChevronRight, Building2 } from "lucide-react";
import type { Metadata } from "next";
import { CATEGORIES, getCategoryBySlug, getCategoryLabel } from "@/lib/categories";

export const revalidate = 3600; // ISR: re-render at most every hour

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function parseCityFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) return parts[parts.length - 2] ?? "";
  if (parts.length === 2) return parts[0];
  return "";
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Allow new city+category paths to be rendered on demand (ISR)
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-seed the most popular city+category combos at build time.
  // If env vars aren't available (CI without secrets), return empty —
  // pages will still be generated on first request via ISR.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("locations")
      .select("city, address, category")
      .neq("listed", false)
      .not("category", "is", null);

    const seen = new Set<string>();
    const paths: { city: string; category: string }[] = [];

    for (const loc of data ?? []) {
      const rawCity =
        (loc.city as string | null)?.trim() ||
        parseCityFromAddress(loc.address ?? "");
      const cat = loc.category as string | null;
      if (!rawCity || !cat) continue;
      const key = `${rawCity.toLowerCase()}__${cat}`;
      if (!seen.has(key)) {
        seen.add(key);
        paths.push({ city: encodeURIComponent(rawCity.toLowerCase()), category: cat });
      }
    }

    return paths;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}): Promise<Metadata> {
  const { city, category } = await params;
  const cityName = toTitleCase(decodeURIComponent(city));
  const catLabel = getCategoryLabel(category);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";
  return {
    title: `Top ${catLabel} Businesses in ${cityName}`,
    description: `Find the highest-rated ${catLabel.toLowerCase()} businesses in ${cityName}, ranked by verified customer reviews from Google, Yelp, and Facebook.`,
    alternates: {
      canonical: `${siteUrl}/discover/${encodeURIComponent(city)}/${category}`,
    },
  };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating)
              ? "fill-[#f9d377] text-[#f9d377]"
              : "text-[#e1dcd8]"
          }`}
        />
      ))}
    </div>
  );
}

export default async function CityCategoryPage({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city, category } = await params;
  const citySlug = decodeURIComponent(city).toLowerCase();
  const cityName = toTitleCase(citySlug);
  const catInfo = getCategoryBySlug(category);
  const catLabel = catInfo?.label ?? category;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";

  const supabase = getSupabase();

  const { data: locationsData } = await supabase
    .from("locations")
    .select("id, name, city, address, category, ranking_score, avg_rating, review_count")
    .neq("listed", false)
    .eq("category", category)
    .or(`city.ilike.${citySlug},address.ilike.%${citySlug}%`);

  // Precise city match
  const locations = (locationsData ?? []).filter((loc) => {
    const explicitCity = (loc.city as string | null)?.toLowerCase().trim();
    if (explicitCity) return explicitCity === citySlug;
    return parseCityFromAddress(loc.address ?? "").toLowerCase() === citySlug;
  });

  if (locations.length === 0) notFound();

  // Sort by Bayesian ranking score
  const ranked = [...locations].sort((a, b) => {
    const scoreA = (a.ranking_score as number | null) ?? (a.avg_rating as number | null) ?? 0;
    const scoreB = (b.ranking_score as number | null) ?? (b.avg_rating as number | null) ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return ((b.review_count as number) ?? 0) - ((a.review_count as number) ?? 0);
  });

  // Other categories in this city (for cross-linking)
  const { data: siblingData } = await supabase
    .from("locations")
    .select("category")
    .neq("listed", false)
    .not("category", "is", null)
    .or(`city.ilike.${citySlug},address.ilike.%${citySlug}%`);

  const siblingCategories = [
    ...new Set(
      (siblingData ?? []).map((l) => l.category as string).filter(Boolean)
    ),
  ].filter((c) => c !== category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top ${catLabel} in ${cityName}`,
    url: `${siteUrl}/discover/${encodeURIComponent(citySlug)}/${category}`,
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
        ...(biz.avg_rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: (biz.avg_rating as number).toFixed(1),
                reviewCount: biz.review_count ?? 0,
              },
            }
          : {}),
      },
    })),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-[#797674] flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 text-[#302e2d] font-semibold">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#aa2c32] to-[#ff7574]">
                <MessageSquare className="h-3 w-3 text-white" />
              </div>
              ReviewHype
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/discover" className="transition hover:text-[#302e2d]">
              Directory
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/discover/${encodeURIComponent(citySlug)}`}
              className="transition hover:text-[#302e2d]"
            >
              {cityName}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#302e2d] font-medium">{catLabel}</span>
          </div>
          <Link href="/signup" className="btn-primary rounded-xl px-5 py-2 text-sm">
            List your business
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-14">
        {/* Header */}
        <div className="mb-10">
          {catInfo && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e1dcd8] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#797674]">
              <span>{catInfo.icon}</span>
              {catLabel}
            </div>
          )}
          <h1 className="font-headline mb-2 text-4xl font-bold italic text-[#302e2d] sm:text-5xl">
            Top{" "}
            <span className="gradient-text not-italic">{catLabel}</span>
            <br />
            in {cityName}
          </h1>
          <p className="text-[#797674]">
            <span className="font-semibold text-[#302e2d]">{ranked.length}</span>{" "}
            {ranked.length === 1 ? "business" : "businesses"} — ranked by
            verified customer reviews
          </p>
        </div>

        {/* Category sibling pills */}
        {siblingCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href={`/discover/${encodeURIComponent(citySlug)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e1dcd8] bg-white px-4 py-1.5 text-xs font-semibold text-[#5d5b59] transition hover:border-[#aa2c32] hover:text-[#aa2c32]"
            >
              All
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#aa2c32] bg-[#aa2c32] px-4 py-1.5 text-xs font-semibold text-white">
              {catInfo?.icon} {catLabel}
            </span>
            {siblingCategories.slice(0, 6).map((slug) => {
              const cat = CATEGORIES.find((c) => c.slug === slug);
              if (!cat) return null;
              return (
                <Link
                  key={slug}
                  href={`/discover/${encodeURIComponent(citySlug)}/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e1dcd8] bg-white px-4 py-1.5 text-xs font-semibold text-[#5d5b59] transition hover:border-[#aa2c32] hover:text-[#aa2c32]"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Ranked list */}
        <div className="space-y-3">
          {ranked.map((biz, i) => {
            const avgRating = biz.avg_rating as number | null;
            const reviewCount = (biz.review_count as number) ?? 0;

            return (
              <div key={biz.id} className="bento flex items-center gap-4 p-5">
                {/* Rank badge */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    i === 0
                      ? "bg-[#f9d377] text-[#735801]"
                      : i === 1
                      ? "bg-[#e1dcd8] text-[#5d5b59]"
                      : i === 2
                      ? "bg-[#f5f0ed] text-[#797674]"
                      : "bg-[#f5f0ed] text-[#b0acaa]"
                  }`}
                >
                  #{i + 1}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h2 className="font-headline font-semibold text-[#302e2d] leading-tight">
                    {biz.name}
                  </h2>
                  {biz.address && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-[#797674]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{biz.address}</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="shrink-0 text-right">
                  {avgRating !== null && reviewCount > 0 ? (
                    <>
                      <StarRow rating={avgRating} />
                      <p className="mt-1 text-sm font-bold text-[#302e2d]">
                        {avgRating.toFixed(1)}
                        <span className="ml-1 text-xs font-normal text-[#797674]">
                          ({reviewCount})
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#b0acaa]">No reviews yet</p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/business/${biz.id}`}
                  className="btn-ghost hidden shrink-0 rounded-xl px-4 py-2 text-sm sm:block"
                >
                  View Profile
                </Link>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl bg-[#f5f0ed] p-8 text-center">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-[#aa2c32]" />
          <h3 className="font-headline mb-1 text-lg font-bold text-[#302e2d]">
            Own a {catLabel.toLowerCase()} business in {cityName}?
          </h3>
          <p className="mb-5 text-sm text-[#5d5b59]">
            Get listed and climb the rankings with ReviewHype. Free to start.
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm"
          >
            Add your business — free
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#e1dcd8] bg-white py-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#797674] transition hover:text-[#302e2d]"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#aa2c32] to-[#ff7574]">
            <MessageSquare className="h-3 w-3 text-white" />
          </div>
          Powered by ReviewHype
        </Link>
      </footer>
    </div>
  );
}
