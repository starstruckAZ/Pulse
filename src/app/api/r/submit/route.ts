import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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

    // Validate
    if (!locationId) {
      return NextResponse.json({ error: "locationId is required" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!review_text || review_text.trim().length < 10) {
      return NextResponse.json(
        { error: "Review text must be at least 10 characters" },
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
      reviewer_name: reviewer_name?.trim() || "Anonymous",
      rating,
      review_text: review_text.trim(),
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
