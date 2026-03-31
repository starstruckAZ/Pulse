"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Star,
  LogOut,
  BarChart3,
  MapPin,
  Settings,
  LayoutDashboard,
  FileText,
  Code,
  Copy,
  Check,
  ChevronDown,
  Eye,
} from "lucide-react";

interface Profile {
  business_name?: string;
  full_name?: string;
  plan?: string;
}

interface Location {
  id: string;
  name: string;
}

interface WidgetClientProps {
  user: { id: string; email?: string };
  profile: Profile | null;
  locations: Location[];
}

interface WidgetConfig {
  theme: "light" | "dark";
  limit: number;
  showStars: boolean;
  showDates: boolean;
  minRating: number;
}

const MOCK_REVIEWS = [
  {
    name: "Sarah M.",
    rating: 5,
    text: "Absolutely wonderful experience! The team went above and beyond to make sure everything was perfect. Highly recommend to anyone looking for top-notch service.",
    date: "2026-03-15",
  },
  {
    name: "James K.",
    rating: 4,
    text: "Great service overall. Very professional staff and clean environment. Would definitely come back again.",
    date: "2026-03-10",
  },
  {
    name: "Emily R.",
    rating: 5,
    text: "Best in the area, hands down. I've been coming here for years and they never disappoint. The attention to detail is remarkable.",
    date: "2026-03-05",
  },
  {
    name: "Michael T.",
    rating: 3,
    text: "Decent experience. Nothing extraordinary but got the job done. Pricing could be more competitive.",
    date: "2026-02-28",
  },
  {
    name: "Lisa W.",
    rating: 5,
    text: "Outstanding! From start to finish, the whole process was smooth and effortless. Will be recommending to all my friends.",
    date: "2026-02-20",
  },
];

