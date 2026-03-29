export default function SettingsLoading() {
  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="h-7 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="h-8 w-8 animate-pulse rounded-xl bg-white/5" />
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 h-8 w-32 animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-64 animate-pulse rounded bg-white/[0.03]" />
        </div>

        {/* Profile form section */}
        <div className="mb-6 rounded-2xl border border-white/[0.05] bg-[#0a0a10] p-6">
          <div className="mb-5 h-6 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[#151520]" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-[#0f0f18]" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-10 w-28 animate-pulse rounded-2xl bg-[#151520]" />
        </div>

        {/* Account info card */}
        <div className="mb-6 rounded-2xl border border-white/[0.05] bg-[#0a0a10] p-6">
          <div className="mb-5 h-6 w-24 animate-pulse rounded-lg bg-white/5" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-[#151520]" />
                <div className="h-4 w-36 animate-pulse rounded bg-[#0f0f18]" />
              </div>
            ))}
          </div>
        </div>

        {/* Notification toggles */}
        <div className="rounded-2xl border border-white/[0.05] bg-[#0a0a10] p-6">
          <div className="mb-5 h-6 w-32 animate-pulse rounded-lg bg-white/5" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-40 animate-pulse rounded bg-[#151520]" />
                  <div className="h-3 w-56 animate-pulse rounded bg-[#0f0f18]" />
                </div>
                <div className="h-6 w-11 animate-pulse rounded-full bg-[#151520]" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
