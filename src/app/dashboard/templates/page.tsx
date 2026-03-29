import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TemplatesClient from "./templates-client";

export default async function TemplatesPage() {
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

  const { data: templates } = await supabase
    .from("response_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <TemplatesClient
      user={user}
      profile={profile}
      templates={templates || []}
    />
  );
}
