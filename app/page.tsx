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
  fetchBannerForSection
} from "@/lib/banners-api";
import { fetchInSituList } from "@/lib/in-situ-api";
import { fetchJournalEntries } from "@/lib/journal-api";
import { fetchProducts } from "@/lib/products-api";
import type { Beat } from "@/components/home/chapter-object";
import type { JournalTeaserItem } from "@/components/home/journal";
import type { Product } from "@/lib/content";
import { BannerSections } from "@/components/site/banner-sections";

// Groups products by `category` and emits one per category per pass until
// `max` is reached (or every category is exhausted). Preserves the order
// categories first appear in the input, so admin-controlled Product order
// drives the sequence.
//
// Dedupes on both `handle` AND `image` URL as it goes. The handle guard
// prevents the same product landing in the grid twice; the image guard
// catches the common data-entry mistake where two different products share
// the same uploaded image (which otherwise reads as a visual repeat on the
// home page even though the pick order is technically correct).
function pickRoundRobinByCategory(products: Product[], max: number): Product[] {
  const byCategory = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.category;
    const bucket = byCategory.get(key);
    if (bucket) bucket.push(p);
    else byCategory.set(key, [p]);
  }

  const picked: Product[] = [];
  const seenHandles = new Set<string>();
  const seenImages = new Set<string>();
  const cursors = new Map<string, number>();
  const categories = Array.from(byCategory.keys());

  // Keep looping categories until we hit `max` or a full round added nothing.
  while (picked.length < max) {
    let addedThisRound = false;
    for (const cat of categories) {
      if (picked.length >= max) break;
      const list = byCategory.get(cat)!;
      let idx = cursors.get(cat) ?? 0;

      // Advance past any product in this category that would duplicate an
      // already-picked handle or image — don't just skip and try again next
      // round, actually move the cursor so we don't re-check it.
      while (idx < list.length) {
        const candidate = list[idx];
        const dupHandle = seenHandles.has(candidate.handle);
        const dupImage = !!candidate.image && seenImages.has(candidate.image);
        if (!dupHandle && !dupImage) break;
        idx++;
      }

      if (idx < list.length) {
        const chosen = list[idx];
        picked.push(chosen);
        seenHandles.add(chosen.handle);
        if (chosen.image) seenImages.add(chosen.image);
        cursors.set(cat, idx + 1);
        addedThisRound = true;
      } else {
        // Exhausted this category — persist the cursor so later rounds skip
        // past it.
        cursors.set(cat, list.length);
      }
    }
    if (!addedThisRound) break; // every category is exhausted
  }

  return picked;
}

export default async function HomePage() {
  // Backend overrides for the home page:
  //   • `hero`         → <Hero> swaps in a banner-authored image + CTA
  //   • `filmBanner`   → ChapterFilm media/text (section: 'film')
  //   • `lookBanner`   → ChapterLook cover + eyebrow + title (section: 'look')
  //   • `inSitu` + `products` → ChapterObject beats, joined by productRef
  //   • `journalEntries` → cards in the "From the Studio" teaser strip
  const [
    hero,
    filmBanner,
    lookBanner,
    inSitu,
    products,
    journalEntries
  ] = await Promise.all([
    fetchHeroFor("home"),
    fetchBannerForSection("home", "film"),
    fetchBannerForSection("home", "look"),
    fetchInSituList(),
    fetchProducts(),
    fetchJournalEntries()
  ]);

  // Map backend journal entries → JournalTeaser's shape. Cap at 4 (the home
  // strip is 4-up on desktop). Click target links to the Studio page and
  // anchors to the matching piece via its heading id.
  const teaserEntries: JournalTeaserItem[] = journalEntries
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      title: e.name,
      image: e.hero || "",
      href: `/journal#studio-piece-${e.id}`
    }));

  // "The Complete Collection" grid — one product per category in round-robin
  // order, capped at 6. Round 1 draws one from each category, round 2 fills
  // the remaining slots by drawing again from the first categories, and so
  // on. Keeps the grid balanced instead of being dominated by whichever
  // category has the most pieces.
  const collectionPicks = pickRoundRobinByCategory(products, 6);

  // Build ChapterObject beats from the InSitu pairings. The inset shot is
  // required (that's the one the admin uploads explicitly). The hero can be
  // empty — SafeImage inside ChapterObject renders a picsum placeholder,
  // which is more informative than silently dropping the beat and falling
  // back to hardcoded BEATS when the matched product has no image yet.
  const inSituBeats: Beat[] = inSitu
    .map((entry): Beat | null => {
      const product = products.find(
        (p) => p.handle === entry.productRef.toLowerCase()
      );
      const insetSrc = entry.image || "";
      if (!insetSrc) return null;
      const heroSrc = entry.heroImage || product?.image || "";
      const categoryLabel = entry.categoryLabel || product?.category || "";
      return {
        hero: {
          kind: "image",
          src: heroSrc,
          alt: entry.heroTitle || entry.productLabel || product?.name || "",
          kicker: product?.category || "",
          // Admin override wins; falls back to the entry's productLabel,
          // then the matched product's name.
          label: entry.heroTitle || entry.productLabel || product?.name || "",
          caption: entry.heroCaption || undefined
        },
        inset: {
          kind: "image",
          src: insetSrc,
          alt: `${entry.productLabel || product?.name || "piece"} in situ`,
          kicker: "In Situ",
          label: categoryLabel
            ? categoryLabel.startsWith("In the Room")
              ? categoryLabel
              : `In the Room · ${categoryLabel}`
            : "In the Room"
        }
      };
    })
    .filter((b): b is Beat => b !== null);

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
          {/* ChapterObject — "See the Piece in the Room". Beats come from
              the admin's InSitu pairings joined against the product catalog.
              If none authored, ChapterObject falls back to its hardcoded
              BEATS internally. */}
          <ChapterObject beats={inSituBeats} />
          {/* <Interlude /> */}
        </div>
     

      <div className="relative bg-ink">
        <Collection products={collectionPicks} />
        {/* "From the Studio" strip — admin's Journal entries. Falls back to
            hardcoded JOURNAL_ENTRIES internally when the backend returns
            an empty list. */}
        <JournalTeaser entries={teaserEntries} />
        {/* Admin-authored parallax / editorial / cta_band banners for the
            home page, rendered in display order. No-ops if none authored. */}
        <BannerSections page="home" />
      </div>
    </>
  );
}
