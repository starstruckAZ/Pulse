import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LocationsClient from "./locations-client";

export default async function LocationsPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(await cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch review counts per location
  const locationIds = (locations || []).map((l: { id: string }) => l.id);
  let reviewCounts: Record<string, number> = {};

  if (locationIds.length > 0) {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("location_id")
      .in("location_id", locationIds);

    if (reviews) {
      reviewCounts = reviews.reduce(
        (acc: Record<string, number>, r: { location_id: string }) => {
          acc[r.location_id] = (acc[r.location_id] || 0) + 1;
          return acc;
        },
        {}
      );
    }
  }

  return (
    <LocationsClient
      user={user}
      profile={profile}
      locations={locations || []}
      reviewCounts={reviewCounts}
    />
  );
}
