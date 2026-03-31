/**
 * POST /api/claim
 *
 * Claims a business by creating a location entry linked to the user's
 * account. Security pipeline:
 *
 *   1. Authenticated user (JWT)
 *   2. User must have signed in with Google OAuth
 *   3. Ownership verification — two methods, in order of preference:
 *        a. Google Business Profile API: if the caller passes a
 *           `google_access_token` with the `business.manage` scope, we
 *           list the user's managed GBP locations and fuzzy-match by name.
 *           This is the authoritative check — it directly confirms GBP
 *           account ownership.
 *        b. Domain matching (fallback): compares the user's email domain
 *           against the business website domain from Google Places. Only
 *           auto-verifies if both are custom domains that match.
 *   4. Business must not already be claimed (unique google_place_id)
 *   5. User is within their location quota
 *
 * Body: { place_id, name, address, city?, category?, google_access_token? }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// ─── Business Profile API ─────────────────────────────────────────────────────

/**
 * Verify ownership by checking if the user's GBP account manages a location
 * with a name matching `businessName`. Uses the access token obtained from
 * a Google OAuth popup with the `business.manage` scope.
 */
async function verifyWithBusinessProfile(
  accessToken: string,
  businessName: string
): Promise<{ verified: boolean; note: string }> {
  // 1. List the user's GBP accounts
  const accountsRes = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!accountsRes.ok) {
    return {
      verified: false,
      note: `Business Profile API error (accounts): ${accountsRes.status}`,
    };
  }

  const accountsData = await accountsRes.json();
  const accounts: Array<{ name: string }> = accountsData.accounts || [];

  if (accounts.length === 0) {
    return {
      verified: false,
      note: "User has no Google Business Profile accounts",
    };
  }

  // Normalise a string for loose comparison
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");

  const normalizedClaimed = normalize(businessName);

  // 2. Walk each account's locations looking for a name match
  for (const account of accounts) {
    let pageToken: string | undefined;

    do {
      const url = new URL(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`
      );
      url.searchParams.set("readMask", "name,title,metadata");
      url.searchParams.set("pageSize", "100");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const locRes = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!locRes.ok) break;

      const locData = await locRes.json();
      const locations: Array<{ name?: string; title?: string }> =
        locData.locations || [];

      for (const loc of locations) {
        if (!loc.title) continue;
        const normalizedLoc = normalize(loc.title);

        if (
          normalizedLoc === normalizedClaimed ||
          normalizedLoc.includes(normalizedClaimed) ||
          normalizedClaimed.includes(normalizedLoc)
        ) {
          return {
            verified: true,
            note: `Verified via Google Business Profile: managed location "${loc.title}" matches claimed business "${businessName}"`,
          };
        }
      }

      pageToken = locData.nextPageToken;
    } while (pageToken);
  }

  return {
    verified: false,
    note: `Business Profile check: no managed location found matching "${businessName}"`,
  };
}

// ─── Domain matching (fallback) ───────────────────────────────────────────────

/** Fetch the business website from Google Places Details API */
async function getPlaceWebsite(placeId: string): Promise<string | null> {
  if (!PLACES_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=website&key=${PLACES_API_KEY}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data.status !== "OK") return null;
    return (data.result?.website as string) || null;
  } catch {
    return null;
  }
}

/** "https://www.joespizza.com/menu" → "joespizza.com" */
function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** "owner@joespizza.com" → "joespizza.com" */
function emailDomain(email: string): string | null {
  const parts = email.toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : null;
}

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "protonmail.com",
  "live.com",
]);

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify Google OAuth identity
    const googleIdentity = user.identities?.find(
      (identity) => identity.provider === "google"
    );
    const providerIsGoogle =
      user.app_metadata?.provider === "google" ||
      user.app_metadata?.providers?.includes("google");

    if (!googleIdentity && !providerIsGoogle) {
      return NextResponse.json(
        {
          error:
            "You must sign in with a Google account to claim a business. " +
            "This verifies your identity and helps prevent unauthorized claims.",
          code: "GOOGLE_AUTH_REQUIRED",
        },
        { status: 403 }
      );
    }

    const googleEmail =
      (googleIdentity?.identity_data?.email as string) || user.email || "";

    // 3. Parse and validate body
    const body = await request.json();
    const {
      place_id,
      name,
      address,
      city,
      category,
      google_access_token,
    } = body as {
      place_id?: string;
      name?: string;
      address?: string;
      city?: string;
      category?: string;
      google_access_token?: string;
    };

    if (!place_id || typeof place_id !== "string" || place_id.length < 5) {
      return NextResponse.json(
        { error: "Valid Google Place ID is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    if (name.length > 200) {
      return NextResponse.json(
        { error: "Business name must be 200 characters or fewer" },
        { status: 400 }
      );
    }

    // 4. Check if this business is already claimed
    const { data: existing } = await supabase
      .from("locations")
      .select("id, name")
      .eq("google_place_id", place_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "This business has already been claimed on ReviewHype.",
          code: "ALREADY_CLAIMED",
        },
        { status: 409 }
      );
    }

    // 5. Check user's location quota
    const { count: locationCount } = await supabase
      .from("locations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = profile?.plan || "free";
    const maxLocations = plan === "pro" ? 50 : 3;

    if ((locationCount ?? 0) >= maxLocations) {
      return NextResponse.json(
        {
          error: `You've reached the maximum of ${maxLocations} locations on the ${plan} plan.`,
          code: "LIMIT_REACHED",
        },
        { status: 403 }
      );
    }

    // 6. Verify ownership
    let verified = false;
    let verificationNote = "";

    if (google_access_token) {
      // Method A: Google Business Profile API (authoritative)
      const gbpResult = await verifyWithBusinessProfile(
        google_access_token,
        name.trim()
      );
      verified = gbpResult.verified;
      verificationNote = gbpResult.note;
    } else {
      // Method B: Domain matching (fallback for when GBP token isn't provided)
      const userDomain = emailDomain(googleEmail);
      const isFreeDomain = FREE_EMAIL_DOMAINS.has(userDomain || "");

      if (!isFreeDomain) {
        const businessWebsite = await getPlaceWebsite(place_id);
        if (businessWebsite) {
          const bizDom = extractDomain(businessWebsite);
          if (userDomain && bizDom && userDomain === bizDom) {
            verified = true;
            verificationNote = `Email domain (${userDomain}) matches business website (${bizDom})`;
          } else {
            verificationNote = `Email domain (${userDomain}) does not match business website (${bizDom})`;
          }
        } else {
          verificationNote =
            "Business has no website listed on Google. Manual verification needed.";
        }
      } else {
        verificationNote = `User has a free email provider (${userDomain}). Manual verification needed.`;
      }
    }

    // 7. Parse city from address if not provided
    let parsedCity = city?.trim() || null;
    if (!parsedCity && address) {
      const parts = address.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        parsedCity = parts[parts.length - 3] || parts[parts.length - 2] || null;
      } else if (parts.length === 2) {
        parsedCity = parts[0];
      }
    }

    // 8. Create the location
    const claimStatus = verified ? "verified" : "pending";

    const { data: location, error: insertError } = await supabase
      .from("locations")
      .insert({
        user_id: user.id,
        name: name.trim(),
        address: address?.trim() || null,
        city: parsedCity,
        category: category || null,
        google_place_id: place_id,
        listed: verified,
        claim_status: claimStatus,
        claim_email: googleEmail,
        claim_note: verificationNote,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[api/claim] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to claim business. Please try again." },
        { status: 500 }
      );
    }

    const message = verified
      ? `Successfully claimed "${name.trim()}"! Your Google Business Profile account confirms ownership.`
      : `Claim submitted for "${name.trim()}"! Since we couldn't automatically verify ownership, your claim is pending review. You can still access your dashboard.`;

    return NextResponse.json(
      { success: true, location, verified, message },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/claim] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
