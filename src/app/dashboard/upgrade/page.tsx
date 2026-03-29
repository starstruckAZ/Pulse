import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UpgradeClient from "./upgrade-client";

export default async function UpgradePage() {
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

  return (
    <UpgradeClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
    />
  );
}
