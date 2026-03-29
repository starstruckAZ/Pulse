"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 font-display text-6xl font-bold gradient-text">Oops</h1>
        <p className="mb-8 text-[#8b8b9e]">Something went wrong</p>
        <button onClick={reset} className="btn-primary rounded-2xl px-6 py-3 text-sm">
          Try Again
        </button>
      </div>
    </div>
  );
}
