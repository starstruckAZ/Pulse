"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Plus, Edit3, Trash2, LogOut, X,
  ThumbsUp, Minus, ThumbsDown, FileText,
  LayoutDashboard, BarChart3, MapPin, Settings, Code2, Copy, Check,
} from "lucide-react";

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

const MAX_CHARS = 500;

const VARIABLES = ["{reviewer_name}", "{business_name}", "{rating}"];

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleCopy = async (id: string, templateText: string) => {
    try {
      await navigator.clipboard.writeText(templateText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const insertVariable = (variable: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setText((prev) => prev + variable);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = text.slice(0, start) + variable + text.slice(end);
    setText(newText);
    // Restore cursor after inserted variable
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + variable.length, start + variable.length);
    });
  };

  const sentimentBadge = (s: string | null) => {
    if (s === "positive") {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <ThumbsUp className="h-3 w-3" /> Positive
        </span>
      );
    }
    if (s === "negative") {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20">
          <ThumbsDown className="h-3 w-3" /> Negative
        </span>
      );
    }
    if (s === "neutral") {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
          <Minus className="h-3 w-3" /> Neutral
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
        All
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display hidden sm:inline">ReviewPulse</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </Link>
              <Link href="/dashboard/locations" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <MapPin className="h-3.5 w-3.5" /> Locations
              </Link>
              <Link href="/dashboard/templates" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white bg-white/5">
                <FileText className="h-3.5 w-3.5" /> Templates
              </Link>
              <Link href="/dashboard/widget" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <Code2 className="h-3.5 w-3.5" /> Widget
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[#8b8b9e] transition hover:text-white hover:bg-white/5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {plan === "free" && (
              <Link href="/dashboard/upgrade" className="badge text-[#ff6b4a] border-[#ff6b4a]/20 bg-[#ff6b4a]/5 text-xs hidden sm:inline-flex">Upgrade to Pro</Link>
            )}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm transition hover:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20 text-xs font-bold text-[#ff6b4a]">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-[#8b8b9e] border-b border-white/[0.04] mb-1">{user.email}</div>
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

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Response Templates</h1>
            <p className="text-sm text-[#8b8b9e]">Save and reuse your best review responses.</p>
          </div>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm">
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="bento py-20 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="mb-1 font-display text-lg font-medium text-zinc-400">No templates yet</h3>
            <p className="mb-6 text-sm text-[#8b8b9e]">Create templates to reply faster.</p>
            <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm">
              <Plus className="h-4 w-4" /> Create Your First Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((t) => (
              <div key={t.id} className="bento p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display font-semibold">{t.name}</h3>
                    {sentimentBadge(t.sentiment_filter && t.sentiment_filter !== "all" ? t.sentiment_filter : null)}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(t.id, t.template_text)}
                        className="rounded-xl p-2 text-zinc-600 transition hover:bg-white/5 hover:text-[#ff6b4a]"
                        title="Copy to clipboard"
                      >
                        {copiedId === t.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                      {copiedId === t.id && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-800 border border-white/[0.04] px-2 py-1 text-xs text-emerald-400 whitespace-nowrap pointer-events-none">
                          Copied!
                        </span>
                      )}
                    </div>
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
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  rows={5}
                  className="input w-full"
                  placeholder="Write your template response here..."
                />
                {/* Character count */}
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLES.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="rounded-md bg-white/[0.04] border border-white/[0.04] px-2 py-0.5 font-mono text-xs text-[#ff6b4a] transition hover:bg-[#ff6b4a]/10 hover:border-[#ff6b4a]/30"
                        title={`Insert ${v}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <span className={`text-xs tabular-nums ${text.length >= MAX_CHARS ? "text-red-400" : "text-[#8b8b9e]"}`}>
                    {text.length} / {MAX_CHARS}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8b8b9e]">Available variables: click a chip above to insert at cursor.</p>
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
