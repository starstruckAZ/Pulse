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
        <div className="inline-flex items-center gap-1 rounded-full border border-[#e1dcd8] bg-[#f5f0ed] p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              interval === "monthly"
                ? "bg-white text-[#302e2d] shadow-sm"
                : "text-[#797674] hover:text-[#302e2d]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              interval === "yearly"
                ? "bg-white text-[#302e2d] shadow-sm"
                : "text-[#797674] hover:text-[#302e2d]"
            }`}
          >
            Yearly
            <span className="rounded-full bg-[#aa2c32]/10 px-2 py-0.5 text-[10px] font-bold text-[#aa2c32]">
              2 months free
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trial */}
        <div className="bento p-8 md:p-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#797674]">Free Trial</p>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="font-headline text-5xl font-bold tracking-tight text-[#302e2d]">$0</span>
            <span className="text-[#797674]">/7 days</span>
          </div>
          <p className="mb-8 text-xs text-[#797674]">Full Pro access, no credit card required</p>
          <ul className="mb-10 space-y-3.5 text-sm text-[#5d5b59]">
            {["All review platforms", "Unlimited reviews", "Response templates", "Sentiment analytics", "7-day full access"].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ece7e4]">
                  <Check className="h-3 w-3 text-[#5d5b59]" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="btn-ghost block w-full rounded-xl py-3.5 text-center text-sm font-semibold">
            Start Free Trial
          </Link>
        </div>

        {/* Pro */}
        <div className="bento relative p-8 ring-2 ring-[#aa2c32]/20 md:p-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#aa2c32] to-[#ff7574] px-5 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#aa2c32]/25">
            Most Popular
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#aa2c32]">Pro</p>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="font-headline text-5xl font-bold tracking-tight text-[#aa2c32]">
              ${monthlyEquiv}
            </span>
            <span className="text-[#797674]">/mo</span>
          </div>
          {interval === "yearly" && (
            <p className="mb-6 text-xs text-[#797674]">
              Billed <span className="font-semibold text-[#302e2d]">${YEARLY}/year</span>
              {" "}&mdash; save <span className="font-semibold text-emerald-600">${annualSavings}</span>
            </p>
          )}
          <ul className={`space-y-3.5 text-sm text-[#5d5b59] ${interval === "yearly" ? "mb-10" : "mb-10 mt-8"}`}>
            {["Google, Yelp & Facebook", "Unlimited reviews", "Instant email alerts", "Sentiment analytics", "Response templates", "Monthly reports", "Competitor benchmarking"].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#aa2c32]/10">
                  <Check className="h-3 w-3 text-[#aa2c32]" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="btn-primary block w-full rounded-xl py-3.5 text-center text-sm font-semibold">
            {interval === "yearly" ? `Get Pro — $${YEARLY}/yr` : `Get Pro — $${MONTHLY}/mo`}
          </Link>
        </div>
      </div>
    </>
  );
}
