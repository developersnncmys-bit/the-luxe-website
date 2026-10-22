import { Hero } from "@/components/home/hero";
// Hardcoded editorial / parallax / film chapters — DISABLED. These were
// the implicit fallback content occupying the parallax/editorial/cta_band
// slots before admin banners existed. Backend-only now via <BannerSections
// page="home" />. Uncomment the imports AND the JSX below together to
// restore any chapter.
import { ChapterRoom } from "@/components/home/chapter-room";
import { ChapterLook } from "@/components/home/chapter-look";
import { ChapterObject } from "@/components/home/chapter-object";
import { ChapterFilm } from "@/components/home/chapter-film";
import { Interlude } from "@/components/home/interlude";
import { JournalTeaser } from "@/components/home/journal";
import { Collection } from "@/components/home/collection";
import {
  fetchHeroFor,
  fetchWeaveOverrides,
  fetchBannerForSection
} from "@/lib/banners-api";
import { BannerSections } from "@/components/site/banner-sections";

export default async function HomePage() {
  // Backend overrides for the home page:
  //   • `hero`         → <Hero> swaps in a banner-authored image + CTA
  //   • `tileOverrides`→ Collection tile images (admin "weave" banners)
  //   • `filmBanner`   → ChapterFilm media/text (section: 'film')
  //   • `lookBanner`   → ChapterLook cover + eyebrow + title (section: 'look')
  const [hero, tileOverrides, filmBanner, lookBanner] = await Promise.all([
    fetchHeroFor("home"),
    fetchWeaveOverrides(),
    fetchBannerForSection("home", "film"),
    fetchBannerForSection("home", "look")
  ]);

  return (
    <>
      <Hero
        image={hero?.image || undefined}
        imageAlt={hero?.title || hero?.subtitle || undefined}
        ctaLabel={hero?.ctaLabel || undefined}
        ctaHref={hero?.ctaHref || undefined}
      />

      
       

        <div className="relative h-[100vh]">
          <ChapterRoom />
        </div>
        <div className="relative bg-ink">
          {/* ChapterFilm — all props optional; backend banner authored at
              (page: 'home', section: 'film') wins over the hardcoded defaults
              in the component. */}
          <ChapterFilm
            mediaType={filmBanner?.mediaType}
            videoSrc={filmBanner?.videoUrl || undefined}
            image={filmBanner?.image || undefined}
            eyebrow={filmBanner?.eyebrow || undefined}
            title={filmBanner?.title || undefined}
            subtitle={filmBanner?.subtitle || undefined}
            body={filmBanner?.body || undefined}
          />
          <div className="relative h-[300vh]">
            {/* ChapterLook — admin banner at (home, 'look') overrides the
                cover image + eyebrow + title. Thumbnails rail stays empty
                until a dedicated model exists for it. */}
            <ChapterLook
              pinned
              eyebrow={lookBanner?.eyebrow || "Shop the Room"}
              title={lookBanner?.title || "The\nSculpted\nRoom"}
              cover={lookBanner?.image || "/images/collection-home.png"}
              thumbnails={[]}
            />
          </div>
          <ChapterObject />
          {/* <Interlude /> */}
        </div>
     

      <div className="relative bg-ink">
        <Collection tileOverrides={tileOverrides} />
        <JournalTeaser />
        {/* Admin-authored parallax / editorial / cta_band banners for the
            home page, rendered in display order. No-ops if none authored. */}
        <BannerSections page="home" />
      </div>
    </>
  );
}
