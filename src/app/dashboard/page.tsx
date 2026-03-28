import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
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

  // Get reviews
  const locationIds = (locations || []).map((l) => l.id);

  let reviews: any[] = [];
  if (locationIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .in("location_id", locationIds)
      .order("fetched_at", { ascending: false })
      .limit(20);
    reviews = data || [];
  }

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "—";

  const respondedCount = reviews.filter((r: any) => r.responded).length;
  const responseRate =
    reviews.length > 0
      ? Math.round((respondedCount / reviews.length) * 100)
      : 0;

  return (
    <DashboardClient
      user={user}
      profile={profile}
      locations={locations || []}
      reviews={reviews}
      avgRating={avgRating}
      responseRate={responseRate}
    />
  );
}
