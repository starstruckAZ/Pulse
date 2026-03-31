import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Search Any Business — ReviewHype",
  description:
    "Search for any business and see Google ratings, reviews, and more. Claim your business to manage reviews with ReviewHype.",
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchClient />
    </Suspense>
  );
}
