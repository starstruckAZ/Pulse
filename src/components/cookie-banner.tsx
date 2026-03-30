"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

const COOKIE_KEY = "rp_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage unavailable (SSR / private mode) — just hide
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(COOKIE_KEY, "accepted"); } catch { /* noop */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem(COOKIE_KEY, "declined"); } catch { /* noop */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="glass rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/40 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#ff3d71]/20">
            <Cookie className="h-4.5 w-4.5 text-[#ff6b4a]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-sm font-semibold text-white">We use cookies</p>
            <p className="text-xs leading-relaxed text-zinc-400">
              We use essential cookies to keep you logged in and optional analytics cookies to
              improve the experience. Read our{" "}
              <Link href="/privacy" className="text-[#ff6b4a] hover:underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </div>
          <button
            onClick={decline}
            aria-label="Dismiss"
            className="mt-0.5 shrink-0 rounded-lg p-1 text-zinc-600 transition hover:bg-white/5 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={decline}
            className="btn-ghost rounded-xl px-4 py-2 text-xs"
          >
            Decline optional
          </button>
          <button
            onClick={accept}
            className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs"
          >
            <Check className="h-3.5 w-3.5" />
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
