import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "@/lib/categories";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function parseCityFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) return parts[parts.length - 2] ?? "";
  if (parts.length === 2) return parts[0];
  return "";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/discover", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/signup", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" as const },
  ];

  const blogSlugs = [
    "why-online-reviews-matter-local-business",
    "how-to-respond-negative-reviews",
    "google-review-management-guide",
    "review-response-templates-guide",
    "reputation-management-roi",
  ];

  // Fetch listed locations for dynamic discover URLs
  const discoverUrls: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    const { data: locations } = await supabase
      .from("locations")
      .select("city, address, category")
      .neq("listed", false);

    // Build unique cities
    const citySet = new Set<string>();
    const cityCategoryPairs = new Set<string>();

    for (const loc of locations ?? []) {
      const rawCity =
        (loc.city as string | null)?.trim() ||
        parseCityFromAddress(loc.address ?? "");
      if (!rawCity) continue;

      const citySlug = rawCity.toLowerCase();
      citySet.add(citySlug);

      const cat = loc.category as string | null;
      if (cat && CATEGORIES.find((c) => c.slug === cat)) {
        cityCategoryPairs.add(`${citySlug}__${cat}`);
      }
    }

    // City pages
    for (const citySlug of citySet) {
      discoverUrls.push({
        url: `${siteUrl}/discover/${encodeURIComponent(citySlug)}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    // City + category pages
    for (const pair of cityCategoryPairs) {
      const [citySlug, catSlug] = pair.split("__");
      discoverUrls.push({
        url: `${siteUrl}/discover/${encodeURIComponent(citySlug)}/${catSlug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.75,
      });
    }
  } catch {
    // Sitemap generation must not fail silently in production
    console.error("sitemap: failed to fetch discover URLs");
  }

  return [
    ...staticPages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...discoverUrls,
  ];
}
