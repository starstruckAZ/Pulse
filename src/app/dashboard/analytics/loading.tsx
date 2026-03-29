export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="h-7 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="h-8 w-8 animate-pulse rounded-xl bg-white/5" />
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 h-8 w-40 animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-72 animate-pulse rounded bg-white/[0.03]" />
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-white/[0.05] bg-[#0f0f18]"
            />
          ))}
        </div>

        {/* Time period selector */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-20 animate-pulse rounded-xl bg-[#151520]"
            />
          ))}
        </div>

        {/* Chart areas */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl border border-white/[0.05] bg-[#0f0f18]" />
          <div className="h-72 animate-pulse rounded-2xl border border-white/[0.05] bg-[#0f0f18]" />
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-white/[0.05] bg-[#0a0a10] p-6">
          <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-white/5" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-xl bg-[#151520]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#151520]" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[#0f0f18]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
