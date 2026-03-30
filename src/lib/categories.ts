export interface Category {
  label: string;
  slug: string;
  icon: string; // emoji fallback for easy display
}

export const CATEGORIES: Category[] = [
  { label: "Restaurant & Food", slug: "restaurant-food", icon: "🍽️" },
  { label: "Retail & Shopping", slug: "retail-shopping", icon: "🛍️" },
  { label: "Health & Beauty", slug: "health-beauty", icon: "💆" },
  { label: "Auto Services", slug: "auto-services", icon: "🔧" },
  { label: "Home Services", slug: "home-services", icon: "🏠" },
  { label: "Medical & Healthcare", slug: "medical-healthcare", icon: "🏥" },
  { label: "Legal Services", slug: "legal-services", icon: "⚖️" },
  { label: "Financial Services", slug: "financial-services", icon: "💼" },
  { label: "Fitness & Wellness", slug: "fitness-wellness", icon: "💪" },
  { label: "Hotel & Lodging", slug: "hotel-lodging", icon: "🏨" },
  { label: "Entertainment", slug: "entertainment", icon: "🎭" },
  { label: "Professional Services", slug: "professional-services", icon: "📋" },
  { label: "Pet Services", slug: "pet-services", icon: "🐾" },
  { label: "Education", slug: "education", icon: "📚" },
  { label: "Other", slug: "other", icon: "🏪" },
];

/** Look up a category by its URL slug */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Look up a category label by slug, returns the slug itself as fallback */
export function getCategoryLabel(slug: string): string {
  return getCategoryBySlug(slug)?.label ?? slug;
}
