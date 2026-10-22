// Thin client for /api/edit-tags — the curated groups shown as sections on
// The Edit page ("Statement Pieces", "New Pieces", …).
//
// Each tag's slug (_id) is also stored on Product.editTag, so the /edit
// page can group fetched products by iterating this list and filtering
// products with `product.editTag === tag.id`.

import { apiFetch } from "./api";

export type EditTagColor = "rose" | "gold" | "maroon" | "ink";

export type EditTag = {
  id: string; // slug — matches Product.editTag
  name: string;
  color?: EditTagColor;
  tagline?: string;
  // Admin-authored count rendered as "NN pieces in this edit". When 0 the
  // storefront falls back to the actual number of matched products.
  piecesCount?: number;
  // Hero / feature image for this edit tag's section.
  image?: string;
  // Call-out label shown next to the feature image.
  productName?: string;
  // Longer editorial paragraph below the tagline.
  description?: string;
  order?: number;
};

type ListResponse = { items: EditTag[]; total: number };

export async function fetchEditTags(): Promise<EditTag[]> {
  const { items } = await apiFetch<ListResponse>("/api/edit-tags");
  // Backend sorts by { order: 1, name: 1 } — keep that.
  return items;
}
