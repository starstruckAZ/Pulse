"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MapPin, Plus, Edit3, Trash2, Globe, X,
  LogOut, MessageSquare, BarChart3, FileText, Settings, LayoutDashboard,
  ExternalLink, Award, Share2, Check, BarChart2, Eye, EyeOff,
  BadgeCheck, Loader2, AlertCircle,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (r: { access_token?: string; error?: string }) => void;
            error_callback?: (e: { type: string; message?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

interface GBPLocation {
  gbp_name: string;
  title: string;
  address: string | null;
  place_id: string | null;
  maps_uri: string | null;
}

interface Location {
  id: string;
  user_id: string;
  name: string;
  address: string;
  city: string | null;
  category: string | null;
  listed: boolean | null;
  google_place_id: string | null;
  created_at: string;
}

interface Profile {
  business_name?: string;
  full_name?: string;
  plan?: string;
}

interface LocationsClientProps {
  user: { id: string; email?: string };
  profile: Profile | null;
  locations: Location[];
  reviewCounts: Record<string, number>;
}

export default function LocationsClient({ user, profile, locations: initialLocations, reviewCounts }: LocationsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [locations, setLocations] = useState(initialLocations);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [listed, setListed] = useState(true);
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // GBP import state
  const [gbpLoading, setGbpLoading] = useState(false);
  const [gbpError, setGbpError] = useState<string | null>(null);
  const [gbpLocations, setGbpLocations] = useState<GBPLocation[] | null>(null);
  const [gbpSelected, setGbpSelected] = useState<Set<string>>(new Set());
  const [gbpImporting, setGbpImporting] = useState(false);
  const [gbpToken, setGbpToken] = useState<string | null>(null);

  const copyReviewLink = (locId: string) => {
    const url = `${window.location.origin}/r/${locId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(locId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const displayName = profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const openNew = () => {
    setEditing(null);
    setName("");
    setAddress("");
    setCity("");
    setCategory("");
    setListed(true);
    setGooglePlaceId("");
    setShowModal(true);
  };

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setName(loc.name);
    setAddress(loc.address);
    setCity(loc.city || "");
    setCategory(loc.category || "");
    setListed(loc.listed !== false);
    setGooglePlaceId(loc.google_place_id || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim() || null,
      category: category || null,
      listed,
      google_place_id: googlePlaceId.trim() || null,
    };

    if (editing) {
      // Optimistic update
      setLocations((prev) =>
        prev.map((l) => (l.id === editing.id ? { ...l, ...payload } : l))
      );
      setShowModal(false);

      const { data } = await supabase
        .from("locations")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();

      if (data) {
        setLocations((prev) => prev.map((l) => (l.id === editing.id ? data : l)));
      }
    } else {
      // Optimistic: add a temporary entry
      const tempId = `temp-${Date.now()}`;
      const optimistic: Location = {
        id: tempId,
        user_id: user.id,
        ...payload,
        created_at: new Date().toISOString(),
      };
      setLocations((prev) => [optimistic, ...prev]);
      setShowModal(false);

      const { data } = await supabase
        .from("locations")
        .insert({ user_id: user.id, ...payload })
        .select()
        .single();

      if (data) {
        setLocations((prev) => prev.map((l) => (l.id === tempId ? data : l)));
      } else {
        // Rollback
        setLocations((prev) => prev.filter((l) => l.id !== tempId));
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location? All associated reviews will be unlinked.")) return;

    // Optimistic removal
    const removed = locations.find((l) => l.id === id);
    setLocations((prev) => prev.filter((l) => l.id !== id));

    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error && removed) {
      // Rollback
      setLocations((prev) => [removed, ...prev]);
    }
  };

  const truncate = (str: string, len = 20) =>
    str.length > len ? str.slice(0, len) + "..." : str;

  // ── GBP import ──────────────────────────────────────────────────────────────

  const loadGIS = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load GIS"));
      document.head.appendChild(script);
    });

  const handleImportFromGBP = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGbpError("Google Client ID is not configured. Contact support.");
      return;
    }
    setGbpLoading(true);
    setGbpError(null);

    const timeout = setTimeout(() => {
      setGbpLoading(false);
      setGbpError("Timed out waiting for Google — the popup may have been blocked.");
    }, 30000);

    try {
      await loadGIS();
      window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/business.manage",
        callback: async (tokenResponse) => {
          clearTimeout(timeout);
          if (!tokenResponse.access_token) {
            setGbpLoading(false);
            setGbpError("Google verification was cancelled.");
            return;
          }
          setGbpToken(tokenResponse.access_token);
          try {
            const res = await fetch("/api/gbp/locations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ access_token: tokenResponse.access_token }),
            });
            const data = await res.json();
            setGbpLocations(data.locations || []);
            setGbpSelected(new Set((data.locations || []).map((l: GBPLocation) => l.gbp_name)));
          } catch {
            setGbpError("Failed to fetch your Google Business Profile listings.");
          } finally {
            setGbpLoading(false);
          }
        },
        error_callback: (err) => {
          clearTimeout(timeout);
          setGbpLoading(false);
          setGbpError(
            err.type === "popup_blocked_by_browser"
              ? "Popup was blocked — please allow popups for this site and try again."
              : `Google sign-in failed (${err.type}).`
          );
        },
      }).requestAccessToken();
    } catch {
      clearTimeout(timeout);
      setGbpLoading(false);
      setGbpError("Could not load Google verification.");
    }
  };

  const handleGBPImportConfirm = async () => {
    if (!gbpLocations || !gbpToken) return;
    const toImport = gbpLocations.filter((l) => gbpSelected.has(l.gbp_name));
    if (toImport.length === 0) return;

    setGbpImporting(true);
    const added: Location[] = [];

    for (const loc of toImport) {
      if (!loc.place_id) continue; // skip if no Place ID found
      try {
        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            place_id: loc.place_id,
            name: loc.title,
            address: loc.address || "",
            google_access_token: gbpToken,
          }),
        });
        const data = await res.json();
        if (res.ok && data.location) added.push(data.location);
      } catch {
        // skip failed imports
      }
    }

    setLocations((prev) => [...added, ...prev]);
    setGbpLocations(null);
    setGbpToken(null);
    setGbpSelected(new Set());
    setGbpImporting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display">ReviewHype</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-white bg-white/5">
                <MapPin className="h-3.5 w-3.5" /> Locations
              </span>
              <Link href="/dashboard/templates" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <FileText className="h-3.5 w-3.5" /> Templates
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {plan === "free" && (
              <Link href="#" className="badge text-orange-400 border-orange-500/20 bg-orange-500/5 text-xs">Upgrade to Pro</Link>
            )}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm transition hover:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-white/5 mb-1">{user.email}</div>
                  <Link href="/dashboard/settings" className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Locations</h1>
            <p className="text-sm text-zinc-500">Manage your business locations and connect review sources.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Import from Google — requires NEXT_PUBLIC_GOOGLE_CLIENT_ID + approved business.manage scope */}
            <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm">
              <Plus className="h-4 w-4" /> Add Location
            </button>
          </div>
        </div>

        {/* Content */}
        {locations.length === 0 ? (
          <div className="bento py-20 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="mb-1 font-display text-lg font-medium text-zinc-400">No locations yet</h3>
            <p className="mb-6 text-sm text-zinc-500">Add your first business location to start tracking reviews.</p>
            <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm">
              <Plus className="h-4 w-4" /> Add Your First Location
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {locations.map((loc) => (
              <div key={loc.id} className="bento p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg font-semibold truncate">{loc.name}</h3>
                      {(reviewCounts[loc.id] || 0) > 0 && (
                        <span className="badge text-xs text-orange-400 border-orange-500/20 bg-orange-500/5 shrink-0">
                          {reviewCounts[loc.id]} {reviewCounts[loc.id] === 1 ? "review" : "reviews"}
                        </span>
                      )}
                      {loc.listed !== false ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shrink-0">
                          <Eye className="h-2.5 w-2.5" /> Listed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 shrink-0">
                          <EyeOff className="h-2.5 w-2.5" /> Unlisted
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 truncate">{loc.city ? `${loc.city}${loc.address ? ` · ${loc.address}` : ""}` : loc.address}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={() => openEdit(loc)} className="rounded-xl p-2 text-zinc-600 transition hover:bg-white/5 hover:text-white">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(loc.id)} className="rounded-xl p-2 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Integration IDs */}
                <div className="space-y-2">
                  {loc.google_place_id && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="text-zinc-400">Google:</span>
                      <span className="truncate font-mono text-zinc-500" title={loc.google_place_id}>
                        {truncate(loc.google_place_id, 24)}
                      </span>
                    </div>
                  )}
                  {!loc.google_place_id && (
                    <p className="text-xs text-zinc-600 italic">No review sources connected</p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-xs text-zinc-600">
                    Added {new Date(loc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {(reviewCounts[loc.id] || 0) === 0 && (
                    <span className="text-xs text-zinc-600">No reviews yet</span>
                  )}
                </div>

                {/* Share / Badge / Get Reviews / Report actions */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/report/${loc.id}`}
                    className="btn-ghost inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    Monthly Report
                  </Link>
                  <Link
                    href={`/business/${loc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Share Profile
                  </Link>
                  <Link
                    href={`/badge/${loc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs"
                  >
                    <Award className="h-3.5 w-3.5" />
                    Get Badge
                  </Link>
                  <button
                    onClick={() => copyReviewLink(loc.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border border-[#ff6b4a]/20 bg-[#ff6b4a]/5 text-[#ff6b4a] transition hover:bg-[#ff6b4a]/10"
                  >
                    {copiedId === loc.id ? (
                      <><Check className="h-3.5 w-3.5" /> Copied!</>
                    ) : (
                      <><Share2 className="h-3.5 w-3.5" /> Get Reviews</>
                    )}
                  </button>
                </div>

                {/* Copyable review request URL */}
                <div className="mt-3">
                  <p className="mb-1 text-xs text-zinc-600">Review request link</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}/r/${loc.id}` : `/r/${loc.id}`}
                      className="input flex-1 py-1.5 text-xs font-mono text-zinc-400"
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => copyReviewLink(loc.id)}
                      className="shrink-0 rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                      title="Copy link"
                    >
                      {copiedId === loc.id ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* GBP error banner */}
      {gbpError && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-zinc-900 px-5 py-3 shadow-2xl text-sm text-red-400 max-w-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{gbpError}</span>
          <button onClick={() => setGbpError(null)} className="ml-2 text-zinc-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* GBP import modal */}
      {gbpLocations !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Your Google Business Listings</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Select locations to add to ReviewHype</p>
              </div>
              <button onClick={() => { setGbpLocations(null); setGbpToken(null); }} className="rounded-xl p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {gbpLocations.length === 0 ? (
              <div className="py-10 text-center text-zinc-500">
                <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
                <p className="text-sm">No Google Business Profile listings found, or all are already added.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-5">
                {gbpLocations.map((loc) => {
                  const selected = gbpSelected.has(loc.gbp_name);
                  const noPlaceId = !loc.place_id;
                  return (
                    <button
                      key={loc.gbp_name}
                      onClick={() => {
                        if (noPlaceId) return;
                        setGbpSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(loc.gbp_name)) next.delete(loc.gbp_name);
                          else next.add(loc.gbp_name);
                          return next;
                        });
                      }}
                      disabled={noPlaceId}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                        noPlaceId
                          ? "border-white/5 bg-white/2 opacity-40 cursor-not-allowed"
                          : selected
                          ? "border-orange-500/30 bg-orange-500/5"
                          : "border-white/8 bg-white/3 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-zinc-200 truncate">{loc.title}</p>
                          {loc.address && (
                            <p className="text-xs text-zinc-500 truncate mt-0.5">{loc.address}</p>
                          )}
                          {noPlaceId && (
                            <p className="text-[10px] text-zinc-600 mt-0.5">Could not find Google Maps listing</p>
                          )}
                        </div>
                        {!noPlaceId && (
                          <div className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${selected ? "border-orange-500 bg-orange-500" : "border-zinc-600"}`}>
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {gbpLocations.length > 0 && (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                <span className="text-xs text-zinc-500">
                  {gbpSelected.size} of {gbpLocations.filter(l => l.place_id).length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setGbpLocations(null); setGbpToken(null); }}
                    className="btn-ghost rounded-2xl px-4 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGBPImportConfirm}
                    disabled={gbpImporting || gbpSelected.size === 0}
                    className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm disabled:opacity-50"
                  >
                    {gbpImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {gbpImporting ? "Adding…" : `Add ${gbpSelected.size} Location${gbpSelected.size !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl mx-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{editing ? "Edit Location" : "Add Location"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-xl p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Location Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., Downtown Coffee Shop"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., Phoenix"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., 123 Main St, Phoenix, AZ 85001"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Google Place ID</label>
                <input
                  type="text"
                  value={googlePlaceId}
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                />
                <p className="mt-1 text-xs text-zinc-600">Find your Place ID at <span className="text-zinc-400">developers.google.com/maps/documentation/places/web-service/place-id</span></p>
              </div>
              {/* Directory listing toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-300">Show in public directory</p>
                  <p className="text-xs text-zinc-600">Appear on the ReviewHype business discover page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setListed(!listed)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    listed ? "bg-[#aa2c32]" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      listed ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost rounded-2xl px-5 py-2.5 text-sm">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim() || !address.trim()}
                className="btn-primary rounded-2xl px-6 py-2.5 text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Update Location" : "Add Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
