"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const MONTHLY = 39;
const YEARLY = 390;

export default function PricingToggle() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  const monthlyEquiv = interval === "yearly" ? Math.round(YEARLY / 12) : MONTHLY;
  const annualSavings = MONTHLY * 12 - YEARLY;

  return (
    <>
      {/* Toggle */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              interval === "monthly"
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-[#8b8b9e] hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition ${
              interval === "yearly"
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-[#8b8b9e] hover:text-white"
            }`}
          >
            Yearly
            <span className="rounded-full bg-[#ff6b4a]/15 px-2 py-0.5 text-[10px] font-semibold text-[#ff6b4a]">
              2 months free
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Free */}
        <div className="bento p-8 md:p-10">
          <p className="mb-2 text-sm font-medium text-[#8b8b9e]">Free</p>
          <div className="mb-8 flex items-baseline gap-1">
            <span className="font-display text-5xl font-bold tracking-tight">$0</span>
            <span className="text-[#4a4a5e]">/mo</span>
          </div>
          <ul className="mb-10 space-y-3.5 text-sm text-[#8b8b9e]">
            {["Google Reviews", "10 reviews tracked", "5 AI responses / month", "Weekly email digest"].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-[#4a4a5e]" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="btn-ghost block w-full rounded-2xl py-3.5 text-center text-sm">
            Get Started Free
          </Link>
        </div>

        {/* Pro */}
        <div className="relative bento p-8 md:p-10 ring-1 ring-[#ff6b4a]/15">
          <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff3d71] px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-[#ff6b4a]/20">
            Most Popular
          </div>
          <p className="mb-2 text-sm font-medium text-[#ff6b4a]">Pro</p>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="font-display text-5xl font-bold tracking-tight gradient-text">
              ${monthlyEquiv}
            </span>
            <span className="text-[#4a4a5e]">/mo</span>
          </div>
          {interval === "yearly" && (
            <p className="mb-6 text-xs text-[#8b8b9e]">
              Billed <span className="text-[#ff6b4a] font-medium">${YEARLY}/year</span>
              {" "}— save <span className="text-emerald-400 font-medium">${annualSavings}</span>
            </p>
          )}
          <ul className={`space-y-3.5 text-sm text-[#8b8b9e] ${interval === "yearly" ? "mb-10" : "mb-10 mt-8"}`}>
            {["Google, Yelp & Facebook", "Unlimited reviews", "Unlimited AI responses", "Instant email alerts", "Sentiment analytics", "Response templates"].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-[#ff6b4a]" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="btn-primary block w-full rounded-2xl py-3.5 text-center text-sm font-semibold">
            {interval === "yearly" ? `Get Pro — $${YEARLY}/yr` : `Get Pro — $${MONTHLY}/mo`}
          </Link>
        </div>
      </div>
    </>
  );
}
