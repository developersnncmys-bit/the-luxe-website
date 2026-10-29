// Thin client for /api/luxe-exclusive — the admin's "Luxe Exclusive" tab,
// surfaced on the storefront's /exclusive page. The backend stores the
// slug as `id`; the storefront's ExclusivePiece type calls it `slug`.

import { apiFetch } from "./api";
import type { ExclusivePiece } from "./content";

type BackendExclusivePiece = {
  id: string;
  name: string;
  number?: string;
  discipline?: string;
  tagline?: string;
  intro?: string;
  body?: string;
  material?: string;
  dimensions?: string;
  leadTime?: string;
  edition?: string;
  price?: number;
  image?: string;
  order?: number;
  active?: boolean;
};

type ListResponse = { items: BackendExclusivePiece[]; total: number };

function adapt(src: BackendExclusivePiece): ExclusivePiece {
  return {
    slug: src.id,
    number: src.number || "",
    name: src.name,
    discipline: src.discipline || "",
    tagline: src.tagline || undefined,
    intro: src.intro || "",
    body: src.body || "",
    material: src.material || "",
    dimensions: src.dimensions || "",
    leadTime: src.leadTime || "",
    edition: src.edition || "",
    price: typeof src.price === "number" ? src.price : undefined,
    image: src.image || ""
  };
}

export async function fetchExclusivePieces(): Promise<ExclusivePiece[]> {
  const { items } = await apiFetch<ListResponse>("/api/luxe-exclusive");
  return items.filter((p) => p.active !== false).map(adapt);
}
