// Bridges the backend's Category documents with the storefront's category
// pages. Each category's _id is the slug ("sculptures", "vases", …) and
// matches Product.category on the backend; the admin edits the display
// name, hero copy and imagery.

import { apiFetch, ApiError } from "./api";

export type Category = {
  id: string; // slug
  name: string;
  color?: "rose" | "gold" | "maroon" | "ink";
  image?: string;
  heroImage?: string;
  heroEyebrow?: string;
  region?: string;
  tagline?: string;
  collectionNote?: string;
  promoImage?: string;
  promoBody?: string;
  promoCtaLabel?: string;
  promoCtaHref?: string;
  order?: number;
  active?: boolean;
};

type ListResponse = { items: Category[]; total: number };

export async function fetchCategories(): Promise<Category[]> {
  const { items } = await apiFetch<ListResponse>("/api/categories");
  return items;
}

export async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    return await apiFetch<Category>(`/api/categories/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// Fallback label generator for places where we only have a slug — e.g.
// product cards rendered from backend data before the Category list is
// available. "sculptures" → "Sculptures", "wall-art" → "Wall Art".
export function categoryLabelFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
