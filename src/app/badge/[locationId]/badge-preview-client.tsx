"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  locationId: string;
  locationName: string;
  badgeUrl: string;
  profileUrl: string;
  embedHtml: string;
  embedWordPress: string;
  embedSquarespace: string;
}

type Tab = "html" | "wordpress" | "squarespace";
type Style = "dark" | "light";

export default function BadgePreviewClient({
  locationName,
  badgeUrl,
  embedHtml,
  embedWordPress,
  embedSquarespace,
}: Props) {
  const [style, setStyle] = useState<Style>("dark");
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [copied, setCopied] = useState(false);

  const badgeSrc = `${badgeUrl}${style === "light" ? "?style=light" : ""}`;

  const embedSnippets: Record<Tab, string> = {
    html: embedHtml,
    wordpress: embedWordPress,
    squarespace: embedSquarespace,
  };

  const tabLabels: Record<Tab, string> = {
    html: "HTML",
    wordpress: "WordPress",
    squarespace: "Squarespace",
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippets[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = embedSnippets[activeTab];
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Badge Preview */}
      <div className="bento p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-zinc-200">
            Live Preview
          </h2>

          {/* Dark / Light toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
            {(["dark", "light"] as Style[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  style === s
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Preview area */}
        <div
          className={`flex items-center justify-center rounded-2xl p-10 transition-colors ${
            style === "light"
              ? "bg-zinc-100"
              : "bg-[#0a0a14] border border-white/5"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={badgeSrc}
            src={badgeSrc}
            alt={`${locationName} reviews on ReviewHype`}
            width={200}
            height={48}
            className="block"
          />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Actual size · Updates every hour
        </p>
      </div>

      {/* Embed Code */}
      <div className="bento p-6">
        <h2 className="font-display mb-4 font-semibold text-zinc-200">
          Embed Code
        </h2>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1">
          {(["html", "wordpress", "squarespace"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                activeTab === tab
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="relative">
          <pre className="overflow-x-auto rounded-2xl border border-white/5 bg-black/40 p-4 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap break-all">
            {embedSnippets[activeTab]}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Per-tab hint */}
        {activeTab === "wordpress" && (
          <p className="mt-3 text-xs text-zinc-600">
            In WordPress, go to your page/post editor, add a{" "}
            <span className="text-zinc-400">Custom HTML</span> block, and paste
            the code above.
          </p>
        )}
        {activeTab === "squarespace" && (
          <p className="mt-3 text-xs text-zinc-600">
            Follow the instructions in the snippet above. The Embed block is
            found under{" "}
            <span className="text-zinc-400">More &rsaquo; Embed</span> in the
            block picker.
          </p>
        )}
      </div>
    </div>
  );
}
