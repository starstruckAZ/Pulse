import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/cookie-banner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpulse.info";

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
  ],
  authors: [{ name: "ReviewPulse" }],
  creator: "ReviewPulse",
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
      "Google, Yelp, Facebook — all your reviews in one dashboard. AI-powered responses. Sentiment tracking.",
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
      "Google, Yelp, Facebook — all reviews in one dashboard. Sentiment tracking. Business search.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: { canonical: siteUrl },
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
          "Review management platform for local businesses.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "ReviewPulse",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "ReviewPulse",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: siteUrl,
        offers: [
          { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
          { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "500",
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..800;1,6..72,300..800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="dot-grid noise font-body antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
