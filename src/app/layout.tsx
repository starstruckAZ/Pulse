import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ReviewPulse — Review Management for Local Businesses",
    template: "%s | ReviewPulse",
  },
  description:
    "See every review from Google, Yelp, and Facebook in one place. Reply with AI-powered responses. Track sentiment. Never miss a review again.",
  keywords: [
    "review management",
    "online reputation management",
    "Google reviews",
    "Yelp reviews",
    "Facebook reviews",
    "local business reviews",
    "AI review responses",
    "sentiment analysis",
    "review monitoring",
    "reputation management software",
    "review aggregator",
    "local SEO",
    "business reputation",
    "customer feedback management",
    "review reply tool",
  ],
  authors: [{ name: "ReviewPulse" }],
  creator: "ReviewPulse",
  publisher: "ReviewPulse",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ReviewPulse",
    title: "ReviewPulse — Review Management for Local Businesses",
    description:
      "Google, Yelp, Facebook — all your reviews in one dashboard. AI-powered responses. Sentiment tracking. Never miss a review again.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ReviewPulse — All your reviews in one dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewPulse — Review Management for Local Businesses",
    description:
      "Google, Yelp, Facebook — all reviews in one dashboard. AI responses. Sentiment tracking.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "Business Software",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "ReviewPulse",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description:
          "Review management platform for local businesses. Aggregate reviews from Google, Yelp, and Facebook into one dashboard.",
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "ReviewPulse",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "ReviewPulse",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description:
          "AI-powered review management platform that aggregates Google, Yelp, and Facebook reviews into a single dashboard with sentiment analysis and automated responses.",
        offers: [
          {
            "@type": "Offer",
            name: "Free Plan",
            price: "0",
            priceCurrency: "USD",
            description:
              "Google reviews, 10 reviews tracked, 5 AI responses per month",
          },
          {
            "@type": "Offer",
            name: "Pro Plan",
            price: "49",
            priceCurrency: "USD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "49",
              priceCurrency: "USD",
              billingDuration: "P1M",
            },
            description:
              "All platforms, unlimited reviews, unlimited AI responses, sentiment analytics",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "500",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: [
          "Multi-platform review aggregation",
          "AI-powered response generation",
          "Sentiment analysis",
          "Real-time notifications",
          "Response templates",
          "Analytics dashboard",
        ],
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="bg-[#0a0a0f] text-gray-100 antialiased"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
