export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
          <div className="h-7 w-7 animate-pulse rounded-full bg-white/10" />
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <div className="mb-2 h-8 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-64 animate-pulse rounded bg-white/5" />
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glow-card h-28 animate-pulse rounded-xl"
            />
          ))}
        </div>
        <div className="glow-card h-96 animate-pulse rounded-2xl" />
      </main>
    </div>
  );
}
