/**
 * GET /api/search?q=pizza+near+Phoenix
 *
 * Searches Google Places API (Text Search) server-side so the API key
 * stays private. Cross-references results against ReviewHype locations
 * to badge claimed businesses.
 *
 * Results are sorted by a composite score:
 *   score = rating × log10(reviewCount + 1)
 * Rewards high ratings with volume. Claimed ReviewHype businesses get
 * a +0.5 boost so actively-managed profiles surface higher.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

/** Composite ranking score — higher rating × more reviews = higher rank */
function rankScore(rating: number | null, reviewCount: number, claimed: boolean): number {
  const r = rating ?? 0;
  const base = r * Math.log10(Math.max(reviewCount, 0) + 1);
  return claimed ? base + 0.5 : base;
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Search query must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (q.length > 200) {
    return NextResponse.json(
      { error: "Search query too long" },
      { status: 400 }
    );
  }

  if (!PLACES_API_KEY) {
    console.error("[api/search] GOOGLE_PLACES_API_KEY is not configured");
    return NextResponse.json(
      { error: "Search is temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
    // 1. Call Google Places Text Search
    const url = new URL(PLACES_URL);
    url.searchParams.set("query", q);
    url.searchParams.set("key", PLACES_API_KEY);

    const googleRes = await fetch(url.toString(), { cache: "no-store" });
    const googleData = await googleRes.json();

    if (googleData.status !== "OK" && googleData.status !== "ZERO_RESULTS") {
      console.error("[api/search] Google Places error:", googleData.status, googleData.error_message);
      return NextResponse.json(
        { error: "Search failed. Please try again." },
        { status: 502 }
      );
    }

    const rawResults = googleData.results ?? [];

    // 2. Build result list
    const results = rawResults.map((place: Record<string, unknown>) => ({
      place_id: place.place_id as string,
      name: place.name as string,
      address: place.formatted_address as string,
      rating: (place.rating as number) ?? null,
      review_count: (place.user_ratings_total as number) ?? 0,
      types: (place.types as string[]) ?? [],
      business_status: (place.business_status as string) ?? "UNKNOWN",
      open_now: (place.opening_hours as Record<string, unknown>)?.open_now ?? null,
      location: (place.geometry as Record<string, unknown>)?.location ?? null,
      photo_reference:
        ((place.photos as Record<string, unknown>[]) ?? [])[0]?.photo_reference ?? null,
      claimed: false,
    }));

    // 3. Cross-reference with ReviewHype locations to find claimed businesses
    const placeIds = results
      .map((r: { place_id: string }) => r.place_id)
      .filter(Boolean);

    let claimedSet = new Set<string>();
    if (placeIds.length > 0) {
      const supabase = getServiceClient();
      const { data: claimed } = await supabase
        .from("locations")
        .select("google_place_id")
        .in("google_place_id", placeIds);

      claimedSet = new Set(
        (claimed ?? []).map((r) => r.google_place_id as string)
      );
    }

    // 4. Attach claimed flag, compute rank score, sort highest first
    const enrichedResults = results
      .map((r: { place_id: string; rating: number | null; review_count: number }) => ({
        ...r,
        claimed: claimedSet.has(r.place_id),
      }))
      .sort((
        a: { rating: number | null; review_count: number; claimed: boolean },
        b: { rating: number | null; review_count: number; claimed: boolean }
      ) =>
        rankScore(b.rating, b.review_count, b.claimed) -
        rankScore(a.rating, a.review_count, a.claimed)
      );

    return NextResponse.json({
      results: enrichedResults,
      count: enrichedResults.length,
      query: q,
    });
  } catch (err) {
    console.error("[api/search] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
