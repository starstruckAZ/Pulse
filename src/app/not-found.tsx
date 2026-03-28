"use client";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-100">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-bold gradient-text">404</h1>
        <p className="mb-6 text-gray-400">Page not found</p>
        <a href="/" className="btn-glow inline-block rounded-lg px-6 py-2.5 text-sm font-semibold text-white">
          Go Home
        </a>
      </div>
    </div>
  );
}
