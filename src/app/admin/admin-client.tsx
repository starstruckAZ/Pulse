"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Star,
  Users,
  MapPin,
  LogOut,
  LayoutDashboard,
  Shield,
  Search,
  ChevronUp,
  ChevronDown,
  Activity,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  business_name: string | null;
  full_name: string | null;
  email: string | null;
  plan: string | null;
  created_at: string;
}

interface Location {
  id: string;
  name: string;
  address: string | null;
  user_id: string;
  created_at: string;
}

interface Review {
  id: string;
  location_id: string;
  rating: number;
  sentiment: string | null;
  created_at: string;
  reviewer_name: string | null;
  review_text: string | null;
}

interface AuthUser {
  id: string;
  last_sign_in_at: string | null;
  email: string | null;
}

interface AdminClientProps {
  currentUser: { email?: string };
  profiles: Profile[];
  locations: Location[];
  reviews: Review[];
  authUsers: AuthUser[];
}

type Tab = "users" | "locations" | "activity";
type UserSortKey = "joined" | "name" | "plan" | "locations" | "reviews";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderStars(rating: number) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rating
              ? "fill-[#ff6b4a] text-[#ff6b4a]"
              : "text-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string | null }) {
  const isPro = plan === "pro";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isPro
          ? "text-[#ff6b4a] border-[#ff6b4a]/20 bg-[#ff6b4a]/10"
          : "text-[#8b8b9e] border-white/[0.08] bg-white/[0.04]"
      }`}
    >
      {isPro ? "Pro" : "Free"}
    </span>
  );
}

function SortButton({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: UserSortKey;
  current: UserSortKey;
  dir: SortDir;
  onSort: (k: UserSortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 text-xs font-medium text-[#8b8b9e] hover:text-white transition-colors"
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ChevronUp className="h-3 w-3 text-[#ff6b4a]" />
        ) : (
          <ChevronDown className="h-3 w-3 text-[#ff6b4a]" />
        )
      ) : (
        <ChevronDown className="h-3 w-3 opacity-30" />
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminClient({
  currentUser,
  profiles,
  locations,
  reviews,
  authUsers,
}: AdminClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [userSort, setUserSort] = useState<UserSortKey>("joined");
  const [userSortDir, setUserSortDir] = useState<SortDir>("desc");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUserSort = (key: UserSortKey) => {
    if (userSort === key) {
      setUserSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setUserSort(key);
      setUserSortDir("desc");
    }
  };

  // ── Derived maps ──────────────────────────────────────────────────────────

  const authUserMap = useMemo(() => {
    const m: Record<string, AuthUser> = {};
    for (const u of authUsers) m[u.id] = u;
    return m;
  }, [authUsers]);

  // locations per user
  const locsByUser = useMemo(() => {
    const m: Record<string, Location[]> = {};
    for (const loc of locations) {
      if (!m[loc.user_id]) m[loc.user_id] = [];
      m[loc.user_id].push(loc);
    }
    return m;
  }, [locations]);

  // reviews per location
  const reviewsByLocation = useMemo(() => {
    const m: Record<string, Review[]> = {};
    for (const r of reviews) {
      if (!m[r.location_id]) m[r.location_id] = [];
      m[r.location_id].push(r);
    }
    return m;
  }, [reviews]);

  // reviews per user (via locations)
  const reviewsByUser = useMemo(() => {
    const m: Record<string, number> = {};
    for (const profile of profiles) {
      const userLocs = locsByUser[profile.id] || [];
      let count = 0;
      for (const loc of userLocs) count += (reviewsByLocation[loc.id] || []).length;
      m[profile.id] = count;
    }
    return m;
  }, [profiles, locsByUser, reviewsByLocation]);

  // location name map
  const locationNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const loc of locations) m[loc.id] = loc.name;
    return m;
  }, [locations]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalPro = profiles.filter((p) => p.plan === "pro").length;

  // ── Filtered / sorted users ───────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    let result = profiles.filter(
      (p) =>
        !q ||
        (p.business_name || "").toLowerCase().includes(q) ||
        (p.full_name || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
    );

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (userSort) {
        case "joined":
          cmp =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
        case "name":
          cmp = (a.business_name || a.full_name || "").localeCompare(
            b.business_name || b.full_name || ""
          );
          break;
        case "plan":
          cmp = (a.plan || "").localeCompare(b.plan || "");
          break;
        case "locations":
          cmp =
            (locsByUser[a.id] || []).length -
            (locsByUser[b.id] || []).length;
          break;
        case "reviews":
          cmp = (reviewsByUser[a.id] || 0) - (reviewsByUser[b.id] || 0);
          break;
      }
      return userSortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [profiles, search, userSort, userSortDir, locsByUser, reviewsByUser]);

  // ── Filtered locations ────────────────────────────────────────────────────

  const filteredLocations = useMemo(() => {
    const q = locationSearch.toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => {
      const owner = profiles.find((p) => p.id === loc.user_id);
      return (
        loc.name.toLowerCase().includes(q) ||
        (loc.address || "").toLowerCase().includes(q) ||
        (owner?.business_name || owner?.full_name || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [locations, locationSearch, profiles]);

  // ── Recent reviews ────────────────────────────────────────────────────────

  const recentReviews = useMemo(() => {
    return [...reviews]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);
  }, [reviews]);

  // ── Profile lookup ────────────────────────────────────────────────────────

  const profileByLocation = useMemo(() => {
    const locToUser: Record<string, string> = {};
    for (const loc of locations) locToUser[loc.id] = loc.user_id;
    const m: Record<string, Profile | undefined> = {};
    for (const loc of locations) {
      m[loc.id] = profiles.find((p) => p.id === locToUser[loc.id]);
    }
    return m;
  }, [locations, profiles]);

  // ── Render ────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "users", label: "Users", icon: <Users className="h-3.5 w-3.5" /> },
    {
      id: "locations",
      label: "Locations",
      icon: <MapPin className="h-3.5 w-3.5" />,
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen dot-grid noise">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="glass sticky top-0 z-40 border-b border-white/[0.05]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display hidden sm:inline">ReviewPulse</span>
            </Link>
            {/* Admin badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff6b4a]/25 bg-[#ff6b4a]/10 px-2.5 py-0.5 text-xs font-semibold text-[#ff6b4a]">
              <Shield className="h-3 w-3" />
              Admin Panel
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="btn-ghost inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 border border-[#ff6b4a]/20 text-xs font-bold text-[#ff6b4a] transition hover:border-[#ff6b4a]/40"
              >
                {(currentUser.email || "A")[0].toUpperCase()}
              </button>

              {showUserMenu && (
                <div className="glass absolute right-0 top-10 z-50 w-52 rounded-2xl border border-white/[0.08] p-1 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="text-xs text-[#8b8b9e] truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#8b8b9e] transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            <span className="gradient-text">Admin</span> Overview
          </h1>
          <p className="mt-1 text-sm text-[#8b8b9e]">
            Platform-wide data across all accounts
          </p>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Total Users",
              value: profiles.length,
              icon: <Users className="h-5 w-5 text-[#ff6b4a]" />,
              sub: `${totalPro} Pro`,
            },
            {
              label: "Total Locations",
              value: locations.length,
              icon: <MapPin className="h-5 w-5 text-[#ff6b4a]" />,
              sub: `across ${profiles.length} accounts`,
            },
            {
              label: "Total Reviews",
              value: reviews.length,
              icon: <Star className="h-5 w-5 text-[#ff6b4a]" />,
              sub:
                reviews.length > 0
                  ? `avg ${(
                      reviews.reduce((s, r) => s + r.rating, 0) /
                      reviews.length
                    ).toFixed(1)} ★`
                  : "no reviews yet",
            },
            {
              label: "Pro Subscribers",
              value: totalPro,
              icon: <Shield className="h-5 w-5 text-[#ff6b4a]" />,
              sub: `${
                profiles.length > 0
                  ? Math.round((totalPro / profiles.length) * 100)
                  : 0
              }% conversion`,
            },
          ].map((stat) => (
            <div key={stat.label} className="bento p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8b8b9e]">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-[#4a4a5e]">{stat.sub}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff6b4a]/15 bg-[#ff6b4a]/8">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#ff6b4a]/15 to-[#ff3d71]/10 text-white border border-[#ff6b4a]/20"
                  : "text-[#8b8b9e] hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === tab.id
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "bg-white/[0.06] text-[#4a4a5e]"
                }`}
              >
                {tab.id === "users"
                  ? profiles.length
                  : tab.id === "locations"
                  ? locations.length
                  : Math.min(reviews.length, 10)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Users table ────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="glass rounded-2xl overflow-hidden">
            {/* Search bar */}
            <div className="flex items-center gap-3 border-b border-white/[0.04] px-5 py-4">
              <Search className="h-4 w-4 text-[#4a4a5e]" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#4a4a5e] outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-[#4a4a5e] hover:text-[#8b8b9e] transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1.5fr_1.5fr] gap-4 border-b border-white/[0.04] px-5 py-3">
              <SortButton
                label="Business"
                sortKey="name"
                current={userSort}
                dir={userSortDir}
                onSort={handleUserSort}
              />
              <span className="text-xs font-medium text-[#8b8b9e]">Email</span>
              <SortButton
                label="Plan"
                sortKey="plan"
                current={userSort}
                dir={userSortDir}
                onSort={handleUserSort}
              />
              <SortButton
                label="Locations"
                sortKey="locations"
                current={userSort}
                dir={userSortDir}
                onSort={handleUserSort}
              />
              <SortButton
                label="Reviews"
                sortKey="reviews"
                current={userSort}
                dir={userSortDir}
                onSort={handleUserSort}
              />
              <SortButton
                label="Joined"
                sortKey="joined"
                current={userSort}
                dir={userSortDir}
                onSort={handleUserSort}
              />
              <span className="text-xs font-medium text-[#8b8b9e]">
                Last sign-in
              </span>
            </div>

            {/* Rows */}
            {filteredUsers.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#4a4a5e]">
                No users found
              </div>
            ) : (
              filteredUsers.map((profile) => {
                const auth = authUserMap[profile.id];
                const locCount = (locsByUser[profile.id] || []).length;
                const revCount = reviewsByUser[profile.id] || 0;
                const displayName =
                  profile.business_name ||
                  profile.full_name ||
                  profile.email ||
                  "—";

                return (
                  <div
                    key={profile.id}
                    className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1.5fr_1.5fr] gap-4 items-center border-b border-white/[0.04] px-5 py-3.5 transition hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {displayName}
                      </p>
                      {profile.full_name && profile.business_name && (
                        <p className="truncate text-xs text-[#4a4a5e]">
                          {profile.full_name}
                        </p>
                      )}
                    </div>
                    <p className="truncate text-sm text-[#8b8b9e]">
                      {profile.email || "—"}
                    </p>
                    <div>
                      <PlanBadge plan={profile.plan} />
                    </div>
                    <p className="text-sm text-[#8b8b9e]">{locCount}</p>
                    <p className="text-sm text-[#8b8b9e]">{revCount}</p>
                    <p className="text-sm text-[#8b8b9e]">
                      {formatDate(profile.created_at)}
                    </p>
                    <p className="text-sm text-[#8b8b9e]">
                      {auth?.last_sign_in_at
                        ? formatDate(auth.last_sign_in_at)
                        : "—"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Locations table ─────────────────────────────────────────────── */}
        {activeTab === "locations" && (
          <div className="glass rounded-2xl overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-white/[0.04] px-5 py-4">
              <Search className="h-4 w-4 text-[#4a4a5e]" />
              <input
                type="text"
                placeholder="Search by location, address or owner…"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#4a4a5e] outline-none"
              />
              {locationSearch && (
                <button
                  onClick={() => setLocationSearch("")}
                  className="text-xs text-[#4a4a5e] hover:text-[#8b8b9e] transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Header */}
            <div className="grid grid-cols-[2fr_2fr_2fr_1fr_1.5fr] gap-4 border-b border-white/[0.04] px-5 py-3">
              {["Location Name", "Address", "Owner", "Reviews", "Created"].map(
                (h) => (
                  <span key={h} className="text-xs font-medium text-[#8b8b9e]">
                    {h}
                  </span>
                )
              )}
            </div>

            {/* Rows */}
            {filteredLocations.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#4a4a5e]">
                No locations found
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const owner = profileByLocation[loc.id];
                const ownerName =
                  owner?.business_name || owner?.full_name || "—";
                const revCount = (reviewsByLocation[loc.id] || []).length;

                return (
                  <div
                    key={loc.id}
                    className="grid grid-cols-[2fr_2fr_2fr_1fr_1.5fr] gap-4 items-center border-b border-white/[0.04] px-5 py-3.5 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ff6b4a]/10 border border-[#ff6b4a]/15">
                        <MapPin className="h-3.5 w-3.5 text-[#ff6b4a]" />
                      </div>
                      <p className="truncate text-sm font-medium text-white">
                        {loc.name}
                      </p>
                    </div>
                    <p className="truncate text-sm text-[#8b8b9e]">
                      {loc.address || "—"}
                    </p>
                    <p className="truncate text-sm text-[#8b8b9e]">
                      {ownerName}
                    </p>
                    <p className="text-sm text-[#8b8b9e]">{revCount}</p>
                    <p className="text-sm text-[#8b8b9e]">
                      {formatDate(loc.created_at)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Activity feed ───────────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="border-b border-white/[0.04] px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Recent Reviews
              </h2>
              <p className="mt-0.5 text-xs text-[#4a4a5e]">
                Latest 10 reviews across all accounts
              </p>
            </div>

            {recentReviews.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#4a4a5e]">
                No reviews yet
              </div>
            ) : (
              <div>
                {recentReviews.map((review, i) => {
                  const locName =
                    locationNameMap[review.location_id] || "Unknown location";
                  const ownerProfile = profileByLocation[review.location_id];
                  const ownerName =
                    ownerProfile?.business_name ||
                    ownerProfile?.full_name ||
                    "Unknown";

                  return (
                    <div
                      key={review.id}
                      className={`flex items-start gap-4 px-5 py-4 transition hover:bg-white/[0.02] ${
                        i < recentReviews.length - 1
                          ? "border-b border-white/[0.04]"
                          : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 border border-[#ff6b4a]/15 text-sm font-bold text-[#ff6b4a]">
                        {(review.reviewer_name || "?")[0].toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {review.reviewer_name || "Anonymous"}
                          </span>
                          {renderStars(review.rating)}
                          {review.sentiment && (
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                                review.sentiment === "positive"
                                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/8"
                                  : review.sentiment === "negative"
                                  ? "text-red-400 border-red-500/20 bg-red-500/8"
                                  : "text-amber-400 border-amber-500/20 bg-amber-500/8"
                              }`}
                            >
                              {review.sentiment}
                            </span>
                          )}
                        </div>
                        {review.review_text && (
                          <p className="mt-1 line-clamp-2 text-sm text-[#8b8b9e]">
                            {review.review_text}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#4a4a5e]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {locName}
                          </span>
                          <span>·</span>
                          <span>{ownerName}</span>
                          <span>·</span>
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
