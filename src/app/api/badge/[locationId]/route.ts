export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function fetchFromSupabase(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function buildSvg({
  name,
  avgRating,
  reviewCount,
  style,
}: {
  name: string;
  avgRating: number | null;
  reviewCount: number;
  style: "dark" | "light";
}): string {
  const isDark = style !== "light";

  // Colours
  const bg = isDark ? "#0f0f18" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const ratingColor = isDark ? "#ffffff" : "#111111";
  const subColor = isDark ? "#71717a" : "#6b7280";
  const coralStart = "#ff6b4a";
  const coralEnd = "#ff3d71";

  const ratingText = avgRating !== null ? avgRating.toFixed(1) : "—";
  const countText =
    reviewCount === 0
      ? "No reviews yet"
      : `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`;

  // Truncate long names so they fit inside the badge
  const maxNameLen = 26;
  const displayName =
    name.length > maxNameLen ? name.slice(0, maxNameLen - 1) + "…" : name;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="48" viewBox="0 0 200 48" role="img" aria-label="${displayName}: ${ratingText} stars, ${countText}">
  <defs>
    <linearGradient id="coral" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${coralStart}"/>
      <stop offset="100%" stop-color="${coralEnd}"/>
    </linearGradient>
    <clipPath id="pill">
      <rect width="200" height="48" rx="12"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="200" height="48" rx="12" fill="${bg}"/>
  <!-- Border -->
  <rect width="200" height="48" rx="12" fill="none" stroke="${border}" stroke-width="1"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="4" height="48" rx="2" fill="url(#coral)" clip-path="url(#pill)"/>

  <!-- Star icon -->
  <g transform="translate(14, 14)">
    <polygon
      points="10,2 12.4,7.6 18.5,8.2 14,12.2 15.4,18.2 10,15 4.6,18.2 6,12.2 1.5,8.2 7.6,7.6"
      fill="url(#coral)"
      transform="scale(0.95) translate(0.5, 0)"
    />
  </g>

  <!-- Rating number -->
  <text x="34" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="${ratingColor}">${ratingText}</text>

  <!-- Review count -->
  <text x="34" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" fill="${subColor}">${countText}</text>

  <!-- Divider -->
  <line x1="115" y1="10" x2="115" y2="38" stroke="${border}" stroke-width="1"/>

  <!-- ReviewPulse branding -->
  <text x="122" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="600" fill="url(#coral)">ReviewPulse</text>
  <text x="122" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="${subColor}">Verified Reviews</text>
</svg>`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style") === "light" ? "light" : "dark";

  // Fetch location
  const locations = await fetchFromSupabase(
    `locations?id=eq.${encodeURIComponent(locationId)}&select=id,name&limit=1`
  );

  if (!locations || locations.length === 0) {
    // Return a "not found" badge instead of a hard error
    const svg = buildSvg({
      name: "Business",
      avgRating: null,
      reviewCount: 0,
      style,
    });
    return new Response(svg, {
      status: 404,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const location = locations[0];

  // Fetch reviews (only id and rating needed)
  const reviews = await fetchFromSupabase(
    `reviews?location_id=eq.${encodeURIComponent(locationId)}&select=rating`
  );

  const reviewList: { rating: number }[] = reviews ?? [];
  const reviewCount = reviewList.length;
  const avgRating =
    reviewCount > 0
      ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  const svg = buildSvg({
    name: location.name as string,
    avgRating: avgRating !== null ? Math.round(avgRating * 10) / 10 : null,
    reviewCount,
    style,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
