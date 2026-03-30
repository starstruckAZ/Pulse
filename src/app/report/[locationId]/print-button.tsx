"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className={className ?? "btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm"}
    >
      <Printer className="h-4 w-4" />
      Print Report
    </button>
  );
}
