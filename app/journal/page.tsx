import type { Metadata } from "next";
import { JournalHero } from "@/components/journal/journal-hero";
import { JournalIntro } from "@/components/journal/journal-intro";
import { StudioShowcase } from "@/components/journal/studio-showcase";
// Old hardcoded JournalGallery + closing — DISABLED. The Studio page now
// renders the StudioShowcase layout driven by backend journal entries.
//
// import { JOURNAL_ENTRIES } from "@/lib/content";
// import { JournalGallery } from "@/components/journal/journal-gallery";
// import { JournalClosing } from "@/components/journal/journal-closing";
import { fetchHeroFor } from "@/lib/banners-api";
import { fetchJournalEntries } from "@/lib/journal-api";
import { BannerSections } from "@/components/site/banner-sections";

export const metadata: Metadata = {
  title: "The Studio — The Luxe Version",
  description: "Notes, guides and portraits from the studio."
};

export default async function JournalPage() {
  // The admin's hero banners for this page are authored under `page: 'studio'`
  // (matches the PAGE_OPTIONS in TLV-admin/src/pages/Banners.jsx). The
  // Studio pieces come from the Journal collection in the admin.
  const [hero, entries] = await Promise.all([
    fetchHeroFor("studio"),
    fetchJournalEntries()
  ]);

  // Map backend journal entries to the StudioShowcase item shape. The number
  // badge comes from the entry's `order` when present, falling back to the
  // 1-based iteration index.
  const items = entries.map((e, i) => ({
    id: e.id,
    number: String(e.order && e.order > 0 ? e.order : i + 1).padStart(2, "0"),
    category: (e.category || "Studio").toUpperCase(),
    title: e.name,
    body: e.body || "",
    hero: e.hero || "",
    images: Array.isArray(e.images) ? e.images.filter(Boolean) : []
  }));

  return (
    <>
      <JournalHero
        image={hero?.image || undefined}
        imageAlt={hero?.title || hero?.subtitle || undefined}
        ctaLabel={hero?.ctaLabel || undefined}
        ctaHref={hero?.ctaHref || undefined}
      />
      {/* Intro block — "NOTES FROM THE HOUSE / THE STUDIO / portraits of
          the pieces..." — matches the deployed reference. Component accepts
          optional eyebrow/title/tagline props for future admin wiring. */}
      <JournalIntro />
      <StudioShowcase items={items} />
      <BannerSections page="studio" />
    </>
  );
}
