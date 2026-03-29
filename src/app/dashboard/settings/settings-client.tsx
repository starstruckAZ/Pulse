"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare, LogOut, Settings, LayoutDashboard, BarChart3,
  MapPin, FileText, Save, AlertTriangle, Bell, User, Shield,
} from "lucide-react";

interface Profile {
  id: string;
  business_name?: string;
  full_name?: string;
  business_type?: string;
  phone?: string;
  website?: string;
  plan?: string;
  created_at?: string;
}

interface SettingsClientProps {
  user: { id: string; email?: string };
  profile: Profile | null;
}

const BUSINESS_TYPES = [
  { value: "", label: "Select a business type" },
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail" },
  { value: "healthcare", label: "Healthcare" },
  { value: "automotive", label: "Automotive" },
  { value: "hospitality", label: "Hospitality" },
  { value: "professional_services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

export default function SettingsClient({ user, profile }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Profile form state
  const [businessName, setBusinessName] = useState(profile?.business_name || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [businessType, setBusinessType] = useState(profile?.business_type || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [saving, setSaving] = useState(false);

  // Notification preferences (local state only)
  const [emailNewReviews, setEmailNewReviews] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(true);
  const [emailResponseReminders, setEmailResponseReminders] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const displayName = profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        business_name: businessName.trim() || null,
        full_name: fullName.trim() || null,
        business_type: businessType || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
      });

    setSaving(false);
    if (error) {
      showToast("Failed to save. Please try again.");
    } else {
      showToast("Settings saved successfully!");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`rounded-2xl px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${
            toast.includes("Failed")
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          }`}>
            {toast}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display hidden sm:inline">ReviewPulse</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </Link>
              <Link href="/dashboard/locations" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <MapPin className="h-3.5 w-3.5" /> Locations
              </Link>
              <Link href="/dashboard/templates" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 transition hover:text-white hover:bg-white/5">
                <FileText className="h-3.5 w-3.5" /> Templates
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white bg-white/5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {plan === "free" && (
              <Link href="#" className="badge text-orange-400 border-orange-500/20 bg-orange-500/5 text-xs hidden sm:inline-flex">Upgrade to Pro</Link>
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

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Settings</h1>
            <p className="text-sm text-zinc-500">Manage your account and preferences.</p>
          </div>
          {/* Mobile nav */}
          <div className="flex gap-2 md:hidden">
            <Link href="/dashboard" className="btn-ghost rounded-xl p-2"><LayoutDashboard className="h-4 w-4" /></Link>
            <Link href="/dashboard/analytics" className="btn-ghost rounded-xl p-2"><BarChart3 className="h-4 w-4" /></Link>
            <Link href="/dashboard/locations" className="btn-ghost rounded-xl p-2"><MapPin className="h-4 w-4" /></Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bento p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10">
                <User className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">Profile Settings</h2>
                <p className="text-xs text-zinc-500">Your business information</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input w-full"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="input w-full"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="input w-full"
                >
                  {BUSINESS_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="input w-full"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bento p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">Account Info</h2>
                <p className="text-xs text-zinc-500">Your account details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="input w-full cursor-not-allowed opacity-60"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Plan</label>
                  <span className={`badge text-sm ${
                    plan === "pro"
                      ? "text-orange-400 border-orange-500/20 bg-orange-500/10"
                      : "text-zinc-400 border-zinc-500/20 bg-zinc-500/10"
                  }`}>
                    {plan === "pro" ? "Pro" : "Free"}
                  </span>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Member Since</label>
                  <p className="text-sm text-zinc-400">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bento p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">Notification Preferences</h2>
                <p className="text-xs text-zinc-500">Choose what emails you receive</p>
              </div>
            </div>
            <div className="space-y-4">
              <ToggleRow
                label="New Review Alerts"
                description="Get notified when a new review is posted"
                checked={emailNewReviews}
                onChange={setEmailNewReviews}
              />
              <ToggleRow
                label="Weekly Digest"
                description="A summary of your reviews every Monday"
                checked={emailWeeklyDigest}
                onChange={setEmailWeeklyDigest}
              />
              <ToggleRow
                label="Response Reminders"
                description="Remind me about unanswered reviews"
                checked={emailResponseReminders}
                onChange={setEmailResponseReminders}
              />
              <p className="text-xs text-zinc-600 pt-2">
                Notification preferences will be synced to your account in a future update.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bento border-red-500/10 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-red-400">Danger Zone</h2>
                <p className="text-xs text-zinc-500">Irreversible actions</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-300">Sign out</p>
                  <p className="text-xs text-zinc-500">Sign out of your current session</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-5 py-2.5 text-sm hover:border-red-500/30 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
              <div className="border-t border-white/5 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Delete account</p>
                    <p className="text-xs text-zinc-500">Permanently delete your account and all data</p>
                  </div>
                  <button
                    disabled
                    className="btn-ghost inline-flex items-center gap-2 rounded-2xl border border-zinc-800 px-5 py-2.5 text-sm opacity-50 cursor-not-allowed"
                  >
                    <AlertTriangle className="h-4 w-4" /> Delete Account
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-600">Account deletion will be available in a future update.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Toggle switch component */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
