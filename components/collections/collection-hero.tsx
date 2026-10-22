"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Hardcoded defaults — DISABLED. Backend-only now. Uncomment to restore
// the hardcoded "collection-hero.png" + "Discover the pieces" fallback
// used when no banner is authored for page: 'collection'.
//
// const DEFAULT_IMAGE = "/images/collection-hero.png";
// const DEFAULT_IMAGE_ALT = "The Collection — a sculptural chandelier at dusk";
// const DEFAULT_CTA_LABEL = "Discover the pieces";
// const DEFAULT_CTA_HREF = "#index";

// Backend hero banner override (type: 'hero', page: 'collection').
export type CollectionHeroProps = {
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function CollectionHero({
  image,
  imageAlt,
  ctaLabel,
  ctaHref
}: CollectionHeroProps = {}) {
  const resolvedImage = image || "";
  const resolvedImageAlt = imageAlt || "";
  const resolvedCtaLabel = ctaLabel || "";
  const resolvedCtaHref = ctaHref || "";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-ink text-chalk grain"
    >
      {/* Parallax cover — one still image; the drama comes from scale + wash, not autoplay */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src={resolvedImage}
          alt={resolvedImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Diagonal wash — heavier bottom so the title sits comfortably on darker ground */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/10 to-ink/75" />
      </motion.div>

      {/* Bottom-centered cta-rule — signature Chanel-style scroll cue */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-x-0 bottom-10 z-10 flex justify-center md:bottom-14"
      >
        <Link href={resolvedCtaHref} className="cta-rule text-chalk">
          {resolvedCtaLabel}
        </Link>
      </motion.div>
    </section>
  );
}