export default function WidgetClient({
  user,
  profile,
  locations,
}: WidgetClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<string>(
    locations[0]?.id || ""
  );
  const [config, setConfig] = useState<WidgetConfig>({
    theme: "dark",
    limit: 5,
    showStars: true,
    showDates: true,
    minRating: 1,
  });
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName =
    profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  const selectedLocationName =
    locations.find((l) => l.id === selectedLocation)?.name || "Your Business";

  const embedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/widget/${selectedLocation}?theme=${config.theme}&limit=${config.limit}&minRating=${config.minRating}&showStars=${config.showStars}&showDates=${config.showDates}`
      : "";

  const embedCode = `<!-- ReviewHype Widget -->
<div id="reviewpulse-widget" style="width:100%;max-width:600px;"></div>
<script>
(function(){
  var d=document,f=d.createElement('iframe');
  f.src='${embedUrl}';
  f.style.cssText='width:100%;border:none;min-height:500px;border-radius:16px;';
  f.title='Reviews powered by ReviewHype';
  d.getElementById('reviewpulse-widget').appendChild(f);
  window.addEventListener('message',function(e){
    if(e.data&&e.data.type==='reviewpulse-resize'){
      f.style.height=e.data.height+'px';
    }
  });
})();
</script>`;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [embedCode]);

  const filteredMockReviews = MOCK_REVIEWS.filter(
    (r) => r.rating >= config.minRating
  ).slice(0, config.limit);

  const avgRating =
    filteredMockReviews.length > 0
      ? (
          filteredMockReviews.reduce((s, r) => s + r.rating, 0) /
          filteredMockReviews.length
        ).toFixed(1)
      : "0";

  const renderPreviewStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rating
              ? "fill-orange-400 text-orange-400"
              : config.theme === "dark"
              ? "text-zinc-700"
              : "text-zinc-300"
          }`}
        />
      ))}
    </div>
  );

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
              <span className="font-display hidden sm:inline">ReviewHype</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </Link>
              <Link
                href="/dashboard/locations"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <MapPin className="h-3.5 w-3.5" /> Locations
              </Link>
              <Link
                href="/dashboard/templates"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <FileText className="h-3.5 w-3.5" /> Templates
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5"
              >
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
              <Link
                href="/dashboard/widget"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white bg-white/5"
              >
                <Code className="h-3.5 w-3.5" /> Widget
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {plan === "free" && (
              <Link
                href="#"
                className="badge text-orange-400 border-orange-500/20 bg-orange-500/5 text-xs hidden sm:inline-flex"
              >
                Upgrade to Pro
              </Link>
            )}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm transition hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-white/5 mb-1">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Code className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                Review Widget
              </h1>
              <p className="text-sm text-zinc-500">
                Embed a review display on your website
              </p>
            </div>
          </div>
        </div>

        {locations.length === 0 ? (
          <div className="bento p-12 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="mb-2 font-display text-lg font-medium text-zinc-400">
              No locations yet
            </h3>
            <p className="mb-6 text-sm text-zinc-500">
              Add a location first to create an embeddable review widget.
            </p>
            <Link
              href="/dashboard/locations"
              className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm"
            >
              <MapPin className="h-4 w-4" /> Add Location
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column: Configuration */}
            <div className="space-y-6">
              {/* Location selector */}
              <div className="bento p-6">
                <h2 className="mb-4 font-display font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  Location
                </h2>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="input w-full appearance-none pr-10"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Widget style options */}
              <div className="bento p-6">
                <h2 className="mb-4 font-display font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4 text-orange-400" />
                  Widget Options
                </h2>
                <div className="space-y-4">
                  {/* Theme */}
                  <div>
                    <label className="mb-1.5 block text-sm text-zinc-400">
                      Theme
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setConfig((c) => ({ ...c, theme: "dark" }))
                        }
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                          config.theme === "dark"
                            ? "bg-white/10 text-white border border-orange-500/30"
                            : "bg-white/5 text-zinc-500 border border-white/5 hover:border-white/10"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() =>
                          setConfig((c) => ({ ...c, theme: "light" }))
                        }
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                          config.theme === "light"
                            ? "bg-white/10 text-white border border-orange-500/30"
                            : "bg-white/5 text-zinc-500 border border-white/5 hover:border-white/10"
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  {/* Max reviews */}
                  <div>
                    <label className="mb-1.5 block text-sm text-zinc-400">
                      Max Reviews
                    </label>
                    <div className="flex gap-2">
                      {[3, 5, 10].map((n) => (
                        <button
                          key={n}
                          onClick={() =>
                            setConfig((c) => ({ ...c, limit: n }))
                          }
                          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                            config.limit === n
                              ? "bg-white/10 text-white border border-orange-500/30"
                              : "bg-white/5 text-zinc-500 border border-white/5 hover:border-white/10"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Min rating */}
                  <div>
                    <label className="mb-1.5 block text-sm text-zinc-400">
                      Minimum Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() =>
                            setConfig((c) => ({ ...c, minRating: n }))
                          }
                          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                            config.minRating === n
                              ? "bg-white/10 text-white border border-orange-500/30"
                              : "bg-white/5 text-zinc-500 border border-white/5 hover:border-white/10"
                          }`}
                        >
                          {n}+
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showStars}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            showStars: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500/20"
                      />
                      <span className="text-sm text-zinc-300">
                        Show Stars
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showDates}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            showDates: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500/20"
                      />
                      <span className="text-sm text-zinc-300">
                        Show Dates
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Embed code */}
              <div className="bento p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display font-semibold flex items-center gap-2">
                    <Code className="h-4 w-4 text-orange-400" />
                    Embed Code
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                      copied
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-zinc-400 border border-white/5 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <pre className="overflow-x-auto rounded-xl bg-black/40 border border-white/5 p-4 text-xs text-zinc-400 leading-relaxed">
                    <code>{embedCode}</code>
                  </pre>
                </div>
                <p className="mt-3 text-xs text-zinc-600">
                  Paste this code into your website&apos;s HTML where you want
                  the reviews to appear.
                </p>
              </div>
            </div>

            {/* Right column: Live Preview */}
            <div className="space-y-6">
              <div className="bento p-6">
                <h2 className="mb-4 font-display font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-400" />
                  Live Preview
                </h2>

                {/* Preview container */}
                <div
                  className={`rounded-2xl overflow-hidden border ${
                    config.theme === "dark"
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {/* Preview header */}
                  <div
                    className={`px-5 py-4 border-b ${
                      config.theme === "dark"
                        ? "border-zinc-800"
                        : "border-zinc-100"
                    }`}
                  >
                    <h3
                      className={`text-base font-semibold ${
                        config.theme === "dark"
                          ? "text-white"
                          : "text-zinc-900"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {selectedLocationName}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i <= Math.round(Number(avgRating))
                                ? "fill-orange-400 text-orange-400"
                                : config.theme === "dark"
                                ? "text-zinc-700"
                                : "text-zinc-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-sm ${
                          config.theme === "dark"
                            ? "text-zinc-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {avgRating} average ({filteredMockReviews.length}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>

                  {/* Preview reviews */}
                  <div
                    className={`divide-y ${
                      config.theme === "dark"
                        ? "divide-zinc-800/50"
                        : "divide-zinc-100"
                    }`}
                  >
                    {filteredMockReviews.map((review, idx) => (
                      <div key={idx} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-sm font-medium ${
                              config.theme === "dark"
                                ? "text-white"
                                : "text-zinc-900"
                            }`}
                          >
                            {review.name}
                          </span>
                          {config.showDates && (
                            <span
                              className={`text-xs ${
                                config.theme === "dark"
                                  ? "text-zinc-600"
                                  : "text-zinc-400"
                              }`}
                            >
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {config.showStars && renderPreviewStars(review.rating)}
                        <p
                          className={`mt-1.5 text-sm leading-relaxed line-clamp-2 ${
                            config.theme === "dark"
                              ? "text-zinc-400"
                              : "text-zinc-600"
                          }`}
                        >
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Powered by footer */}
                  <div
                    className={`px-5 py-3 text-center border-t ${
                      config.theme === "dark"
                        ? "border-zinc-800"
                        : "border-zinc-100"
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        config.theme === "dark"
                          ? "text-zinc-600"
                          : "text-zinc-400"
                      }`}
                    >
                      Powered by{" "}
                      <span className="font-semibold text-orange-400">
                        ReviewHype
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
