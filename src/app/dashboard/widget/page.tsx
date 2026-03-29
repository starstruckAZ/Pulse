import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import WidgetClient from "./widget-client";

export default async function WidgetPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(await cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_name, full_name, plan")
    .eq("id", user.id)
    .single();

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <WidgetClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
      locations={locations || []}
    />
  );
}
