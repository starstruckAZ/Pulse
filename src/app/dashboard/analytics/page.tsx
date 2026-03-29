import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(await cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get locations
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("user_id", user.id);

  // Get all reviews for user
  const locationIds = (locations || []).map((l: { id: string }) => l.id);

  interface ReviewRow {
    id: string;
    location_id: string;
    reviewer_name: string | null;
    review_text: string | null;
    rating: number;
    sentiment: string;
    source: string;
    status: string;
    created_at: string;
    fetched_at: string;
  }

  let reviews: ReviewRow[] = [];
  if (locationIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select(
        "id, location_id, reviewer_name, review_text, rating, sentiment, source, status, created_at, fetched_at"
      )
      .in("location_id", locationIds)
      .order("fetched_at", { ascending: false });
    reviews = (data as ReviewRow[]) || [];
  }

  return (
    <AnalyticsClient
      user={user}
      profile={profile}
      locations={locations || []}
      reviews={reviews}
    />
  );
}
