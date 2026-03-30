/**
 * GET /api/cron/update-rankings
 *
 * Called hourly by Vercel Cron. Computes Bayesian average ratings for every
 * location and writes ranking_score, avg_rating, and review_count back to the
 * locations table.
 *
 * Bayesian formula:
 *   score = (C × m + Σratings) / (C + n)
 *   C = confidence weight (10 reviews)
 *   m = global mean rating across all rated locations
 *   n = review count for this location
 *
 * Vercel automatically sends:  Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const CONFIDENCE_WEIGHT = 10; // C — number of "virtual" reviews at the global mean

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // 1. Fetch all reviews (only the columns we need)
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("location_id, rating");

  if (reviewsError) {
    console.error("[cron/update-rankings] Failed to fetch reviews:", reviewsError);
    return NextResponse.json({ error: reviewsError.message }, { status: 500 });
  }

  // 2. Fetch all location IDs
  const { data: locations, error: locationsError } = await supabase
    .from("locations")
    .select("id");

  if (locationsError) {
    console.error("[cron/update-rankings] Failed to fetch locations:", locationsError);
    return NextResponse.json({ error: locationsError.message }, { status: 500 });
  }

  // 3. Build per-location aggregation map
  const aggMap = new Map<string, { sum: number; count: number }>();
  for (const loc of locations ?? []) {
    aggMap.set(loc.id, { sum: 0, count: 0 });
  }
  for (const r of reviews ?? []) {
    const agg = aggMap.get(r.location_id);
    if (agg) {
      agg.sum += r.rating;
      agg.count++;
    }
  }

  // 4. Compute global mean across all rated locations
  let globalSum = 0;
  let globalCount = 0;
  for (const agg of aggMap.values()) {
    globalSum += agg.sum;
    globalCount += agg.count;
  }
  const globalMean = globalCount > 0 ? globalSum / globalCount : 4.0; // default 4.0

  // 5. Build update payloads
  const updates = Array.from(aggMap.entries()).map(([id, agg]) => {
    const n = agg.count;
    const avgRating = n > 0 ? agg.sum / n : null;
    const rankingScore =
      (CONFIDENCE_WEIGHT * globalMean + agg.sum) / (CONFIDENCE_WEIGHT + n);

    return {
      id,
      review_count: n,
      avg_rating: avgRating !== null ? Math.round(avgRating * 100) / 100 : null,
      ranking_score: Math.round(rankingScore * 10000) / 10000,
    };
  });

  // 6. Upsert in batches of 500 to stay within Supabase payload limits
  const BATCH_SIZE = 500;
  let updated = 0;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const { error: upsertError } = await supabase
      .from("locations")
      .upsert(batch, { onConflict: "id" });

    if (upsertError) {
      console.error("[cron/update-rankings] Upsert error:", upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
    updated += batch.length;
  }

  console.log(
    `[cron/update-rankings] Updated ${updated} locations. Global mean: ${globalMean.toFixed(2)}`
  );

  return NextResponse.json({
    ok: true,
    updated,
    globalMean: Math.round(globalMean * 100) / 100,
    totalReviews: globalCount,
  });
}
