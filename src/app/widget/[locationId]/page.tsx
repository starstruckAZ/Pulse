import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{
    theme?: string;
    limit?: string;
    minRating?: string;
    showStars?: string;
    showDates?: string;
  }>;
}

export default async function WidgetEmbedPage({ params, searchParams }: PageProps) {
  const { locationId } = await params;
  const query = await searchParams;

  const theme = query.theme === "light" ? "light" : "dark";
  const limit = Math.min(Math.max(parseInt(query.limit || "5") || 5, 1), 20);
  const minRating = Math.min(Math.max(parseInt(query.minRating || "1") || 1, 1), 5);
  const showStars = query.showStars !== "false";
  const showDates = query.showDates !== "false";

  // Public widget — no auth context needed.
  // NOTE: RLS policies on reviews/locations tables may need updating to allow
  // anonymous read access for specific location_ids used in public widgets.
  // Consider adding a policy like:
  //   CREATE POLICY "Allow public widget read" ON reviews FOR SELECT
  //   USING (location_id IN (SELECT id FROM locations WHERE widget_enabled = true));
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: location } = await supabase
    .from("locations")
    .select("id, name")
    .eq("id", locationId)
    .single();

  if (!location) {
    return (
      <html>
        <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
          <div style={{ padding: 40, textAlign: "center", color: "#71717a" }}>
            <p>Widget not found.</p>
          </div>
        </body>
      </html>
    );
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, review_text, created_at")
    .eq("location_id", locationId)
    .gte("rating", minRating)
    .order("created_at", { ascending: false })
    .limit(limit);

  const reviewList = reviews || [];
  const avgRating =
    reviewList.length > 0
      ? (reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length).toFixed(1)
      : null;

  // Color tokens based on theme
  const t = {
    bg: theme === "dark" ? "#09090b" : "#ffffff",
    cardBg: theme === "dark" ? "#18181b" : "#f9fafb",
    border: theme === "dark" ? "#27272a" : "#e5e7eb",
    text: theme === "dark" ? "#fafafa" : "#18181b",
    textMuted: theme === "dark" ? "#a1a1aa" : "#71717a",
    textFaint: theme === "dark" ? "#52525b" : "#a1a1aa",
    starFill: "#fb923c",
    starEmpty: theme === "dark" ? "#3f3f46" : "#d4d4d8",
    accent: "#ff6b4a",
  };

  const renderStars = (rating: number) => (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= rating ? t.starFill : "none"}
          stroke={i <= rating ? t.starFill : t.starEmpty}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );

  const renderBigStars = (rating: number) => (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? t.starFill : "none"}
          stroke={i <= Math.round(rating) ? t.starFill : t.starEmpty}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );

  const truncate = (text: string, maxLen: number) =>
    text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "..." : text;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: transparent; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function notifyParent() {
                var h = document.getElementById('rp-root').scrollHeight;
                window.parent.postMessage({ type: 'reviewpulse-resize', height: h }, '*');
              }
              window.addEventListener('load', notifyParent);
              window.addEventListener('resize', notifyParent);
            `,
          }}
        />
      </head>
      <body>
        <div
          id="rp-root"
          style={{
            background: t.bg,
            borderRadius: 16,
            border: `1px solid ${t.border}`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}
            >
              {location.name}
            </h2>
            {avgRating && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {renderBigStars(Number(avgRating))}
                <span
                  style={{
                    fontSize: 14,
                    color: t.textMuted,
                  }}
                >
                  {avgRating} average &middot; {reviewList.length} review
                  {reviewList.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Reviews */}
          {reviewList.length === 0 ? (
            <div
              style={{
                padding: "40px 24px",
                textAlign: "center",
                color: t.textMuted,
                fontSize: 14,
              }}
            >
              No reviews yet.
            </div>
          ) : (
            <div>
              {reviewList.map((review, idx) => (
                <div
                  key={review.id}
                  style={{
                    padding: "16px 24px",
                    borderBottom:
                      idx < reviewList.length - 1
                        ? `1px solid ${t.border}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: t.text,
                      }}
                    >
                      {review.reviewer_name || "Anonymous"}
                    </span>
                    {showDates && review.created_at && (
                      <span
                        style={{
                          fontSize: 12,
                          color: t.textFaint,
                        }}
                      >
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    )}
                  </div>
                  {showStars && renderStars(review.rating)}
                  {review.review_text && (
                    <p
                      style={{
                        marginTop: 6,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: t.textMuted,
                      }}
                    >
                      {truncate(review.review_text, 200)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              padding: "12px 24px",
              textAlign: "center",
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <a
              href="https://reviewpulse.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: t.textFaint,
                textDecoration: "none",
              }}
            >
              Powered by{" "}
              <span
                style={{
                  fontWeight: 600,
                  color: t.accent,
                }}
              >
                ReviewPulse
              </span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
