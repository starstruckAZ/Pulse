import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Strip all HTML/script tags to prevent stored XSS */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { locationId, reviewer_name, rating, review_text } = body as {
      locationId?: string;
      reviewer_name?: string;
      rating?: number;
      review_text?: string;
    };

    // Validate locationId format before touching the DB
    if (!locationId || !UUID_RE.test(locationId)) {
      return NextResponse.json({ error: "Invalid locationId" }, { status: 400 });
    }

    // Rating must be a whole number 1–5
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be a whole number between 1 and 5" }, { status: 400 });
    }

    // Sanitize & validate text fields
    const cleanName = stripHtml(reviewer_name ?? "").slice(0, 100) || "Anonymous";
    const cleanText = stripHtml(review_text ?? "");

    if (cleanText.length < 10) {
      return NextResponse.json(
        { error: "Review text must be at least 10 characters" },
        { status: 400 }
      );
    }
    if (cleanText.length > 2000) {
      return NextResponse.json(
        { error: "Review text must be 2000 characters or fewer" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Verify location exists
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("id", locationId)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Determine sentiment from rating
    const sentiment =
      rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";

    const { error: insertError } = await supabase.from("reviews").insert({
      location_id: locationId,
      reviewer_name: cleanName,
      rating,
      review_text: cleanText,
      source: "direct",
      sentiment,
      responded: false,
      fetched_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to insert review:", insertError);
      return NextResponse.json(
        { error: "Failed to save review. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/r/submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
