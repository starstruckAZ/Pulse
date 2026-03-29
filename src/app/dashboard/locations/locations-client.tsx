"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MapPin, Plus, Edit3, Trash2, Building2, Globe, X,
  LogOut, MessageSquare, BarChart3, FileText, Settings, LayoutDashboard,
} from "lucide-react";

interface Location {
  id: string;
  user_id: string;
  name: string;
  address: string;
  google_place_id: string | null;
  yelp_business_id: string | null;
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
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [yelpBusinessId, setYelpBusinessId] = useState("");
  const [saving, setSaving] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const displayName = profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const openNew = () => {
    setEditing(null);
    setName("");
    setAddress("");
    setGooglePlaceId("");
    setYelpBusinessId("");
    setShowModal(true);
  };

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setName(loc.name);
    setAddress(loc.address);
    setGooglePlaceId(loc.google_place_id || "");
    setYelpBusinessId(loc.yelp_business_id || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      address: address.trim(),
      google_place_id: googlePlaceId.trim() || null,
      yelp_business_id: yelpBusinessId.trim() || null,
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
        name: payload.name,
        address: payload.address,
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
              <span className="font-display">ReviewPulse</span>
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
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm">
            <Plus className="h-4 w-4" /> Add Location
          </button>
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold truncate">{loc.name}</h3>
                      {(reviewCounts[loc.id] || 0) > 0 && (
                        <span className="badge text-xs text-orange-400 border-orange-500/20 bg-orange-500/5 shrink-0">
                          {reviewCounts[loc.id]} {reviewCounts[loc.id] === 1 ? "review" : "reviews"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 truncate">{loc.address}</p>
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
                  {loc.yelp_business_id && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Building2 className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <span className="text-zinc-400">Yelp:</span>
                      <span className="truncate font-mono text-zinc-500" title={loc.yelp_business_id}>
                        {truncate(loc.yelp_business_id, 24)}
                      </span>
                    </div>
                  )}
                  {!loc.google_place_id && !loc.yelp_business_id && (
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
              </div>
            ))}
          </div>
        )}
      </main>

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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., 123 Main St, City, State"
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Yelp Business ID</label>
                <input
                  type="text"
                  value={yelpBusinessId}
                  onChange={(e) => setYelpBusinessId(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., my-coffee-shop-new-york"
                />
                <p className="mt-1 text-xs text-zinc-600">The business alias from your Yelp page URL</p>
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
