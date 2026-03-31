/**
 * POST /api/gbp/locations
 *
 * Given a Google access token with the `business.manage` scope, returns
 * all business locations the user manages via Google Business Profile,
 * enriched with Google Maps Place IDs where we can find them.
 *
 * Body: { access_token: string }
 * Response: { locations: GBPLocation[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface GBPLocation {
  gbp_name: string;          // GBP resource name e.g. accounts/123/locations/456
  title: string;             // business display name
  address: string | null;
  place_id: string | null;   // Google Maps Place ID (may be null if lookup fails)
  maps_uri: string | null;
}

/** Search Google Places to find the Place ID for a business by name + address */
async function findPlaceId(
  businessName: string,
  address: string | null
): Promise<string | null> {
  if (!PLACES_API_KEY) return null;

  const query = address
    ? `${businessName} ${address}`
    : businessName;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=place_id,name&key=${PLACES_API_KEY}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data.status === "OK" && data.candidates?.[0]?.place_id) {
      return data.candidates[0].place_id as string;
    }
    return null;
  } catch {
    return null;
  }
}

/** Flatten a GBP storefront address into a single string */
function flattenAddress(addr: Record<string, unknown> | undefined): string | null {
  if (!addr) return null;
  const lines: string[] = (addr.addressLines as string[] | undefined) || [];
  const city = (addr.locality as string) || "";
  const state = (addr.administrativeArea as string) || "";
  const zip = (addr.postalCode as string) || "";
  return [...lines, city, state, zip].filter(Boolean).join(", ") || null;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Require authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { access_token } = body as { access_token?: string };

    if (!access_token || typeof access_token !== "string") {
      return NextResponse.json(
        { error: "access_token is required" },
        { status: 400 }
      );
    }

    // 1. List accounts
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!accountsRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Google Business Profile accounts", locations: [] },
        { status: 200 }
      );
    }

    const accountsData = await accountsRes.json();
    const accounts: Array<{ name: string }> = accountsData.accounts || [];

    const results: GBPLocation[] = [];

    // 2. For each account, list locations
    for (const account of accounts) {
      let pageToken: string | undefined;

      do {
        const url = new URL(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`
        );
        url.searchParams.set(
          "readMask",
          "name,title,storefrontAddress,metadata"
        );
        url.searchParams.set("pageSize", "100");
        if (pageToken) url.searchParams.set("pageToken", pageToken);

        const locRes = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!locRes.ok) break;

        const locData = await locRes.json();
        const locations: Array<{
          name?: string;
          title?: string;
          storefrontAddress?: Record<string, unknown>;
          metadata?: { mapsUri?: string };
        }> = locData.locations || [];

        // 3. Enrich with Place IDs (parallel, capped at 5 concurrent)
        const enriched = await Promise.all(
          locations.map(async (loc) => {
            const title = loc.title || "Unknown Business";
            const address = flattenAddress(loc.storefrontAddress);
            const mapsUri = loc.metadata?.mapsUri || null;
            const placeId = await findPlaceId(title, address);

            return {
              gbp_name: loc.name || "",
              title,
              address,
              place_id: placeId,
              maps_uri: mapsUri,
            } satisfies GBPLocation;
          })
        );

        results.push(...enriched);
        pageToken = locData.nextPageToken;
      } while (pageToken);
    }

    // Filter out any already claimed by this user
    const placeIds = results
      .map((r) => r.place_id)
      .filter((id): id is string => !!id);

    let claimedPlaceIds = new Set<string>();
    if (placeIds.length > 0) {
      const { data: claimed } = await supabase
        .from("locations")
        .select("google_place_id")
        .eq("user_id", user.id)
        .in("google_place_id", placeIds);

      claimedPlaceIds = new Set(
        (claimed || [])
          .map((c) => c.google_place_id)
          .filter((id): id is string => !!id)
      );
    }

    const unclaimed = results.filter(
      (r) => !r.place_id || !claimedPlaceIds.has(r.place_id)
    );

    return NextResponse.json({ locations: unclaimed });
  } catch (err) {
    console.error("[api/gbp/locations]", err);
    return NextResponse.json(
      { error: "Internal server error", locations: [] },
      { status: 500 }
    );
  }
}
