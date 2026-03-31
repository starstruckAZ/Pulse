import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { MapPin, MessageSquare, Star, Building2, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import CitySearch, { type CityOption } from "./city-search";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Directory — Find Top-Rated Local Businesses",
  description:
    "Search by city to discover top-ranked local businesses. Browse verified reviews from Google, Yelp, and Facebook — all in one place.",
};

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

export default async function DiscoverPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";
  const supabase = getSupabase();

  // Fetch listed locations with pre-computed stats
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, city, address, category, review_count, avg_rating")
    .neq("listed", false);

  const allLocations = locations ?? [];

  // Build city aggregation
  const cityMap = new Map<
    string,
    { count: number; ratingSum: number; ratingCount: number }
  >();

  for (const loc of allLocations) {
    const rawCity =
      (loc.city as string | null)?.trim() ||
      parseCityFromAddress(loc.address ?? "");
    if (!rawCity) continue;
    const key = rawCity.toLowerCase();
    const existing = cityMap.get(key) ?? { count: 0, ratingSum: 0, ratingCount: 0 };
    existing.count++;
    if (loc.avg_rating) {
      existing.ratingSum += loc.avg_rating;
      existing.ratingCount++;
    }
    cityMap.set(key, existing);
  }

  const cities: CityOption[] = Array.from(cityMap.entries())
    .map(([slug, agg]) => ({
      slug,
      display: toTitleCase(slug),
      count: agg.count,
      avgRating:
        agg.ratingCount > 0
          ? Math.round((agg.ratingSum / agg.ratingCount) * 10) / 10
          : null,
    }))
    .sort((a, b) => b.count - a.count);

  const featuredCities = cities.slice(0, 9);
  const totalReviews = allLocations.reduce(
    (sum, loc) => sum + (loc.review_count as number ?? 0),
    0
  );

  // Active categories (ones that have at least one business)
  const activeCategorySlugs = new Set(
    allLocations
      .map((l) => l.category as string | null)
      .filter((c): c is string => Boolean(c))
  );
  const activeCategories = CATEGORIES.filter((c) =>
    activeCategorySlugs.has(c.slug)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Business Directory",
        item: `${siteUrl}/discover`,
      },
    ],
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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#aa2c32] to-[#ff7574]">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-headline italic text-lg font-semibold text-[#302e2d]">
              ReviewHype
            </span>
          </Link>
          <Link
            href="/signup"
            className="btn-primary rounded-xl px-5 py-2 text-sm"
          >
            List your business
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e1dcd8] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#aa2c32]">
            <Building2 className="h-3.5 w-3.5" />
            Business Directory
          </div>
          <h1 className="font-headline mb-4 text-5xl font-bold italic tracking-tight text-[#302e2d] sm:text-6xl md:text-7xl">
            Find the Best<br />
            <span className="gradient-text not-italic">Local Businesses</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-[#5d5b59] text-lg">
            Search by city to see top-ranked, verified businesses near you —
            ranked by real customer reviews.
          </p>

          {/* Search */}
          <CitySearch cities={cities} />
        </div>

        {/* Stats strip */}
        <div className="mb-14 grid grid-cols-3 divide-x divide-[#e1dcd8] rounded-2xl border border-[#e1dcd8] bg-white text-center">
          {[
            { label: "Businesses Listed", value: allLocations.length },
            { label: "Cities Covered", value: cities.length },
            { label: "Reviews Tracked", value: totalReviews },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-5">
              <p className="font-headline text-3xl font-bold text-[#aa2c32]">
                {value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#797674]">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Featured cities */}
        {featuredCities.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#aa2c32]" />
                <h2 className="font-headline text-2xl font-bold text-[#302e2d]">
                  Browse by City
                </h2>
              </div>
              {cities.length > 9 && (
                <span className="text-sm text-[#797674]">
                  +{cities.length - 9} more cities
                </span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/discover/${encodeURIComponent(city.slug)}`}
                  className="bento group flex items-center justify-between p-5"
                >
                  <div>
                    <h3 className="font-semibold text-[#302e2d] group-hover:text-[#aa2c32] transition-colors">
                      {city.display}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#797674]">
                      <span>
                        {city.count}{" "}
                        {city.count === 1 ? "business" : "businesses"}
                      </span>
                      {city.avgRating && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-[#f9d377] text-[#f9d377]" />
                            {city.avgRating} avg
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#b0acaa] transition group-hover:text-[#aa2c32] group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Browse by category */}
        {activeCategories.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#aa2c32]" />
              <h2 className="font-headline text-2xl font-bold text-[#302e2d]">
                Browse by Category
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeCategories.map((cat) => (
                <span
                  key={cat.slug}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e1dcd8] bg-white px-4 py-2 text-sm font-medium text-[#5d5b59] transition hover:border-[#aa2c32] hover:text-[#aa2c32]"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-3xl bg-[#f5f0ed] p-10 text-center">
          <h3 className="font-headline mb-2 text-2xl font-bold text-[#302e2d]">
            Is your business missing?
          </h3>
          <p className="mb-6 text-[#5d5b59]">
            Join ReviewHype to manage your reviews, respond with AI, and get listed in this directory.
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm"
          >
            List your business — it&apos;s free
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
