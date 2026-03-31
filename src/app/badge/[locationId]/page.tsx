import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import BadgePreviewClient from "./badge-preview-client";

export const dynamic = "force-dynamic";

const createPublicClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

const BASE_URL = "https://reviewpulse.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const supabase = createPublicClient();
  const { data: location } = await supabase
    .from("locations")
    .select("name")
    .eq("id", locationId)
    .single();

  if (!location) return { title: "Badge — ReviewHype" };

  return {
    title: `${location.name} — Embed Badge | ReviewHype`,
    description: `Add a live review badge for ${location.name} to your website in seconds.`,
  };
}

export default async function BadgePage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const supabase = createPublicClient();

  const { data: location } = await supabase
    .from("locations")
    .select("id, name")
    .eq("id", locationId)
    .single();

  if (!location) notFound();

  const badgeUrl = `${BASE_URL}/api/badge/${locationId}`;
  const profileUrl = `${BASE_URL}/business/${locationId}`;

  const embedHtml = `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="${location.name} reviews on ReviewHype" width="200" height="48" />\n</a>`;

  const embedWordPress = `<!-- Add this to a Custom HTML block in your WordPress page/post -->\n<a href="${profileUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="${location.name} reviews on ReviewHype" width="200" height="48" />\n</a>`;

  const embedSquarespace = `1. In the Squarespace editor, click the (+) block button.\n2. Choose "Embed" from the block list.\n3. Switch to the "Code" tab.\n4. Paste the HTML snippet below, then click "Apply".\n\n<a href="${profileUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="${location.name} reviews on ReviewHype" width="200" height="48" />\n</a>`;

  return (
    <div className="min-h-screen dot-grid">
      {/* Background blobs */}
      <div className="mesh-gradient fixed left-1/4 top-0 h-[500px] w-[500px] bg-[#ff6b4a] opacity-[0.04]" />
      <div className="mesh-gradient fixed right-1/4 top-1/4 h-[400px] w-[400px] bg-[#ff3d71] opacity-[0.03]" />

      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display hidden sm:inline">ReviewHype</span>
          </Link>
          <Link href="/signup" className="btn-primary rounded-2xl px-5 py-2 text-sm">
            Get your free badge
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <span className="badge text-[#ff6b4a] border-[#ff6b4a]/20 bg-[#ff6b4a]/8 mb-4 inline-flex">
            Embeddable Badge
          </span>
          <h1 className="font-display mb-3 text-3xl font-bold sm:text-4xl">
            Add your review badge to{" "}
            <span className="gradient-text">{location.name}</span>
          </h1>
          <p className="text-zinc-400">
            A live-updating badge that shows your aggregate rating — paste one
            line of code on any website.
          </p>
        </div>

        {/* Badge Preview + Toggle — client component */}
        <BadgePreviewClient
          locationId={locationId}
          locationName={location.name}
          badgeUrl={badgeUrl}
          profileUrl={profileUrl}
          embedHtml={embedHtml}
          embedWordPress={embedWordPress}
          embedSquarespace={embedSquarespace}
        />

        {/* Link to full business profile */}
        <div className="mt-10 text-center">
          <p className="mb-3 text-sm text-zinc-500">
            Want to see the full review profile?
          </p>
          <Link
            href={`/business/${locationId}`}
            className="btn-ghost inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            View {location.name} on ReviewHype
          </Link>
        </div>
      </main>

      <footer className="glass mt-8 border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-zinc-400">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
            <MessageSquare className="h-2.5 w-2.5 text-white" />
          </div>
          Powered by ReviewHype
        </Link>
      </footer>
    </div>
  );
}
