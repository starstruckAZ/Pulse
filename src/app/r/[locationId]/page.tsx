import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { MessageSquare, Star, MapPin } from "lucide-react";
import ReviewForm from "./review-form";

export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface Location {
  id: string;
  name: string;
  address: string;
  google_place_id: string | null;
}

async function getLocation(id: string): Promise<Location | null> {
  const { data, error } = await getSupabase()
    .from("locations")
    .select("id, name, address, google_place_id")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

async function getReviewStats(locationId: string) {
  const { data } = await getSupabase()
    .from("reviews")
    .select("rating")
    .eq("location_id", locationId);

  if (!data || data.length === 0) return { avg: null, count: 0 };
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  return { avg: Math.round(avg * 10) / 10, count: data.length };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) return { title: "Leave a Review" };
  return { title: `Leave a review for ${location.name}` };
}

export default async function ReviewRequestPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) notFound();

  const { avg, count } = await getReviewStats(locationId);

  const googleUrl = location.google_place_id
    ? `https://search.google.com/local/writereview?placeid=${location.google_place_id}`
    : `https://www.google.com/search?q=${encodeURIComponent(location.name)}+reviews`;

  const yelpUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(location.name)}`;
  const facebookUrl = `https://www.facebook.com/search/top?q=${encodeURIComponent(location.name)}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display">ReviewPulse</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Business header */}
          <div className="bento p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20">
              <MessageSquare className="h-8 w-8 text-[#ff6b4a]" />
            </div>
            <h1 className="font-display text-3xl font-bold gradient-text mb-2">
              {location.name}
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 mb-4">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{location.address}</span>
            </div>

            {/* Aggregate rating */}
            {avg !== null && count > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6b4a]/20 bg-[#ff6b4a]/10 px-4 py-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= Math.round(avg)
                          ? "fill-[#ff6b4a] text-[#ff6b4a]"
                          : "text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#ff6b4a]">
                  {avg.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500">
                  ({count} {count === 1 ? "review" : "reviews"})
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <Star className="h-4 w-4 text-zinc-600" />
                <span className="text-xs text-zinc-500">Be the first to review</span>
              </div>
            )}
          </div>

          {/* Platform buttons */}
          <div className="bento p-6">
            <h2 className="font-display text-lg font-semibold mb-1">
              Share your experience
            </h2>
            <p className="text-sm text-zinc-500 mb-5">
              Choose a platform to leave your review on
            </p>

            <div className="space-y-3">
              {/* Google */}
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.07] hover:border-blue-500/30 group"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                  G
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Google</p>
                  <p className="text-xs text-zinc-500">Leave a review on Google</p>
                </div>
                <span className="text-xs text-zinc-600 group-hover:text-blue-400 transition">
                  Leave a review →
                </span>
              </a>

              {/* Yelp */}
              <a
                href={yelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.07] hover:border-red-500/30 group"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-lg shadow-lg shadow-red-500/20">
                  Y
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Yelp</p>
                  <p className="text-xs text-zinc-500">Leave a review on Yelp</p>
                </div>
                <span className="text-xs text-zinc-600 group-hover:text-red-400 transition">
                  Leave a review →
                </span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.07] hover:border-indigo-500/30 group"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                  f
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Facebook</p>
                  <p className="text-xs text-zinc-500">Leave a review on Facebook</p>
                </div>
                <span className="text-xs text-zinc-600 group-hover:text-indigo-400 transition">
                  Leave a review →
                </span>
              </a>
            </div>
          </div>

          {/* Direct feedback form */}
          <div className="bento p-6">
            <h2 className="font-display text-lg font-semibold mb-1">
              Or share your feedback directly
            </h2>
            <p className="text-sm text-zinc-500 mb-5">
              Leave a review right here — we read every one
            </p>
            <ReviewForm locationId={locationId} />
          </div>

          {/* Footer CTA */}
          <div className="text-center pb-4">
            <p className="text-xs text-zinc-600">
              Powered by{" "}
              <Link
                href="/"
                className="text-zinc-500 hover:text-[#ff6b4a] transition"
              >
                ReviewPulse
              </Link>{" "}
              &mdash;{" "}
              <Link
                href="/signup"
                className="text-[#ff6b4a] hover:underline"
              >
                Get your free review page
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
