"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

export default function HomepageSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 max-w-xl">
      <div className="flex items-center gap-2 rounded-2xl border border-[#e1dcd8] bg-white px-4 py-3 shadow-sm focus-within:border-[#aa2c32] focus-within:ring-4 focus-within:ring-[rgba(170,44,50,0.08)] transition-all">
        <Search className="h-5 w-5 shrink-0 text-[#797674]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any business…"
          className="flex-1 bg-transparent text-[#302e2d] placeholder-[#b0acaa] outline-none text-base"
        />
        <button
          type="submit"
          disabled={query.trim().length < 2}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#aa2c32] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#8f2329] disabled:opacity-40"
        >
          Search <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-xs text-[#797674]">
        Try &quot;coffee shops in Phoenix&quot; or your business name
      </p>
    </form>
  );
}
