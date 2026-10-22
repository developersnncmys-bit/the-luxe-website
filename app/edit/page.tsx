import type { Metadata } from "next";
import { EditHero } from "@/components/edit/edit-hero";
// Hardcoded editorial / cta chapters — DISABLED. Backend-only now via
// <BannerSections page="edit" />. Uncomment the import AND the JSX
// below together to restore.
//
import { EditIntro } from "@/components/edit/edit-intro";
import { EditClosing } from "@/components/edit/edit-closing";
import { EditSection } from "@/components/edit/edit-section";
import { fetchHeroFor } from "@/lib/banners-api";
import { fetchEditTags } from "@/lib/edit-tags-api";
import { fetchProducts } from "@/lib/products-api";
import { BannerSections } from "@/components/site/banner-sections";

export const metadata: Metadata = {
  title: "The Edit — The Luxe Version",
  description: "A selection of objects chosen for the season."
};

export default async function EditPage() {
  // Backend data for /edit:
  //   • `hero`      → the <EditHero> background + CTA
  //   • `editTags`  → the ordered list of sections to render
  //   • `products`  → the full catalog; sliced per edit tag by product.editTag
  const [hero, editTags, products] = await Promise.all([
    fetchHeroFor("edit"),
    fetchEditTags(),
    fetchProducts()
  ]);

  // Build a map of edit-tag slug → the products tagged with it. The product
  // adapter lowercases editTag, so we match on both sides case-insensitively.
  const productsByEditTag = new Map<string, typeof products>();
  for (const p of products) {
    const key = p.editTag;
    if (!key) continue;
    const bucket = productsByEditTag.get(key) ?? [];
    bucket.push(p);
    productsByEditTag.set(key, bucket);
  }

  // Only render sections whose edit tag has at least one piece OR whose admin
  // has authored a feature image / description / explicit piece count. An
  // "empty" section with none of the above would read as broken.
  const sections = editTags.filter((t) => {
    const list = productsByEditTag.get(t.id) ?? [];
    return (
      list.length > 0 ||
      !!t.image ||
      !!t.description ||
      (t.piecesCount ?? 0) > 0
    );
  });

  return (
    <>
      <EditHero
        image={hero?.image || undefined}
        imageAlt={hero?.title || hero?.subtitle || undefined}
        ctaLabel={hero?.ctaLabel || undefined}
        ctaHref={hero?.ctaHref || undefined}
      />
      <EditIntro />
      {sections.map((tag, i) => (
        <EditSection
          key={tag.id}
          id={tag.id}
          number={String(i + 1).padStart(2, "0")}
          title={tag.name}
          intro={tag.tagline || ""}
          products={productsByEditTag.get(tag.id) ?? []}
          mirror={i % 2 === 1}
          piecesCount={tag.piecesCount}
          description={tag.description || undefined}
          featureImage={tag.image || undefined}
          featuredPieceName={tag.productName || undefined}
        />
      ))}
      <EditClosing />
      <BannerSections page="edit" />
    </>
  );
}
