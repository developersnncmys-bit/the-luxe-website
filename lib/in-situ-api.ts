// Thin client for /api/in-situ — the admin's "See the piece in the room"
// pairings that back ChapterObject on the home page.
//
// Each entry pairs a product (by reference, e.g. "LV-721405") with a room
// photo. The home page server component joins this list against
// fetchProducts() so the hero tile can show the matched product's main
// image when the admin hasn't uploaded a per-beat hero override.

import { apiFetch } from "./api";

export type InSituEntry = {
  id: string;           // slug
  productRef: string;   // e.g. "LV-721405"
  productLabel?: string;
  categoryLabel?: string;
  // The in-situ shot — the room photo that fills the inset tile.
  image?: string;
  // Optional override for the hero tile. If blank, the storefront uses
  // the matched Product's own image.
  heroImage?: string;
  // Hero tile text overrides. Both optional.
  heroTitle?: string;      // overrides the big label under the hero image
  heroCaption?: string;    // short sentence shown below the hero title
  order?: number;
  active?: boolean;
};

type ListResponse = { items: InSituEntry[]; total: number };

export async function fetchInSituList(): Promise<InSituEntry[]> {
  const { items } = await apiFetch<ListResponse>("/api/in-situ");
  // Backend sort is { order: 1, createdAt: -1 }. Filter inactive defensively
  // (backend already hides them from non-admins).
  return items
    .filter((e) => e.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
