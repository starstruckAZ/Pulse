/**
 * POST /api/claim
 *
 * Claims a business by creating a location entry linked to the user's
 * account. Requires:
 *   1. Authenticated user
 *   2. User must have signed in with Google OAuth (verified via identity)
 *   3. Business must not already be claimed (unique google_place_id)
 *
 * Body: { place_id, name, address, city? }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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
    const hasGoogleIdentity = user.identities?.some(
      (identity) => identity.provider === "google"
    );
    const providerIsGoogle =
      user.app_metadata?.provider === "google" ||
      user.app_metadata?.providers?.includes("google");

    if (!hasGoogleIdentity && !providerIsGoogle) {
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

    // 5. Check user's location quota (free plan: 3 locations)
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

    // 6. Parse city from address if not provided
    let parsedCity = city?.trim() || null;
    if (!parsedCity && address) {
      const parts = address.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        // "123 Main St, Phoenix, AZ 85001, USA" → "Phoenix"
        // Try second-to-last segment (skip country if present)
        parsedCity = parts[parts.length - 3] || parts[parts.length - 2] || null;
      } else if (parts.length === 2) {
        parsedCity = parts[0];
      }
    }

    // 7. Create the location
    const { data: location, error: insertError } = await supabase
      .from("locations")
      .insert({
        user_id: user.id,
        name: name.trim(),
        address: address?.trim() || null,
        city: parsedCity,
        category: category || null,
        google_place_id: place_id,
        listed: true,
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

    return NextResponse.json(
      {
        success: true,
        location,
        message: `Successfully claimed "${name.trim()}"! You can now manage reviews from your dashboard.`,
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
