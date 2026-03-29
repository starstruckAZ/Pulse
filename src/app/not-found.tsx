"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 font-display text-6xl font-bold gradient-text">404</h1>
        <p className="mb-8 text-[#8b8b9e]">Page not found</p>
        <Link href="/" className="btn-primary inline-block rounded-2xl px-6 py-3 text-sm">
          Go Home
        </Link>
      </div>
    </div>
  );
}
