import type { Metadata } from "next";
import { fetchProducts } from "@/lib/products-api";
import { fetchCategories } from "@/lib/categories-api";
import { fetchHeroFor } from "@/lib/banners-api";
import { CollectionHero } from "@/components/collections/collection-hero";
// Hardcoded editorial / cta chapters — DISABLED. Backend-only now via
// <BannerSections page="collection" />. Uncomment the import AND the
// JSX below together to restore any chapter.
//
import { CollectionManifesto } from "@/components/collections/collection-manifesto";
import { CollectionInterlude } from "@/components/collections/collection-interlude";
import { CollectionClosing } from "@/components/collections/collection-closing";
import { CategorySection } from "@/components/collections/category-section";
import { BannerSections } from "@/components/site/banner-sections";

export const metadata: Metadata = {
  title: "The Collection — The Luxe Version",
  description:
    "Objects and lighting — the pieces you keep."
};

export default async function CollectionsPage() {
  // Categories come from the backend (sorted by order, active-only); the
  // product grid is capped at 3 per category — the overview is a taste, the
  // dedicated /collections/{slug} page shows every piece. Hero banner is
  // optional; CollectionHero falls back to its hardcoded defaults.
  const [categories, products, hero] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchHeroFor("collection")
  ]);

  const active = categories
    .map((c) => ({
      id: c.id,
      label: c.name,
      intro: c.tagline || c.collectionNote || "",
      products: products
        .filter((p) => p.category.toLowerCase() === c.id.toLowerCase())
        .slice(0, 3)
    }))
    .filter((c) => c.products.length > 0);

  return (
    <>
      <CollectionHero
        image={hero?.image || undefined}
        imageAlt={hero?.title || hero?.subtitle || undefined}
        ctaLabel={hero?.ctaLabel || undefined}
        ctaHref={hero?.ctaHref || undefined}
      />
      <CollectionManifesto />
      <CollectionInterlude />
      {active.map((c, i) => (
        <CategorySection
          key={c.id}
          id={c.id}
          number={String(i + 1).padStart(2, "0")}
          kicker="The House"
          title={c.label}
          intro={c.intro}
          products={c.products}
          mirror={i % 2 === 1}
        />
      ))}
      <CollectionClosing />
      <BannerSections page="collection" />
    </>
  );
}
