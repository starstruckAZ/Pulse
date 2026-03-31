import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { locationId: string };
}) {
  // Fetch location data via Supabase REST API (edge-compatible)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  const [locationRes, reviewsRes] = await Promise.all([
    fetch(
      `${supabaseUrl}/rest/v1/locations?id=eq.${params.locationId}&select=name,address&limit=1`,
      { headers }
    ),
    fetch(
      `${supabaseUrl}/rest/v1/reviews?location_id=eq.${params.locationId}&select=rating`,
      { headers }
    ),
  ]);

  const locations: { name: string; address?: string | null }[] =
    await locationRes.json();
  const reviews: { rating: number }[] = await reviewsRes.json();

  const location = locations[0];
  const businessName = location?.name ?? "Business Profile";
  const address = location?.address ?? "";

  const totalCount = reviews.length;
  const avgRating =
    totalCount > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / totalCount
      : 0;
  const avgDisplay = avgRating > 0 ? avgRating.toFixed(1) : "—";

  // Build star row: 5 stars, filled vs empty based on rounded rating
  const roundedRating = Math.round(avgRating);
  const stars = [1, 2, 3, 4, 5].map((i) => i <= roundedRating);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#050508",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,107,74,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,61,113,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #ff6b4a, #ff3d71)",
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "52px 64px 40px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #ff6b4a, #ff3d71)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              ✦
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.3px",
              }}
            >
              ReviewHype
            </span>
          </div>

          {/* Business name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "32px",
            }}
          >
            {address ? (
              <div
                style={{
                  fontSize: "17px",
                  color: "#71717a",
                  fontWeight: 500,
                  letterSpacing: "0.2px",
                }}
              >
                📍 {address}
              </div>
            ) : null}
            <div
              style={{
                fontSize: businessName.length > 30 ? "52px" : "64px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.05,
                letterSpacing: "-1.5px",
                maxWidth: "760px",
              }}
            >
              {businessName}
            </div>
          </div>

          {/* Rating section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              marginTop: "36px",
            }}
          >
            {/* Big rating number */}
            <div
              style={{
                fontSize: "96px",
                fontWeight: 900,
                background: "linear-gradient(135deg, #ff6b4a, #ff3d71)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: 1,
                letterSpacing: "-3px",
              }}
            >
              {avgDisplay}
            </div>

            {/* Stars + count */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "6px" }}>
                {stars.map((filled, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: "36px",
                      color: filled ? "#fb923c" : "#3f3f46",
                      lineHeight: 1,
                    }}
                  >
                    ★
                  </div>
                ))}
              </div>

              {/* Review count */}
              <div
                style={{
                  fontSize: "20px",
                  color: "#a1a1aa",
                  fontWeight: 500,
                }}
              >
                {totalCount > 0
                  ? `${totalCount} review${totalCount !== 1 ? "s" : ""} across Google, Yelp & Facebook`
                  : "No reviews yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 64px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              color: "#52525b",
              fontWeight: 500,
            }}
          >
            reviewpulse.app
          </span>
          <span
            style={{
              fontSize: "14px",
              color: "#3f3f46",
            }}
          >
            Reputation management for modern businesses
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
