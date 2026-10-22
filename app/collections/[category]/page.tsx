import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchProducts } from "@/lib/products-api";
import { fetchCategories, fetchCategory } from "@/lib/categories-api";
import { CategoryHero } from "@/components/collections/category/category-hero";
import { CategoryFilterableGrid } from "@/components/collections/category/category-filterable-grid";
// import { CategorySavoirFaire } from "@/components/collections/category/category-savoir-faire";
// import { CategoryEditorial } from "@/components/collections/category/category-editorial";
// import {
//   CategoryRelated,
//   type RelatedCard
// } from "@/components/collections/category/category-related";

// ---------------------------------------------------------------------------
// Fallback editorial extras — DISABLED.
//
// Previously this file carried a per-slug hardcoded pack of editorial
// content (savoir-faire video, editorial band, related rail, fallback hero
// image). That was a fallback for the fact that the backend Category model
// doesn't yet have fields for those surfaces. Commented out while we rely
// purely on the backend; uncomment to restore the hero image fallback and
// the three editorial sections per category.
//
// type SavoirFaireConfig = {
//   kicker: string; title: string; body: string; poster: string; posterAlt: string;
//   videoSrc?: string; href?: string; ctaLabel?: string;
// };
// type EditorialConfig = {
//   kicker: string; title: string; body: string; image: string; imageAlt: string;
//   href: string; ctaLabel?: string; mirror?: boolean;
// };
// type EditorialExtras = {
//   fallbackImage: string;
//   fallbackImageAlt?: string;
//   savoirFaire?: SavoirFaireConfig;
//   editorial?: EditorialConfig;
//   related?: RelatedCard[];
// };
// const EDITORIAL_EXTRAS: Record<string, EditorialExtras> = {
//   sculptures: {
//     fallbackImage: "/images/banners/sculpture.png",
//     fallbackImageAlt: "A hand-carved walnut sculpture",
//     savoirFaire: {
//       kicker: "The Savoir-faire",
//       title: "Of The Luxe Version",
//       body: "A study in quiet majesty. MAJESTÉ captures the profound stillness of the Buddha through a serene expression and intricately sculpted crown, while its time-worn patina lends the piece a sense of history, character and regal presence.",
//       poster: "/images/sculptures/Majeste/Budha1.png",
//       posterAlt: "A hand-carved sculpture in a lived-in room",
//       href: "/collections/sculptures/sculpture-majeste",
//       ctaLabel: "DISCOVER MAJESTE"
//     },
//     editorial: {
//       kicker: "The Collection", title: "One Line, Held",
//       body: "A sculpture is the piece a room turns toward first. Placed on a mantel or at the edge of an entry, it holds the eye without asking. The rest of the room arranges itself around it.",
//       image: "/images/sculptures/Altesse/Altesse1.png",
//       imageAlt: "A carved sculpture in profile", href: "/collections/sculptures"
//     },
//     related: [
//       { title: "Vases", image: "/images/vases/Vase-rivage/Rivage-craft.png", imageAlt: "A ceramic vessel", href: "/collections/vases" },
//       { title: "Lighting", image: "/images/lighting/light1.png", imageAlt: "A sculptural chandelier", href: "/collections/lighting" }
//     ]
//   },
//   vases: {
//     fallbackImage: "/images/banners/vase.png", fallbackImageAlt: "A ceramic vessel",
//     savoirFaire: { kicker: "The Savoir-faire", title: "Vessels, By Hand", body: "Each vessel is wheel-thrown, hand-blown, or bronze-glazed in a single studio. No two share the same silhouette; each carries the small asymmetries of the hand that shaped it.", poster: "/images/vases/vase2.png", posterAlt: "A hand-thrown ceramic vessel", videoSrc: "/images/dining-video.mp4" },
//     editorial: { kicker: "The Collection", title: "Sculpture That Holds", body: "A vessel earns its place by presence, not use. Set on a console or a low table, it draws the light of the room to one held form — quiet, weighted, unrepeatable.", image: "/images/vases/vase3.png", imageAlt: "A ceramic vase in profile", href: "/collections/vases" },
//     related: [
//       { title: "Sculptures", image: "/images/sculptures/Majeste/Majeste.png", imageAlt: "The Majesté sculpture in a lived-in setting", href: "/collections/sculptures" },
//       { title: "Tabletop", image: "/images/table-top/table1.png", imageAlt: "A stoneware charger", href: "/collections/tabletop" }
//     ]
//   },
//   tabletop: {
//     fallbackImage: "/images/banners/table-top.png", fallbackImageAlt: "A stoneware charger",
//     savoirFaire: { kicker: "The Savoir-faire", title: "Service as Composition", body: "Stoneware chargers thrown by a single potter, carafes hand-blown in warm glass, linens undyed and hand-hemmed. A table set from a single hand reads as one thought.", poster: "/images/table-top/table2.png", posterAlt: "A composed dining table", videoSrc: "/images/dining-video.mp4" },
//     editorial: { kicker: "The Collection", title: "One Thought, Set", body: "The dining table is the most-used sculpture in the house. Set with pieces from one hand — chargers, carafe, glass — it composes rather than serves.", image: "/images/table-top/table4.png", imageAlt: "A composed dining setting", href: "/collections/tabletop" },
//     related: [
//       { title: "Vases", image: "/images/vases/vase1.png", imageAlt: "A ceramic vessel", href: "/collections/vases" },
//       { title: "Lighting", image: "/images/lighting/light1.png", imageAlt: "A sculptural chandelier", href: "/collections/lighting" }
//     ]
//   },
//   lighting: {
//     fallbackImage: "/images/banners/lighting.png", fallbackImageAlt: "A sculptural chandelier",
//     savoirFaire: { kicker: "The Savoir-faire", title: "Jewellery for the Room", body: "Every leaf of glass is shaped by a single hand outside Firozabad. Frames turned in unlacquered brass; wiring and finishing take four to six weeks per fixture.", poster: "/images/lighting/light4.png", posterAlt: "A chandelier in a lived-in room", videoSrc: "/images/living-room1.mp4" },
//     editorial: { kicker: "The Collection", title: "Hung Once, Lived With", body: "One fixture holds a whole room together. Hung low over the dining table, or the double-height entry, it becomes the piece the house is arranged around.", image: "/images/lighting/light5.png", imageAlt: "A chandelier over a stairwell", href: "/collections/lighting" },
//     related: [
//       { title: "Sculptures", image: "/images/sculptures/scu1.png", imageAlt: "A hand-carved sculpture", href: "/collections/sculptures" }
//     ]
//   }
// };
// const UNIVERSAL_FALLBACK_IMAGE = "/images/banners/sculpture.png";
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  // Backend-only. If the backend is unreachable at build time, the build
  // fails loudly — previously this had a try/catch that fell back to the
  // hardcoded editorial-pack slugs; see EDITORIAL_EXTRAS block above.
  const cats = await fetchCategories();
  return cats.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params
}: {
  params: { category: string };
}): Promise<Metadata> {
  // Backend-only. Previously wrapped in try/catch with a generic title fallback.
  const cat = await fetchCategory(params.category);
  if (!cat) return { title: "Not found — The Luxe Version" };
  return {
    title: `${cat.name} — The Luxe Version`,
    description: cat.tagline || cat.collectionNote || undefined
  };
}

