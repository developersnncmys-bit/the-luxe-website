// Bridges the backend's product shape with the storefront's Product type.
//
// The backend stores products the way the admin panel edits them —
// lowercase category slugs, a single price number, admin-generated
// handles like "lv-721405", and a different vocabulary for editorial
// fields. The storefront was authored with capitalized categories, split
// INR/USD pricing, hand-chosen handles and its own set of detail-page
// fields.
//
// `fetchProducts()` pulls from the backend and runs each row through
// `adaptBackendProduct` to produce the Product shape the UI already
// knows how to render. If the backend is unreachable (dev without a
// running API, misconfigured env, etc.) we fall back to the hardcoded
// PRODUCTS array so pages still render.

import { apiFetch, ApiError } from "./api";
import { PRODUCTS, type Product, type ProductDetail, type ProductInspiration } from "./content";
import { categoryLabelFromSlug } from "./categories-api";

type BackendDimensions = {
  main?: string;
  base?: string;
  weight?: string;
};

type BackendWhyHighlight = { title?: string; body?: string };

type BackendProduct = {
  id: string;
  reference: string;
  handle: string;
  name: string;
  category: string;
  editTag?: string;
  price: number;
  mrp?: number;
  stock?: number;
  status?: string;
  materials?: string;
  materialTags?: string[];
  dimensions?: BackendDimensions;
  description?: string;
  moreDetails?: string;
  // Rich editorial fields — only product-detail pages use these.
  materialImage?: string;
  materialDetail?: string;
  craftImage?: string;
  craftDetail?: string;
  whyHeadline?: string;
  whyHighlights?: BackendWhyHighlight[];
  pullQuote?: string;
  featureImage?: string;
  bespoke?: boolean;
  image?: string;
  images?: string[];
};

type ListResponse = { items: BackendProduct[]; total: number };

// Rough INR→USD conversion for display when the backend only stores INR.
// Not for anything financial — the real checkout should pull a live rate.
const INR_PER_USD = 83;

function adaptBackendProduct(src: BackendProduct): Product {
  // Backend stores the category slug (e.g. "sculptures"); the storefront's
  // Product.category is used both as a display label and as a filter key.
  // Title-casing the slug keeps the existing display semantics working for
  // every slug the admin creates, without requiring a code change.
  const category = categoryLabelFromSlug(src.category);
  const editTag = src.editTag ? src.editTag.toLowerCase() : undefined;

  const inr = Math.round(src.price);
  const usd = Math.round(src.price / INR_PER_USD);

  const gallery = (src.images && src.images.length ? src.images : [src.image])
    .filter((x): x is string => typeof x === "string" && x.length > 0);

  return {
    handle: src.handle,
    name: src.name,
    category,
    editTag,
    description: src.description || "",
    price: { inr, usd },
    // SafeImage falls back to a picsum placeholder when the string is empty,
    // which is useful while the admin hasn't uploaded any photos yet.
    image: src.image || gallery[0] || "",
    aspect: "portrait",
    material: src.materials,
    gallery: gallery.length ? gallery : undefined,
    body: src.moreDetails || src.description,
    details: buildDetails(src),
    inspiration: buildInspiration(src),
    pullQuote: src.pullQuote?.trim() || undefined,
    // ProductQuote hides itself unless both pullQuote and lifestyleImage are
    // set. Fall back to the main product image so a pull quote always renders
    // when the admin has written one, even without a dedicated feature image.
    lifestyleImage:
      src.featureImage?.trim() || src.image?.trim() || gallery[0] || undefined
  };
}

// Material + Craft macro cards. Each card is only included if the admin
// has filled in at least an image or body for it — an empty section is
// hidden entirely by ProductDetails.
function buildDetails(src: BackendProduct): ProductDetail[] | undefined {
  const details: ProductDetail[] = [];

  const materialBody = (src.materialDetail || src.materials || "").trim();
  if (src.materialImage?.trim() || materialBody) {
    details.push({ label: "Material", body: materialBody, image: src.materialImage?.trim() || "" });
  }

  const craftBody = (src.craftDetail || "").trim();
  if (src.craftImage?.trim() || craftBody) {
    details.push({ label: "Craft", body: craftBody, image: src.craftImage?.trim() || "" });
  }

  return details.length ? details : undefined;
}

// "Why This Piece" block. Only built if the admin provided either a
// headline or at least one highlight — otherwise the section hides.
function buildInspiration(src: BackendProduct): ProductInspiration | undefined {
  const headline = src.whyHeadline?.trim() || "";
  const reasons = (src.whyHighlights || [])
    .map((h) => ({ label: (h?.title || "").trim(), body: (h?.body || "").trim() }))
    .filter((r) => r.label || r.body);

  if (!headline && reasons.length === 0) return undefined;

  return {
    title: headline || "Why This Piece",
    reasons: reasons.length ? reasons : undefined
  };
}

export async function fetchProducts(params: { category?: string; limit?: number } = {}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.limit) qs.set("limit", String(params.limit));
  const path = `/api/products${qs.toString() ? `?${qs}` : ""}`;

  const data = await apiFetch<ListResponse>(path);
  return data.items.map(adaptBackendProduct);

  // Fallback to hardcoded data — temporarily disabled while we rely only
  // on the backend. Uncomment to restore the previous "never blank" behavior.
  //
  // try {
  //   const data = await apiFetch<ListResponse>(path);
  //   const mapped = data.items.map(adaptBackendProduct).filter((p): p is Product => p !== null);
  //   return mapped.length ? mapped : PRODUCTS;
  // } catch (err) {
  //   if (err instanceof ApiError) {
  //     console.warn(`[products-api] backend returned ${err.status}: ${err.message} — using fallback`);
  //   } else {
  //     console.warn(`[products-api] backend unreachable (${(err as Error).message}) — using fallback`);
  //   }
  //   return PRODUCTS;
  // }
}

// Related pieces for the "Discover Also" rail on product detail pages.
// Fetches products in the same category, drops the current one, and caps
// at `limit`. Uses the slug (lowercased label) since the backend filter
// matches on slug. Returns [] if no siblings exist.
export async function fetchRelatedProducts(
  product: Product,
  limit = 3
): Promise<Product[]> {
  const slug = product.category.toLowerCase().replace(/\s+/g, "-");
  // Fetch one extra so after dropping the current product we still have
  // `limit` candidates in categories where the current piece sits early
  // in the list.
  const siblings = await fetchProducts({ category: slug, limit: limit + 1 });
  return siblings
    .filter((p) => p.handle !== product.handle)
    .slice(0, limit);
}

// Look up a single product by handle. Backend-only for now; see commented
// fallback below if you need the hardcoded storefront pieces back.
export async function fetchProduct(handle: string): Promise<Product | null> {
  try {
    const row = await apiFetch<BackendProduct>(`/api/products/${encodeURIComponent(handle)}`);
    return adaptBackendProduct(row);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }

  // Fallback to hardcoded data — temporarily disabled.
  //
  // try {
  //   const row = await apiFetch<BackendProduct>(`/api/products/${encodeURIComponent(handle)}`);
  //   const adapted = adaptBackendProduct(row);
  //   if (adapted) return adapted;
  // } catch (err) {
  //   if (err instanceof ApiError && err.status !== 404) {
  //     console.warn(`[products-api] backend returned ${err.status} for ${handle}: ${err.message} — using fallback`);
  //   } else if (!(err instanceof ApiError)) {
  //     console.warn(`[products-api] backend unreachable for ${handle} (${(err as Error).message}) — using fallback`);
  //   }
  // }
  // return PRODUCTS.find((p) => p.handle === handle) ?? null;
}
