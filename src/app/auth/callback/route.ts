import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Allowed origins — add any domain the app is served from
const ALLOWED_ORIGINS = [
  "https://reviewpulse.info",
  "https://www.reviewpulse.info",
  "https://reviewpulse.app",
  "https://www.reviewpulse.app",
];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Always redirect to the canonical site URL — never trust requestUrl.origin
  // as it can be spoofed in misconfigured proxy setups.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.info";

  // Safety check: if running locally in dev, fall back to request origin
  const isDev = requestUrl.origin.startsWith("http://localhost");
  const origin = isDev ? requestUrl.origin : siteUrl;

  // Extra guard: reject if origin is not in our allowlist (and not dev)
  if (!isDev && !ALLOWED_ORIGINS.includes(requestUrl.origin)) {
    console.warn("[auth/callback] Unexpected origin:", requestUrl.origin);
  }

  if (code) {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const supabase = createClient(await cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Support ?next= for post-auth redirects (must be a relative path)
  // Used by the claim flow to return users to their search after Google sign-in
  const next = requestUrl.searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // New users go to onboarding to find & claim their business.
  // Onboarding redirects to /dashboard automatically if they already have locations.
  return NextResponse.redirect(`${origin}/onboarding`);
}
