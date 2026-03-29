"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-100">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-bold gradient-text">Oops</h1>
        <p className="mb-6 text-gray-400">Something went wrong</p>
        <button
          onClick={reset}
          className="btn-glow rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
