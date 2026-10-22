"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Hardcoded defaults — DISABLED. Backend-only now. Uncomment to restore
// the hardcoded "edit-hero.png" + "Begin the selection" fallback used
// when no banner is authored for page: 'edit'.
//
// const DEFAULT_IMAGE = "/images/edit-hero.png";
// const DEFAULT_IMAGE_ALT = "The Edit — a curated selection of pieces";
// const DEFAULT_CTA_LABEL = "Begin the selection";
// const DEFAULT_CTA_HREF = "#statement";

// Backend hero banner override (type: 'hero', page: 'edit').
export type EditHeroProps = {
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EditHero({
  image,
  imageAlt,
  ctaLabel,
  ctaHref
}: EditHeroProps = {}) {
  const resolvedImage = image || "";
  const resolvedImageAlt = imageAlt || "";
  const resolvedCtaLabel = ctaLabel || "";
  const resolvedCtaHref = ctaHref || "";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-ink text-chalk grain"
    >
      {/* Parallax cover — quieter than /collections; heavier wash so title dominates. */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src={resolvedImage}
          alt={resolvedImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />
      </motion.div>

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
