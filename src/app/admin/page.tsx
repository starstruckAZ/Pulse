import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./admin-client";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check admin role from app_metadata
  const isAdmin = user.app_metadata?.role === "admin";
  if (!isAdmin) redirect("/dashboard");

  // Use service role to fetch all data
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all profiles
  const { data: profiles } = await adminSupabase
    .from("profiles")
    .select("id, business_name, full_name, email, plan, created_at")
    .order("created_at", { ascending: false });

  // Fetch all locations
  const { data: locations } = await adminSupabase
    .from("locations")
    .select("id, name, address, user_id, created_at");

  // Fetch review counts per user (aggregate)
  const { data: reviews } = await adminSupabase
    .from("reviews")
    .select("id, location_id, rating, sentiment, created_at, reviewer_name, review_text");

  // Fetch all auth users to get last sign in
  const authRes = await fetch(
    process.env.NEXT_PUBLIC_SUPABASE_URL +
      "/auth/v1/admin/users?page=1&per_page=100",
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
    }
  );
  const authData = await authRes.json();
  const authUsers = authData.users || [];

  return (
    <AdminClient
      currentUser={user}
      profiles={profiles || []}
      locations={locations || []}
      reviews={reviews || []}
      authUsers={authUsers}
    />
  );
}
