/**
 * POST /api/claim
 *
 * Claims a business by creating a location entry linked to the user's
 * account. Security pipeline:
 *
 *   1. Authenticated user (JWT)
 *   2. User must have signed in with Google OAuth
 *   3. User's Google email domain is cross-checked against the business
 *      website domain (from Google Places) when available. If the business
 *      has no website, or the domains don't match, the claim goes into
 *      "pending" status for manual review.
 *   4. Business must not already be claimed (unique google_place_id)
 *   5. User is within their location quota
 *
 * Body: { place_id, name, address, city?, category? }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/** Fetch the business website + name from Google Places Details API */
async function getPlaceDetails(placeId: string) {
  if (!PLACES_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,website,url&key=${PLACES_API_KEY}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data.status !== "OK") return null;
    return data.result as { name?: string; website?: string; url?: string };
  } catch {
    return null;
  }
}

/** Extract domain from URL: "https://www.joespizza.com/menu" → "joespizza.com" */
function extractDomain(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    // Strip "www." prefix
    return host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Extract domain from email: "owner@joespizza.com" → "joespizza.com" */
function emailDomain(email: string): string | null {
  const parts = email.toLowerCase().split("@");
  if (parts.length !== 2) return null;
  return parts[1];
}

/** Check if the user's email domain matches the business website domain */
function domainsMatch(userEmail: string, businessWebsite: string): boolean {
  const emailDom = emailDomain(userEmail);
  const bizDom = extractDomain(businessWebsite);
  if (!emailDom || !bizDom) return false;
  return emailDom === bizDom;
}

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

    // Get the user's Google email (from identity data or user email)
    const googleEmail =
      (googleIdentity?.identity_data?.email as string) || user.email || "";

    // Reject free email domains (gmail, yahoo, etc.) from auto-verification
    const freeEmailDomains = [
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
    ];
    const userDomain = emailDomain(googleEmail);
    const isFreeDomain = freeEmailDomains.includes(userDomain || "");

    // 3. Parse and validate body
    const body = await request.json();
    const { place_id, name, address, city, category } = body as {
      place_id?: string;
      name?: string;
      address?: string;
      city?: string;
      category?: string;
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
          error: "This business has already been claimed on ReviewPulse.",
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

    // 6. Verify ownership via domain matching
    //    - Fetch business website from Google Places
    //    - Compare the user's email domain to the business website domain
    //    - If they match → auto-verified
    //    - If no website, or domains don't match, or user has free email → pending review
    const placeDetails = await getPlaceDetails(place_id);
    const businessWebsite = placeDetails?.website || null;

    let verified = false;
    let verificationNote = "";

    if (businessWebsite && !isFreeDomain) {
      // User has a business email — check if it matches the website domain
      if (domainsMatch(googleEmail, businessWebsite)) {
        verified = true;
        verificationNote = `Email domain (${userDomain}) matches business website (${extractDomain(businessWebsite)})`;
      } else {
        verificationNote = `Email domain (${userDomain}) does not match business website (${extractDomain(businessWebsite)})`;
      }
    } else if (isFreeDomain) {
      verificationNote = `User has a free email provider (${userDomain}). Manual verification needed.`;
    } else {
      verificationNote = "Business has no website listed on Google. Manual verification needed.";
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
        listed: verified, // Only show in directory if auto-verified
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
      ? `Successfully claimed "${name.trim()}"! Your email domain matches the business website — you're verified.`
      : `Claim submitted for "${name.trim()}"! Since we couldn't automatically verify ownership, your claim is pending review. You can still access your dashboard.`;

    return NextResponse.json(
      {
        success: true,
        location,
        verified,
        message,
      },
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
