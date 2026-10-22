import type { Metadata } from "next";
import { JOURNAL_ENTRIES } from "@/lib/content";
import { JournalHero } from "@/components/journal/journal-hero";
import { JournalGallery } from "@/components/journal/journal-gallery";
// Hardcoded closing cta — DISABLED. Backend-only now via <BannerSections
// page="studio" />. Uncomment the import AND the JSX below together
// to restore.
//
// import { JournalClosing } from "@/components/journal/journal-closing";
import { fetchHeroFor } from "@/lib/banners-api";
import { BannerSections } from "@/components/site/banner-sections";

export const metadata: Metadata = {
  title: "The Studio — The Luxe Version",
  description: "Notes, guides and portraits from the studio."
};

export default async function JournalPage() {
  // The admin's hero banners for this page are authored under `page: 'studio'`
  // (matches the PAGE_OPTIONS in TLV-admin/src/pages/Banners.jsx).
  const hero = await fetchHeroFor("studio");
  return (
    <>
      <JournalHero
        image={hero?.image || undefined}
        imageAlt={hero?.title || hero?.subtitle || undefined}
        ctaLabel={hero?.ctaLabel || undefined}
        ctaHref={hero?.ctaHref || undefined}
      />
      <JournalGallery entries={JOURNAL_ENTRIES} />
      {/* <JournalClosing /> */}
      <BannerSections page="studio" />
    </>
  );
}
