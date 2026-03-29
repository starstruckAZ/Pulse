"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus, Edit3, Trash2, LogOut, X, ThumbsUp, Minus, ThumbsDown, FileText } from "lucide-react";

interface Template {
  id: string;
  name: string;
  template_text: string;
  sentiment_filter: string | null;
  created_at: string;
}

interface Profile {
  business_name?: string;
  full_name?: string;
  plan?: string;
}

interface TemplatesClientProps {
  user: { id: string; email?: string };
  profile: Profile | null;
  templates: Template[];
}

export default function TemplatesClient({ user, profile, templates: initialTemplates }: TemplatesClientProps) {
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

  const displayName = profile?.business_name || profile?.full_name || user.email || "User";
  const plan = profile?.plan || "free";

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const openNew = () => { setEditing(null); setName(""); setText(""); setSentiment("all"); setShowModal(true); };
  const openEdit = (t: Template) => { setEditing(t); setName(t.name); setText(t.template_text); setSentiment(t.sentiment_filter || "all"); setShowModal(true); };

  const handleSave = async () => {
    if (!name.trim() || !text.trim()) return;
    setSaving(true);
    if (editing) {
      const { data } = await supabase.from("response_templates").update({ name: name.trim(), template_text: text.trim(), sentiment_filter: sentiment }).eq("id", editing.id).select().single();
      if (data) setTemplates((prev) => prev.map((t) => (t.id === editing.id ? data : t)));
    } else {
      const { data } = await supabase.from("response_templates").insert({ user_id: user.id, name: name.trim(), template_text: text.trim(), sentiment_filter: sentiment }).select().single();
      if (data) setTemplates((prev) => [data, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("response_templates").delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const sentimentIcon = (s: string | null) => {
    if (s === "positive") return <ThumbsUp className="h-3 w-3 text-emerald-400" />;
    if (s === "negative") return <ThumbsDown className="h-3 w-3 text-red-400" />;
    if (s === "neutral") return <Minus className="h-3 w-3 text-amber-400" />;
    return null;
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display">ReviewPulse</span>
            </Link>
            <Link href="/dashboard" className="text-sm text-zinc-500 transition hover:text-white">Dashboard</Link>
            <span className="text-sm text-zinc-300">Templates</span>
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
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5">
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
            <h1 className="font-display text-2xl font-bold">Response Templates</h1>
            <p className="text-sm text-zinc-500">Save and reuse your best review responses.</p>
          </div>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm">
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="bento py-20 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="mb-1 font-display text-lg font-medium text-zinc-400">No templates yet</h3>
            <p className="mb-6 text-sm text-zinc-500">Create templates to reply faster.</p>
            <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm">
              <Plus className="h-4 w-4" /> Create Your First Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((t) => (
              <div key={t.id} className="bento p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold">{t.name}</h3>
                    {t.sentiment_filter && t.sentiment_filter !== "all" && (
                      <span className="badge text-xs text-zinc-400">{sentimentIcon(t.sentiment_filter)} {t.sentiment_filter}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(t)} className="rounded-xl p-2 text-zinc-600 transition hover:bg-white/5 hover:text-white"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="rounded-xl p-2 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 line-clamp-3">{t.template_text}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{editing ? "Edit Template" : "New Template"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-xl p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Template Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" placeholder="e.g., Thank you response" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Sentiment Filter</label>
                <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="input w-full">
                  <option value="all">All sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Response Text</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="input w-full" placeholder="Write your template response here..." />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost rounded-2xl px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !name.trim() || !text.trim()} className="btn-primary rounded-2xl px-6 py-2.5 text-sm disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
