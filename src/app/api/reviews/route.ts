import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const locationId = searchParams.get("location_id");
    const sentiment = searchParams.get("sentiment");
    const source = searchParams.get("source");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Join with locations to ensure we only return reviews for user's locations
    let query = supabase
      .from("reviews")
      .select("*, locations!inner(id, name, address)", { count: "exact" })
      .eq("locations.user_id", user.id);

    if (locationId) {
      query = query.eq("location_id", locationId);
    }
    if (sentiment) {
      query = query.eq("sentiment", sentiment);
    }
    if (source) {
      query = query.eq("source", source);
    }
    if (rating) {
      query = query.eq("rating", parseInt(rating, 10));
    }

    // Sorting
    switch (sort) {
      case "oldest":
        query = query.order("fetched_at", { ascending: true });
        break;
      case "rating-high":
        query = query.order("rating", { ascending: false });
        break;
      case "rating-low":
        query = query.order("rating", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("fetched_at", { ascending: false });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit, offset });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, response_text } = body as {
      id: string;
      response_text?: string;
    };

    if (!id) {
      return NextResponse.json(
        { error: "Review id is required" },
        { status: 400 }
      );
    }

    // Verify ownership: the review must belong to a location owned by the user
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("id, locations!inner(user_id)")
      .eq("id", id)
      .eq("locations.user_id", user.id)
      .single();

    if (fetchError || !review) {
      return NextResponse.json(
        { error: "Review not found or access denied" },
        { status: 404 }
      );
    }

    // Build update payload with only provided fields
    const updates: Record<string, unknown> = {};
    if (response_text !== undefined) {
      updates.response_text = response_text;
      updates.responded = true;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("PATCH /api/reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
