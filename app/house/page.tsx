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
import { fetchHeroFor } from "@/lib/banners-api";
import { BannerSections } from "@/components/site/banner-sections";

export const metadata: Metadata = {
  title: "The House — The Luxe Version",
  description:
    "The Luxe Version is a house of decorative objects — showpieces, lighting and mirrors, curated for a life lived slowly."
};

export default async function HousePage() {
  const hero = await fetchHeroFor("house");
  return (
    <>
      <HouseHero
        image={hero?.image || undefined}
        imageAlt={hero?.title || hero?.subtitle || undefined}
        ctaLabel={hero?.ctaLabel || undefined}
        ctaHref={hero?.ctaHref || undefined}
      />
      <HousePointOfView /> 
      <HouseFilm />
      <HouseArtOfObjects />
      <HouseMaterials />
      <HouseCraft />
      <HouseStory />
      <HouseClosing />
      <BannerSections page="house" />
    </>
  );
}
