"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  MessageSquare, Search, MapPin, Star, CheckCircle, ArrowRight,
  Loader2, ChevronLeft, X, Trophy, TrendingUp, Shield,
} from "lucide-react";

interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating: number | null;
  review_count: number;
  photo_reference: string | null;
  claimed: boolean;
}

interface OnboardingClientProps {
  user: { email?: string };
  hasGoogle: boolean;
  googleName: string | null;
}

type Step = "search" | "results" | "claiming" | "success" | "manual";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingClient({
  user,
  hasGoogle,
  googleName,
}: OnboardingClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState(googleName || "");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimedBusiness, setClaimedBusiness] = useState<PlaceResult | null>(null);

  // Manual add state
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualSaving, setManualSaving] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || q.length < 2) return;
    setSearchLoading(true);
    setSearchError(null);
    setClaimError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || "Search failed. Try a different search term.");
      } else {
        setResults(data.results || []);
        setStep("results");
      }
    } catch {
      setSearchError("Network error. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClaim = async (place: PlaceResult) => {
    setClaimingId(place.place_id);
    setClaimError(null);
    setStep("claiming");
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: place.place_id,
          name: place.name,
          address: place.address,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimedBusiness(place);
        setStep("success");
      } else if (data.code === "ALREADY_CLAIMED") {
        setClaimError("This business has already been claimed by another account. Contact support if this is your business.");
        setStep("results");
      } else {
        setClaimError(data.error || "Could not claim this business. Please try again.");
        setStep("results");
      }
    } catch {
      setClaimError("Network error. Please try again.");
      setStep("results");
    } finally {
      setClaimingId(null);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualAddress.trim()) return;
    setManualSaving(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push("/login"); return; }
    await supabase.from("locations").insert({
      user_id: authUser.id,
      name: manualName.trim(),
      address: manualAddress.trim(),
      city: manualCity.trim() || null,
      listed: true,
    });
    setManualSaving(false);
    router.push("/dashboard");
  };

  const stepNumber = step === "search" ? 1 : step === "results" ? 2 : 3;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
            <MessageSquare className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-sm font-bold">ReviewHype</span>
        </Link>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-[#8b8b9e] transition hover:text-white"
        >
          Skip for now →
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Progress dots */}
          {(step === "search" || step === "results") && (
            <div className="mb-8 flex items-center justify-center gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-2 rounded-full transition-all ${
                    n === stepNumber
                      ? "w-6 bg-[#ff6b4a]"
                      : n < stepNumber
                      ? "w-2 bg-[#ff6b4a]/40"
                      : "w-2 bg-white/10"
                  }`}
                />
              ))}
            </div>
          )}

          {/* ── Step: Search ── */}
          {step === "search" && (
            <div className="text-center">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#ff6b4a]">
                Step 1 of 3
              </div>
              <h1 className="mb-2 font-display text-3xl font-bold">
                Find your business
              </h1>
              <p className="mb-8 text-[#8b8b9e]">
                Search by business name and city. We&apos;ll pull your Google reviews automatically.
              </p>

              {/* Google identity indicator */}
              {hasGoogle && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  Signed in as <span className="font-semibold">{user.email}</span>
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8b9e]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Joe's Pizza Phoenix AZ"
                    className="input w-full pl-10 py-3.5 text-base"
                    autoFocus
                  />
                </div>

                {searchError && (
                  <p className="text-sm text-red-400">{searchError}</p>
                )}

                <button
                  type="submit"
                  disabled={searchLoading || query.trim().length < 2}
                  className="btn-primary w-full rounded-2xl py-3.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" /> Search
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={() => setStep("manual")}
                className="mt-4 text-sm text-[#8b8b9e] transition hover:text-white underline underline-offset-2"
              >
                Add business manually instead
              </button>
            </div>
          )}

          {/* ── Step: Results ── */}
          {step === "results" && (
            <div>
              <button
                onClick={() => setStep("search")}
                className="mb-4 inline-flex items-center gap-1 text-sm text-[#8b8b9e] transition hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Search again
              </button>

              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#ff6b4a]">
                Step 2 of 3
              </div>
              <h2 className="mb-1 font-display text-2xl font-bold">
                Is one of these your business?
              </h2>
              <p className="mb-6 text-sm text-[#8b8b9e]">
                Click &quot;That&apos;s mine&quot; to claim it. We&apos;ll link it to your account immediately.
              </p>

              {claimError && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {claimError}
                </div>
              )}

              <div className="space-y-3">
                {results.length === 0 ? (
                  <div className="bento py-10 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-[#4a4a5e]" />
                    <p className="text-[#8b8b9e]">No results found. Try a different search.</p>
                  </div>
                ) : (
                  results.map((place) => (
                    <div
                      key={place.place_id}
                      className="bento p-5 flex items-center gap-4"
                    >
                      {/* Photo or placeholder */}
                      {place.photo_reference ? (
                        <img
                          src={`/api/search/photo?ref=${encodeURIComponent(place.photo_reference)}&maxwidth=80`}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-xl object-cover bg-white/5"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/5">
                          <MapPin className="h-5 w-5 text-[#4a4a5e]" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold leading-tight truncate">{place.name}</p>
                        <p className="mt-0.5 text-xs text-[#8b8b9e] truncate">{place.address}</p>
                        {place.rating !== null && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <StarRow rating={place.rating} />
                            <span className="text-xs font-semibold text-[#eeeef0]">
                              {place.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-[#8b8b9e]">
                              ({place.review_count.toLocaleString()} reviews)
                            </span>
                          </div>
                        )}
                        {place.claimed && (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-amber-400">
                            <Shield className="h-2.5 w-2.5" /> Already claimed
                          </span>
                        )}
                      </div>

                      {/* Claim button */}
                      <button
                        onClick={() => !place.claimed && handleClaim(place)}
                        disabled={place.claimed || claimingId === place.place_id}
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                          place.claimed
                            ? "bg-white/5 text-[#4a4a5e] cursor-not-allowed"
                            : "btn-primary"
                        }`}
                      >
                        {place.claimed ? "Claimed" : "That's mine →"}
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex flex-col items-center gap-3">
                <button
                  onClick={() => setStep("manual")}
                  className="text-sm text-[#8b8b9e] transition hover:text-white underline underline-offset-2"
                >
                  None of these — add my business manually
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Claiming ── */}
          {step === "claiming" && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ff6b4a]/10">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff6b4a]" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Claiming your business…</h2>
              <p className="text-[#8b8b9e] text-sm">Linking it to your ReviewHype account.</p>
            </div>
          )}

          {/* ── Step: Success ── */}
          {step === "success" && claimedBusiness && (
            <div className="text-center">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#ff6b4a]">
                Step 3 of 3
              </div>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="mb-2 font-display text-3xl font-bold">You&apos;re all set!</h2>
              <p className="mb-1 text-[#8b8b9e]">
                <span className="font-semibold text-white">{claimedBusiness.name}</span> is now linked to your account.
              </p>
              <p className="mb-8 text-sm text-[#8b8b9e]">
                Start tracking reviews, monitoring your reputation score, and responding faster.
              </p>

              {/* Stats preview */}
              <div className="mb-8 grid grid-cols-3 gap-3">
                {[
                  { icon: <Star className="h-4 w-4" />, label: "Rating", value: claimedBusiness.rating?.toFixed(1) ?? "—", color: "text-amber-400" },
                  { icon: <TrendingUp className="h-4 w-4" />, label: "Reviews", value: claimedBusiness.review_count.toLocaleString(), color: "text-[#ff6b4a]" },
                  { icon: <Trophy className="h-4 w-4" />, label: "Reputation", value: "Active", color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bento p-4">
                    <div className={`mb-1 flex justify-center ${s.color}`}>{s.icon}</div>
                    <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-[#8b8b9e]">{s.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Step: Manual ── */}
          {step === "manual" && (
            <div>
              <button
                onClick={() => setStep("search")}
                className="mb-4 inline-flex items-center gap-1 text-sm text-[#8b8b9e] transition hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Back to search
              </button>

              <h2 className="mb-1 font-display text-2xl font-bold">Add your business manually</h2>
              <p className="mb-6 text-sm text-[#8b8b9e]">
                Enter your business details. You can always connect it to Google later.
              </p>

              <form onSubmit={handleManualSave} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#8b8b9e]">Business Name *</label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    required
                    className="input w-full"
                    placeholder="e.g. Joe's Pizza"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#8b8b9e]">Address *</label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    required
                    className="input w-full"
                    placeholder="123 Main St, Phoenix AZ 85001"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#8b8b9e]">City</label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="input w-full"
                    placeholder="Phoenix"
                  />
                </div>
                <button
                  type="submit"
                  disabled={manualSaving || !manualName.trim() || !manualAddress.trim()}
                  className="btn-primary w-full rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {manualSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <>Add Business <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
