/**
 * GET /api/discover/cities?q=phoenix
 *
 * Returns a list of cities that have at least one listed location,
 * optionally filtered by a search query. Used for city autocomplete
 * on the /discover landing page.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Parse city from a formatted address string as a fallback */
function parseCityFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) return parts[parts.length - 2] ?? "";
  if (parts.length === 2) return parts[0];
  return "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const supabase = getServiceClient();

  // Fetch all listed locations with city + address for grouping
  const { data, error } = await supabase
    .from("locations")
    .select("id, city, address, review_count, avg_rating")
    .neq("listed", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build city aggregation
  const cityMap = new Map<
    string,
    { count: number; ratingSum: number; ratingCount: number }
  >();

  for (const loc of data ?? []) {
    const cityName = (loc.city as string | null)?.trim() || parseCityFromAddress(loc.address ?? "");
    if (!cityName) continue;

    const key = cityName.toLowerCase();
    const existing = cityMap.get(key) ?? { count: 0, ratingSum: 0, ratingCount: 0 };
    existing.count++;
    if (loc.avg_rating) {
      existing.ratingSum += loc.avg_rating;
      existing.ratingCount++;
    }
    cityMap.set(key, existing);
  }

  // Convert to array and apply search filter
  let cities = Array.from(cityMap.entries()).map(([key, agg]) => ({
    slug: key,
    display: key.replace(/\b\w/g, (c) => c.toUpperCase()), // Title Case
    count: agg.count,
    avgRating:
      agg.ratingCount > 0
        ? Math.round((agg.ratingSum / agg.ratingCount) * 10) / 10
        : null,
  }));

  if (q) {
    cities = cities.filter((c) => c.slug.includes(q));
  }

  // Sort by business count desc
  cities.sort((a, b) => b.count - a.count);

  return NextResponse.json({ cities: cities.slice(0, 50) });
}
