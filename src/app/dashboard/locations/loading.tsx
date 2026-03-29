export default function LocationsLoading() {
  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="h-7 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="h-8 w-8 animate-pulse rounded-xl bg-white/5" />
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header with title + add button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 h-8 w-36 animate-pulse rounded-lg bg-white/5" />
            <div className="h-4 w-56 animate-pulse rounded bg-white/[0.03]" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-2xl bg-[#151520]" />
        </div>

        {/* Location cards grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.05] bg-[#0a0a10] p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-[#151520]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#151520]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#0f0f18]" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-24 animate-pulse rounded-xl bg-[#0f0f18]" />
                <div className="h-8 w-20 animate-pulse rounded-xl bg-[#0f0f18]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
