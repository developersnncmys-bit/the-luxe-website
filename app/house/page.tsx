import type { Metadata } from "next";
import { HouseHero } from "@/components/house/house-hero";
// Hardcoded editorial / parallax / cta chapters — DISABLED. Backend-only
// now via <BannerSections page="house" />. Uncomment the import AND the
// JSX below together to restore any chapter. HouseMaterials and HouseCraft
// were also commented — they render hardcoded material/craft arrays that
// now have backend equivalents (/api/materials, /api/craft-principles) but
// aren't yet wired up to those endpoints.
//
import { HousePointOfView } from "@/components/house/house-point-of-view";
import { HouseFilm } from "@/components/house/house-film";
import { HouseArtOfObjects } from "@/components/house/house-art-of-objects";
import { HouseMaterials } from "@/components/house/house-materials";
import { HouseCraft } from "@/components/house/house-craft";
import { HouseStory } from "@/components/house/house-story";
import { HouseClosing } from "@/components/house/house-closing";
import { fetchHeroFor, fetchBannerForSection } from "@/lib/banners-api";
import {
  fetchHouseContent,
  fetchMaterials,
  fetchCraftPrinciples
} from "@/lib/house-api";
import { BannerSections } from "@/components/site/banner-sections";

export const metadata: Metadata = {
  title: "The House — The Luxe Version",
  description:
    "The Luxe Version is a house of decorative objects — showpieces, lighting and mirrors, curated for a life lived slowly."
};

export default async function HousePage() {
  // Backend data for The House — fetched in parallel:
  //   • hero           → <HouseHero> banner override (image + attribution + CTA)
  //   • filmBanner     → <HouseFilm> media/text (banner section: 'film')
  //   • artBanner      → <HouseArtOfObjects> full-bleed image + caption
  //                      (banner section: 'art')
  //   • houseContent   → section headers + lead paragraphs + craft image + story
  //   • materials      → cards in the Materials grid
  //   • craftPrinciples→ numbered rows in the Craft list
  const [
    hero,
    filmBanner,
    artBanner,
    houseContent,
    materials,
    craftPrinciples
  ] = await Promise.all([
    fetchHeroFor("house"),
    fetchBannerForSection("house", "film"),
    fetchBannerForSection("house", "art"),
    fetchHouseContent(),
    fetchMaterials(),
    fetchCraftPrinciples()
  ]);

  // Materials: admin stores { name, description, image, order } — map to the
  // HouseMaterialItem shape the grid component expects (image optional, body
  // from description).
  const materialItems = materials.map((m) => ({
    name: m.name,
    image: m.image || undefined,
    body: m.description || ""
  }));

  // Craft principles: admin stores { title, body, order } — already matches
  // HouseCraftPrincipleItem shape; just coerce body to string.
  const principleItems = craftPrinciples.map((p) => ({
    title: p.title,
    body: p.body || ""
  }));

  return (
    <>
      <HouseHero
        image={hero?.image || undefined}
        imageAlt={hero?.title || hero?.subtitle || undefined}
        ctaLabel={hero?.ctaLabel || undefined}
        ctaHref={hero?.ctaHref || undefined}
        attribution={hero?.attribution || undefined}
      />
      <HousePointOfView />
      {/* HouseFilm — all props optional; banner authored at
          (page: 'house', section: 'film') wins over the hardcoded defaults
          in the component. */}
      <HouseFilm
        mediaType={filmBanner?.mediaType}
        videoSrc={filmBanner?.videoUrl || undefined}
        image={filmBanner?.image || undefined}
        title={filmBanner?.title || undefined}
        subtitle={filmBanner?.subtitle || undefined}
      />
      {/* HouseArtOfObjects — full-bleed closing image + caption come from
          the admin banner at (page: 'house', section: 'art'). Falls back to
          hardcoded defaults when none authored. */}
      <HouseArtOfObjects
        featureImage={artBanner?.image || undefined}
        // Admin may have authored the caption in either Attribution (the
        // "proper" field, which I added for Feature banners) or Subtitle
        // (which was already available). Prefer attribution if both are
        // set; otherwise fall back to subtitle so neither field is a dead end.
        featureImageAttribution={
          artBanner?.attribution || artBanner?.subtitle || undefined
        }
      />
      <HouseMaterials
        headline={houseContent.materialsHeadline || undefined}
        lead={houseContent.materialsLead || undefined}
        items={materialItems.length > 0 ? materialItems : undefined}
      />
      <HouseCraft
        headline={houseContent.craftHeadline || undefined}
        lead={houseContent.craftLead || undefined}
        image={houseContent.craftImage || undefined}
        imageAttribution={houseContent.craftImageAttribution || undefined}
        principles={principleItems.length > 0 ? principleItems : undefined}
      />
      <HouseStory
        pullQuote={houseContent.storyPullQuote || undefined}
        body={houseContent.storyBody || undefined}
      />
      <HouseClosing />
      <BannerSections page="house" />
    </>
  );
}
