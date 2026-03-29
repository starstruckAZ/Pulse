import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(await cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_name, full_name, business_type, phone, website, plan, created_at")
    .eq("id", user.id)
    .single();

  return (
    <SettingsClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
    />
  );
}
