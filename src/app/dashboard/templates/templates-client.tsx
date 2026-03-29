"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  LogOut,
  X,
  ThumbsUp,
  Minus,
  ThumbsDown,
  FileText,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  template_text: string;
  sentiment_filter: string | null;
  created_at: string;
}

interface TemplatesClientProps {
  user: any;
  profile: any;
  templates: Template[];
}

export default function TemplatesClient({
  user,
  profile,
  templates: initialTemplates,
}: TemplatesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [templates, setTemplates] = useState(initialTemplates);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState("all");
  const [saving, setSaving] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const displayName =
    profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const openNew = () => {
    setEditing(null);
    setName("");
    setText("");
    setSentiment("all");
    setShowModal(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setName(t.name);
    setText(t.template_text);
    setSentiment(t.sentiment_filter || "all");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !text.trim()) return;
    setSaving(true);

    if (editing) {
      const { data } = await supabase
        .from("response_templates")
        .update({
          name: name.trim(),
          template_text: text.trim(),
          sentiment_filter: sentiment,
        })
        .eq("id", editing.id)
        .select()
        .single();

      if (data) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === editing.id ? data : t))
        );
      }
    } else {
      const { data } = await supabase
        .from("response_templates")
        .insert({
          user_id: user.id,
          name: name.trim(),
          template_text: text.trim(),
          sentiment_filter: sentiment,
        })
        .select()
        .single();

      if (data) {
        setTemplates((prev) => [data, ...prev]);
      }
    }

    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("response_templates").delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const sentimentIcon = (s: string | null) => {
    switch (s) {
      case "positive":
        return <ThumbsUp className="h-3 w-3 text-green-400" />;
      case "negative":
        return <ThumbsDown className="h-3 w-3 text-red-400" />;
      case "neutral":
        return <Minus className="h-3 w-3 text-yellow-400" />;
      default:
        return null;
    }
  };

  const sentimentLabel = (s: string | null) => {
    if (!s || s === "all") return "All sentiments";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold"
            >
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              ReviewPulse
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 transition hover:text-white"
            >
              Dashboard
            </Link>
            <span className="text-sm text-gray-300">Templates</span>
          </div>
          <div className="flex items-center gap-4">
            {plan === "free" && (
              <Link
                href="#"
                className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
              >
                Upgrade to Pro
              </Link>
            )}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition hover:bg-white/5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-400">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#1a1a2e] p-2 shadow-xl">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Response Templates</h1>
            <p className="text-sm text-gray-400">
              Save and reuse your best review responses.
            </p>
          </div>
          <button
            onClick={openNew}
            className="btn-glow inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="glow-card rounded-2xl py-20 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <h3 className="mb-1 text-lg font-medium text-gray-400">
              No templates yet
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Create response templates to reply to reviews faster.
            </p>
            <button
              onClick={openNew}
              className="btn-glow inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Create Your First Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="glow-card rounded-xl p-6 transition"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{t.name}</h3>
                    {t.sentiment_filter && t.sentiment_filter !== "all" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-xs text-gray-400">
                        {sentimentIcon(t.sentiment_filter)}{" "}
                        {sentimentLabel(t.sentiment_filter)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-400 line-clamp-3">
                  {t.template_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121a] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Edit Template" : "New Template"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="e.g., Thank you response"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Sentiment Filter
                </label>
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                >
                  <option value="all">All sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Response Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="Write your template response here. Use [Name] as a placeholder for the reviewer's name."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim() || !text.trim()}
                className="btn-glow rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
