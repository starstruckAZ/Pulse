/**
 * GET /api/search/photo?ref=PHOTO_REFERENCE&maxwidth=400
 *
 * Proxies Google Places Photo requests so the API key stays server-side.
 * Returns the image directly with a 24-hour cache header.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const maxwidth = request.nextUrl.searchParams.get("maxwidth") || "400";

  if (!ref) {
    return NextResponse.json({ error: "Missing photo reference" }, { status: 400 });
  }

  if (!PLACES_API_KEY) {
    return new Response(null, { status: 503 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(ref)}&key=${PLACES_API_KEY}`;

    const googleRes = await fetch(url, { redirect: "follow" });

    if (!googleRes.ok) {
      return new Response(null, { status: 502 });
    }

    const contentType = googleRes.headers.get("content-type") || "image/jpeg";
    const body = await googleRes.arrayBuffer();

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
