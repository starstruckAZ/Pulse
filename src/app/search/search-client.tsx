"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  Star,
  MapPin,
  MessageSquare,
  ExternalLink,
  Shield,
  CheckCircle,
  Loader2,
  Globe,
  Clock,
  ChevronRight,
  ArrowRight,
  BadgeCheck,
  Trophy,
  TrendingUp,
} from "lucide-react";

// Extend Window for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
            }) => void;
            error_callback?: (err: {
              type: string;
              message?: string;
            }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}
import { CATEGORIES } from "@/lib/categories";

interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating: number | null;
  review_count: number;
  types: string[];
  business_status: string;
  open_now: boolean | null;
  photo_reference: string | null;
  claimed: boolean;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating)
              ? "fill-[#f9d377] text-[#f9d377]"
              : "text-[#e1dcd8]"
          }`}
        />
      ))}
    </div>
  );
}

/** Reputation tier based on rating × volume */
function reputationTier(rating: number | null, reviewCount: number): {
  label: string; color: string; bg: string; border: string;
} | null {
  if (!rating || reviewCount < 5) return null;
  const score = rating * Math.log10(reviewCount + 1);
  if (score >= 14)  return { label: "🏆 Elite",  color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200" };
  if (score >= 10)  return { label: "🥇 Gold",   color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200"  };
  if (score >= 6)   return { label: "🥈 Silver", color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200"  };
  if (score >= 3)   return { label: "🥉 Bronze", color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" };
  return null;
}

/** Format Google place types into readable labels */
function formatType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Claim state
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState<PlaceResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [gbpVerifying, setGbpVerifying] = useState(false);

  const supabase = createClient();

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      if (!q || q.length < 2) return;

      setLoading(true);
      setError(null);
      setSearched(true);
      setClaimSuccess(null);
      setClaimError(null);

      // Update URL without navigation
      const newUrl = `/search?q=${encodeURIComponent(q)}`;
      window.history.replaceState(null, "", newUrl);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Search failed");
          setResults([]);
        } else {
          setResults(data.results || []);
        }
      } catch {
        setError("Network error. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Run initial search if URL has ?q=
  useState(() => {
    if (initialQuery) handleSearch(initialQuery);
  });

  const handleClaim = async (place: PlaceResult) => {
    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to signup with return URL
      const returnUrl = `/search?q=${encodeURIComponent(query)}`;
      router.push(`/signup?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Check Google identity
    const hasGoogle =
      user.identities?.some((i) => i.provider === "google") ||
      user.app_metadata?.provider === "google" ||
      user.app_metadata?.providers?.includes("google");

    if (!hasGoogle) {
      setClaimError(
        "You must sign in with a Google account to claim a business. " +
          "Please sign out and sign back in using Google."
      );
      return;
    }

    // Show category selection modal
    setShowCategoryModal(place);
    setSelectedCategory("");
  };

  /** Load the Google Identity Services script on demand */
  const loadGIS = (): Promise<void> =>
    new Promise((resolve) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

  /** Trigger Google OAuth popup for business.manage scope, then claim */
  const handleVerifyWithGBP = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      // Client ID not configured — fall back to pending claim
      confirmClaim(null);
      return;
    }

    setGbpVerifying(true);

    // Safety timeout — reset if popup is blocked or never responds
    const timeout = setTimeout(() => {
      setGbpVerifying(false);
      setClaimError(
        "Google verification timed out. The popup may have been blocked — " +
          "please allow popups for this site and try again, or use \"Submit for manual review\"."
      );
    }, 30000);

    try {
      await loadGIS();
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/business.manage",
        callback: (tokenResponse) => {
          clearTimeout(timeout);
          setGbpVerifying(false);
          if (tokenResponse.access_token) {
            confirmClaim(tokenResponse.access_token);
          } else {
            setClaimError(
              "Google Business Profile verification was cancelled. " +
                "You can still submit for manual review."
            );
          }
        },
        error_callback: (err) => {
          clearTimeout(timeout);
          setGbpVerifying(false);
          const msg =
            err.type === "popup_blocked_by_browser"
              ? "The Google popup was blocked. Please allow popups for this site and try again."
              : `Google verification failed (${err.type}). Try "Submit for manual review" instead.`;
          setClaimError(msg);
        },
      });
      client.requestAccessToken();
    } catch {
      clearTimeout(timeout);
      setGbpVerifying(false);
      setClaimError(
        "Could not load Google verification. Try submitting for manual review."
      );
    }
  };

  const confirmClaim = async (googleToken: string | null) => {
    const place = showCategoryModal;
    if (!place) return;

    setShowCategoryModal(null);
    setClaimingId(place.place_id);
    setClaimError(null);

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: place.place_id,
          name: place.name,
          address: place.address,
          category: selectedCategory || null,
          ...(googleToken ? { google_access_token: googleToken } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "GOOGLE_AUTH_REQUIRED") {
          setClaimError(
            "You must sign in with the Google account associated with this business. " +
              "Please sign out and sign back in using the correct Google account."
          );
        } else if (data.code === "ALREADY_CLAIMED") {
          setClaimError("This business has already been claimed on ReviewHype.");
        } else {
          setClaimError(data.error || "Failed to claim business.");
        }
      } else {
        setClaimSuccess(place.place_id);
        // Mark as claimed in local results
        setResults((prev) =>
          prev.map((r) =>
            r.place_id === place.place_id ? { ...r, claimed: true } : r
          )
        );

        // Show different message for pending vs verified
        if (!data.verified) {
          setClaimError(null); // clear any previous error
          setPendingMessage(
            "Claim submitted! Since we couldn't automatically verify ownership " +
              "via your email domain, your claim is pending manual review. " +
              "You'll still have access to your dashboard."
          );
        }
      }
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-[#797674]">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[#302e2d] font-semibold"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#aa2c32] to-[#ff7574]">
                <MessageSquare className="h-3 w-3 text-white" />
              </div>
              ReviewHype
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#302e2d] font-medium">Search</span>
          </div>
          <Link
            href="/signup"
            className="btn-primary rounded-xl px-5 py-2 text-sm"
          >
            Get started free
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-14">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="font-headline mb-3 text-4xl font-bold italic text-[#302e2d] sm:text-5xl">
            Search{" "}
            <span className="gradient-text not-italic">Any Business</span>
          </h1>
          <p className="mx-auto max-w-lg text-[#5d5b59]">
            Look up any business to see their Google ratings and reviews.
            Claim your business to manage your online reputation.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex items-center gap-2 rounded-2xl border border-[#e1dcd8] bg-white px-4 py-3 shadow-sm focus-within:border-[#aa2c32] focus-within:ring-4 focus-within:ring-[rgba(170,44,50,0.08)] transition-all">
            <Search className="h-5 w-5 shrink-0 text-[#797674]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a business, e.g. &quot;Joe's Pizza Phoenix&quot;…"
              className="flex-1 bg-transparent text-[#302e2d] placeholder-[#b0acaa] outline-none text-base"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#aa2c32] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#8f2329] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Search <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Claim error */}
        {claimError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <div>{claimError}</div>
            </div>
          </div>
        )}

        {/* Claim success */}
        {claimSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Business claimed successfully!</span>
              <Link
                href="/dashboard/locations"
                className="ml-auto font-semibold underline"
              >
                Go to Dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* Pending verification */}
        {pendingMessage && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                {pendingMessage}
                <Link
                  href="/dashboard/locations"
                  className="ml-2 font-semibold underline"
                >
                  Go to Dashboard →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {searched && !loading && results.length === 0 && !error && (
          <div className="rounded-2xl border border-[#e1dcd8] bg-white p-10 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-[#b0acaa]" />
            <p className="text-[#5d5b59]">
              No businesses found. Try a different search term.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((place, index) => (
              <div key={place.place_id} className="bento p-5 relative">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  {place.photo_reference ? (
                    <img
                      src={`/api/search/photo?ref=${encodeURIComponent(
                        place.photo_reference
                      )}&maxwidth=120`}
                      alt=""
                      className="hidden sm:block h-20 w-20 shrink-0 rounded-xl object-cover bg-[#f5f0ed]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#f5f0ed]">
                      <MapPin className="h-6 w-6 text-[#b0acaa]" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Rank position */}
                      <span className={`shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-bold ${
                        index === 0 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                        index === 1 ? "bg-slate-100 text-slate-600 border border-slate-200" :
                        index === 2 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                        "bg-[#f5f0ed] text-[#797674] border border-[#e1dcd8]"
                      }`}>
                        {index === 0 ? <Trophy className="h-3 w-3" /> : index + 1}
                      </span>
                      <h2 className="font-headline text-lg font-semibold text-[#302e2d] leading-tight">
                        {place.name}
                      </h2>
                      {/* Reputation tier */}
                      {(() => {
                        const tier = reputationTier(place.rating, place.review_count);
                        return tier ? (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${tier.color} ${tier.bg} ${tier.border}`}>
                            {tier.label}
                          </span>
                        ) : null;
                      })()}
                      {place.claimed && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          <CheckCircle className="h-2.5 w-2.5" />
                          On ReviewHype
                        </span>
                      )}
                      {place.business_status === "CLOSED_TEMPORARILY" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          Temporarily Closed
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    <div className="mt-1 flex items-center gap-1 text-sm text-[#797674]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </div>

                    {/* Rating + status */}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {place.rating !== null && (
                        <div className="flex items-center gap-1.5">
                          <StarRow rating={place.rating} />
                          <span className="text-sm font-semibold text-[#302e2d]">
                            {place.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-[#797674]">
                            ({place.review_count.toLocaleString()})
                          </span>
                        </div>
                      )}
                      {place.open_now !== null && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            place.open_now
                              ? "text-emerald-600"
                              : "text-[#797674]"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {place.open_now ? "Open now" : "Closed"}
                        </span>
                      )}
                    </div>

                    {/* Types */}
                    {place.types.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {place.types
                          .filter(
                            (t) =>
                              !["point_of_interest", "establishment"].includes(t)
                          )
                          .slice(0, 3)
                          .map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-[#f5f0ed] px-2.5 py-0.5 text-[10px] font-medium text-[#797674]"
                            >
                              {formatType(t)}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {place.claimed ? (
                      <Link
                        href="/dashboard/locations"
                        className="btn-ghost inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleClaim(place)}
                        disabled={
                          claimingId === place.place_id ||
                          claimSuccess === place.place_id
                        }
                        className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs disabled:opacity-50"
                      >
                        {claimingId === place.place_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : claimSuccess === place.place_id ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                        {claimSuccess === place.place_id
                          ? "Claimed!"
                          : "Claim Business"}
                      </button>
                    )}
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-[#797674] transition hover:text-[#302e2d]"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Google Maps
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f5f0ed] p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <TrendingUp className="h-5 w-5 text-[#aa2c32]" />
            </div>
            <h3 className="font-headline mb-1 text-base font-bold text-[#302e2d]">
              How Rankings Work
            </h3>
            <p className="text-sm text-[#5d5b59]">
              Results are ranked by a score combining star rating and review
              volume. Businesses verified on ReviewHype get a boost for actively
              managing their reputation.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f5f0ed] p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Shield className="h-5 w-5 text-[#aa2c32]" />
            </div>
            <h3 className="font-headline mb-1 text-base font-bold text-[#302e2d]">
              Verified Business Claims
            </h3>
            <p className="text-sm text-[#5d5b59]">
              Claiming requires signing in with Google. We verify ownership
              through your Google Business Profile — no postcards, no waiting.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e1dcd8] bg-white py-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#797674] transition hover:text-[#302e2d]"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#aa2c32] to-[#ff7574]">
            <MessageSquare className="h-3 w-3 text-white" />
          </div>
          Powered by ReviewHype
        </Link>
      </footer>

      {/* Category selection modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#e1dcd8] bg-white p-8 shadow-2xl mx-4">
            <h2 className="font-headline text-xl font-bold text-[#302e2d] mb-1">
              Claim {showCategoryModal.name}
            </h2>
            <p className="text-sm text-[#5d5b59] mb-6">
              Select a category for your business (optional), then confirm.
            </p>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-[#5d5b59]">
                Business Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full"
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 rounded-xl bg-[#f5f0ed] p-3 text-xs text-[#5d5b59]">
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#aa2c32]" />
                <span>
                  By claiming this business, you confirm you are an authorized
                  representative. Your Google account is recorded with this claim
                  for verification purposes.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCategoryModal(null)}
                className="btn-ghost rounded-xl px-5 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmClaim(null)}
                className="btn-primary rounded-xl px-6 py-2.5 text-sm"
              >
                Claim Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
