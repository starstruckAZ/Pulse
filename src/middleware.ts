import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refresh the session on every request so the access token stays valid.
  // IMPORTANT: do not add any logic between createClient and getUser —
  // the middleware must return supabaseResponse for cookies to work.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico   (browser icon)
     * - public assets (images, fonts, etc.)
     * - api/r/submit  (public review submission — no session needed)
     * - api/badge     (public badge endpoint)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)|api/r/submit|api/badge).*)",
  ],
};
