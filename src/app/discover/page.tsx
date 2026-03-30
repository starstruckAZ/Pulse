import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { MapPin, MessageSquare, Star, Building2, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Reviews Directory — ReviewPulse",
  description:
    "Discover top-rated local businesses in your city. Browse reviews from Google, Yelp, and Facebook — all in one place.",
};

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
  user_id: string;
}

interface ReviewRow {
  location_id: string;
  rating: number;
}

interface ProfileRow {
  id: string;
  business_type?: string | null;
}

function parseCity(address: string): string {
  if (!address) return "Unknown";
  // "123 Main St, San Francisco, CA 94102" → "San Francisco"
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    // Third-to-last is city when there's street, city, state [zip]
    return parts[parts.length - 2] || parts[0];
  }
  if (parts.length === 2) return parts[0];
  return address;
}

export default async function DiscoverPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";
  const supabase = getSupabase();

  // Fetch all locations
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, address, user_id");

  const allLocations: LocationRow[] = locations ?? [];

  // Fetch all reviews (just rating + location_id for aggregation)
  const locationIds = allLocations.map((l) => l.id);
  let reviews: ReviewRow[] = [];
  if (locationIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("location_id, rating")
      .in("location_id", locationIds);
    reviews = data ?? [];
  }

  // Fetch profiles for business_type
  const userIds = [...new Set(allLocations.map((l) => l.user_id))];
  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, business_type")
      .in("id", userIds);
    profiles = data ?? [];
  }
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Build rating lookup per location
  const ratingsByLocation = new Map<string, number[]>();
  reviews.forEach((r) => {
    const arr = ratingsByLocation.get(r.location_id) ?? [];
    arr.push(r.rating);
    ratingsByLocation.set(r.location_id, arr);
  });

  // Group by city
  const cityMap = new Map<
    string,
    { count: number; ratingSum: number; ratingCount: number }
  >();

  allLocations.forEach((loc) => {
    const city = parseCity(loc.address);
    const ratings = ratingsByLocation.get(loc.id) ?? [];
    const existing = cityMap.get(city) ?? { count: 0, ratingSum: 0, ratingCount: 0 };
    existing.count++;
    existing.ratingSum += ratings.reduce((a, b) => a + b, 0);
    existing.ratingCount += ratings.length;
    cityMap.set(city, existing);
  });

  const cities = Array.from(cityMap.entries())
    .map(([city, data]) => ({
      city,
      count: data.count,
      avgRating:
        data.ratingCount > 0
          ? (data.ratingSum / data.ratingCount).toFixed(1)
          : null,
    }))
    .sort((a, b) => b.count - a.count);

  // Unique business types
  const businessTypes = [
    ...new Set(
      profiles
        .map((p) => p.business_type)
        .filter((t): t is string => Boolean(t))
    ),
  ].sort();

  // JSON-LD BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Business Directory",
        item: `${siteUrl}/discover`,
      },
    ],
  };

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
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display hidden sm:inline">ReviewPulse</span>
          </Link>
          <Link
            href="/signup"
            className="btn-primary rounded-2xl px-5 py-2 text-sm"
          >
            List your business
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        {/* Hero */}
        <div className="mb-12 text-center">
          <span className="badge mb-4 text-[#ff6b4a] border-[rgba(255,107,74,0.25)] bg-[rgba(255,107,74,0.05)]">
            <Building2 className="h-3.5 w-3.5" />
            Business Directory
          </span>
          <h1 className="font-display mb-4 text-4xl font-bold sm:text-5xl md:text-6xl">
            Discover <span className="gradient-text">Top-Rated</span> Businesses
          </h1>
          <p className="mx-auto max-w-xl text-zinc-400">
            Browse verified reviews from Google, Yelp, and Facebook across{" "}
            <span className="font-semibold text-white">{allLocations.length}</span>{" "}
            local businesses in{" "}
            <span className="font-semibold text-white">{cities.length}</span> cities.
          </p>
        </div>

        {/* Summary stat cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Businesses", value: allLocations.length, icon: Building2 },
            { label: "Cities Covered", value: cities.length, icon: MapPin },
            {
              label: "Total Reviews",
              value: reviews.length,
              icon: Star,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bento p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b4a]/15 to-[#ff3d71]/15">
                <Icon className="h-5 w-5 text-[#ff6b4a]" />
              </div>
              <p className="font-display text-3xl font-bold gradient-text">{value}</p>
              <p className="mt-1 text-sm text-zinc-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Cities */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#ff6b4a]" />
            <h2 className="font-display text-2xl font-bold">Browse by City</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map(({ city, count, avgRating }) => (
              <Link
                key={city}
                href={`/discover/${encodeURIComponent(city)}`}
                className="bento group flex items-center justify-between p-5 transition"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold group-hover:text-[#ff6b4a] transition-colors">
                    {city}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
                    <span>
                      {count} {count === 1 ? "business" : "businesses"}
                    </span>
                    {avgRating && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                          {avgRating} avg
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 transition group-hover:text-[#ff6b4a] group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* Business types */}
        {businessTypes.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#ff6b4a]" />
              <h2 className="font-display text-2xl font-bold">Browse by Category</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {businessTypes.map((type) => (
                <span
                  key={type}
                  className="badge text-zinc-300 border-white/8 bg-white/3 text-sm capitalize"
                >
                  {type}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="glass rounded-3xl border-[rgba(255,107,74,0.12)] p-10 text-center">
          <h3 className="font-display mb-2 text-xl font-bold">
            Is your business missing?
          </h3>
          <p className="mb-6 text-zinc-400">
            Join ReviewPulse to manage your reviews, respond with AI, and grow your reputation.
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm"
          >
            List your business — it&apos;s free
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
