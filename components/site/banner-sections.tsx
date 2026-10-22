// Renders admin-authored parallax / editorial / cta_band banners for a given
// storefront page, ordered by the `order` field. Drop <BannerSections page="x" />
// anywhere on a page.tsx — if the admin hasn't authored any banners for that
// page the component renders nothing.

import Link from "next/link";
import Image from "next/image";
import { fetchBannerSectionsFor, type Banner } from "@/lib/banners-api";

export async function BannerSections({ page }: { page: string }) {
  const banners = await fetchBannerSectionsFor(page);
  if (banners.length === 0) return null;

  return (
    <>
      {banners.map((b) => {
        if (b.type === "parallax") return <ParallaxBand key={b.id} banner={b} />;
        if (b.type === "editorial") return <EditorialBlock key={b.id} banner={b} />;
        if (b.type === "cta_band") return <CtaBand key={b.id} banner={b} />;
        return null;
      })}
    </>
  );
}

// Full-width image/video strip with centered copy and an optional CTA.
function ParallaxBand({ banner }: { banner: Banner }) {
  const isVideo = banner.mediaType === "video" && banner.videoUrl;
  return (
    <section className="relative h-[70svh] w-full overflow-hidden bg-ink text-chalk">
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            src={banner.videoUrl}
            poster={banner.image || undefined}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : banner.image ? (
          <Image
            src={banner.image}
            alt={banner.title || ""}
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-ink/45" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-editorial flex-col items-center justify-center px-6 text-center md:px-14">
        {banner.eyebrow && (
          <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-chalk/75">
            {banner.eyebrow}
          </p>
        )}
        {banner.title && (
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] font-semibold uppercase leading-[1.05] tracking-[0.02em]">
            {banner.title}
          </h2>
        )}
        {banner.subtitle && (
          <p className="mt-5 max-w-xl text-[14px] leading-[1.75] text-chalk/80">
            {banner.subtitle}
          </p>
        )}
        {banner.ctaLabel && banner.ctaHref && (
          <Link
            href={banner.ctaHref}
            className="mt-10 text-[11px] uppercase tracking-[0.28em] text-chalk underline underline-offset-[6px] decoration-chalk/50 hover:decoration-chalk"
          >
            {banner.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

// Editorial copy block — eyebrow + headline + body + optional image. Light
// background for contrast with the darker hero / parallax strips.
function EditorialBlock({ banner }: { banner: Banner }) {
  return (
    <section className="bg-chalk py-24 text-ink md:py-32">
      <div className="mx-auto grid max-w-editorial gap-14 px-6 md:grid-cols-[1fr_1fr] md:items-center md:gap-20 md:px-14">
        <div>
          {banner.eyebrow && (
            <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-ink/60">
              {banner.eyebrow}
            </p>
          )}
          {banner.title && (
            <h2 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold uppercase leading-[1.1] tracking-[0.02em]">
              {banner.title}
            </h2>
          )}
          {banner.body && (
            <p className="mt-6 max-w-xl text-[14px] leading-[1.85] text-ink/75">
              {banner.body}
            </p>
          )}
          {banner.ctaLabel && banner.ctaHref && (
            <Link
              href={banner.ctaHref}
              className="mt-8 inline-block text-[11px] uppercase tracking-[0.28em] text-ink underline underline-offset-[6px] decoration-ink/40 hover:decoration-ink"
            >
              {banner.ctaLabel}
            </Link>
          )}
        </div>
        {banner.image && (
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-onyx/5">
            <Image
              src={banner.image}
              alt={banner.title || ""}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}

// Image-less CTA strip with one or two buttons.
function CtaBand({ banner }: { banner: Banner }) {
  return (
    <section className="bg-ink py-20 text-chalk md:py-28">
      <div className="mx-auto max-w-editorial px-6 text-center md:px-14">
        {banner.eyebrow && (
          <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-chalk/60">
            {banner.eyebrow}
          </p>
        )}
        {banner.title && (
          <h2 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold uppercase leading-[1.1] tracking-[0.02em]">
            {banner.title}
          </h2>
        )}
        {banner.body && (
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-[1.75] text-chalk/75">
            {banner.body}
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {banner.ctaLabel && banner.ctaHref && (
            <Link
              href={banner.ctaHref}
              className="border border-chalk px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-chalk transition-colors hover:bg-chalk hover:text-ink"
            >
              {banner.ctaLabel}
            </Link>
          )}
          {banner.ctaLabel2 && banner.ctaHref2 && (
            <Link
              href={banner.ctaHref2}
              className="text-[11px] uppercase tracking-[0.28em] text-chalk/80 underline underline-offset-[6px] decoration-chalk/40 hover:text-chalk hover:decoration-chalk"
            >
              {banner.ctaLabel2}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
