// Thin client for /api/banners. The admin edits these in the Banners page:
// page heroes, category tiles (weave), feature banners (parallax),
// editorial blocks, and CTA bands.
//
// Fetches are server-side first (SSR in Next). Pages pass fetched data into
// client components as props; nothing in this file calls a browser API.

import { apiFetch } from "./api";

export type BannerType =
  | "hero"
  | "parallax"
  | "editorial"
  | "cta_band"
  | "weave";

export type MediaType = "image" | "video";

export type Banner = {
  id: string;
  type: BannerType;
  page: string;
  // Optional sub-slot within a page. Blank for whole-page banners that
  // appear in the trailing <BannerSections> stack; set (e.g. 'film', 'look')
  // for banners that override a specific storefront chapter.
  section?: string;
  weave?: string;       // category name — only for type: 'weave'
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
  mediaType?: MediaType;
  videoUrl?: string;
  attribution?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaLabel2?: string;
  ctaHref2?: string;
  order?: number;
  active?: boolean;
};

type ListResponse = { items: Banner[]; total: number };

export async function fetchBanners(): Promise<Banner[]> {
  const { items } = await apiFetch<ListResponse>("/api/banners");
  // Backend already sorts by { page, order }; keep it stable here.
  return items;
}

// Convenience filters built on top of the single list fetch. One round-trip
// per page is enough for all five types; the per-type helpers below just
// slice the result in memory.
export async function fetchBannersFor(page: string): Promise<Banner[]> {
  const all = await fetchBanners();
  return all.filter((b) => b.page === page && b.active !== false);
}

// Returns the active hero for a given storefront page, lowest-order first.
// Pages pass this to their hero component; if `undefined`, the component
// should fall back to its hardcoded defaults.
export async function fetchHeroFor(page: string): Promise<Banner | undefined> {
  const all = await fetchBanners();
  const heroes = all
    .filter((b) => b.type === "hero" && b.page === page && b.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return heroes[0];
}

// All non-hero body banners for a page, in display order — excludes any
// that are targeting a specific chapter via `section`, since those are
// consumed by the chapter components directly, not the trailing stack.
export async function fetchBannerSectionsFor(page: string): Promise<Banner[]> {
  const all = await fetchBanners();
  return all
    .filter(
      (b) =>
        b.page === page &&
        b.active !== false &&
        !b.section &&
        (b.type === "parallax" || b.type === "editorial" || b.type === "cta_band")
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Backend override for a specific chapter slot (e.g. page="home",
// section="film"). Returns the lowest-order active banner matching that
// (page, section) pair, or undefined when none exists.
export async function fetchBannerForSection(
  page: string,
  section: string
): Promise<Banner | undefined> {
  const all = await fetchBanners();
  const matches = all
    .filter(
      (b) =>
        b.page === page &&
        b.section === section &&
        b.active !== false
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return matches[0];
}

// Weave overrides — tile images keyed by the category name the admin
// authored. Consumers pass a tileOverrides map; a slug-lookup helper is
// provided for callers that only have the slug.
export async function fetchWeaveOverrides(): Promise<Record<string, string>> {
  const all = await fetchBanners();
  const out: Record<string, string> = {};
  for (const b of all) {
    if (b.type !== "weave" || b.active === false) continue;
    if (!b.weave || !b.image) continue;
    out[b.weave] = b.image;
  }
  return out;
}
