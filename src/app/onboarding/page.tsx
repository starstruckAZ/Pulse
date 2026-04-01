import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(await cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If user already has locations, skip onboarding
  const { data: locations } = await supabase
    .from("locations")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (locations && locations.length > 0) {
    redirect("/dashboard");
  }

  const hasGoogle =
    user.identities?.some((i) => i.provider === "google") ||
    user.app_metadata?.provider === "google" ||
    (user.app_metadata?.providers as string[] | undefined)?.includes("google") ||
    false;

  const googleName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    null;

  return (
    <OnboardingClient
      user={{ email: user.email }}
      hasGoogle={hasGoogle}
      googleName={googleName}
    />
  );
}