export default async function CategoryPage({
  params
}: {
  params: { category: string };
}) {
  const [cat, allProducts] = await Promise.all([
    fetchCategory(params.category),
    fetchProducts()
  ]);
  if (!cat || cat.active === false) notFound();

  // Hero image resolution for the category page banner.
  //   1. `heroImage` — the explicit landscape "hero" upload the admin can
  //      provide if they want a different crop/photo for the full-width hero.
  //   2. `image`     — the "tile image" shown as the admin's category card.
  //      Reused here so admins only have to upload ONE image per category
  //      and still get a banner; a dedicated hero can be added later.
  const heroImage = cat.heroImage || cat.image || "";
  const heroImageAlt = cat.name;

  const products = allProducts.filter(
    (p) =>
      p.category.toLowerCase() === cat.id.toLowerCase() &&
      p.handle !== "sculpture-majeste"
  );

  return (
    <>
      <CategoryHero
        kicker={cat.heroEyebrow || "The Collection"}
        title={cat.name}
        description={cat.tagline || cat.collectionNote || ""}
        image={heroImage}
        imageAlt={heroImageAlt}
      />
      <CategoryFilterableGrid products={products} interstitial={null} />
      {/*
        Editorial sections — DISABLED. These were sourced from the hardcoded
        EDITORIAL_EXTRAS pack above. Uncomment the imports, the constant and
        these blocks together to restore them until the Category model grows
        fields for savoir-faire / editorial / related.

        {extras?.editorial && <CategoryEditorial {...extras.editorial} />}
        {extras?.related && extras.related.length > 0 && (
          <CategoryRelated cards={extras.related} />
        )}
      */}
    </>
  );
}
