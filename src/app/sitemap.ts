import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    {
      path: "/how-it-works",
      priority: 0.9,
      changeFrequency: "monthly" as const,
    },
    { path: "/faq", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/signup", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.3, changeFrequency: "monthly" as const },
  ];

  const blogSlugs = [
    "why-online-reviews-matter-local-business",
    "how-to-respond-negative-reviews",
    "google-review-management-guide",
    "ai-review-responses-best-practices",
    "reputation-management-roi",
  ];

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
  ];
}
