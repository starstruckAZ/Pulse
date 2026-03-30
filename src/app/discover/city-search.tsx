"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";

export interface CityOption {
  slug: string;
  display: string;
  count: number;
  avgRating: number | null;
}

export default function CitySearch({ cities }: { cities: CityOption[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim().length > 0
      ? cities.filter((c) =>
          c.display.toLowerCase().includes(query.toLowerCase())
        )
      : cities.slice(0, 8); // show top 8 when no query

  const navigate = (city: CityOption) => {
    setOpen(false);
    setQuery(city.display);
    router.push(`/discover/${encodeURIComponent(city.slug)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtered.length > 0) navigate(filtered[0]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-2xl border border-[#e1dcd8] bg-white px-4 py-3 shadow-sm focus-within:border-[#aa2c32] focus-within:ring-4 focus-within:ring-[rgba(170,44,50,0.08)] transition-all">
          <Search className="h-5 w-5 shrink-0 text-[#797674]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search your city…"
            className="flex-1 bg-transparent text-[#302e2d] placeholder-[#b0acaa] outline-none text-base"
          />
          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#aa2c32] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8f2329]"
          >
            Search <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#e1dcd8] bg-white shadow-xl">
          {filtered.map((city) => (
            <button
              key={city.slug}
              type="button"
              onClick={() => navigate(city)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#faf5f2]"
            >
              <MapPin className="h-4 w-4 shrink-0 text-[#aa2c32]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#302e2d]">{city.display}</p>
                <p className="text-xs text-[#797674]">
                  {city.count} {city.count === 1 ? "business" : "businesses"}
                  {city.avgRating ? ` · ${city.avgRating}★ avg` : ""}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#b0acaa]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
