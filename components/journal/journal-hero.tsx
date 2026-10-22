"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Hardcoded defaults — DISABLED. Backend-only now. Uncomment to restore
// the hardcoded "studio-hero.png" + "Begin reading" fallback used when
// no banner is authored for page: 'studio'.
//
// const DEFAULT_IMAGE = "/images/studio-hero.png";
// const DEFAULT_IMAGE_ALT = "Inside the studio";
// const DEFAULT_CTA_LABEL = "Begin reading";
// const DEFAULT_CTA_HREF = "#intro";

// Backend hero banner override (type: 'hero', page: 'studio').
export type JournalHeroProps = {
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function JournalHero({
  image,
  imageAlt,
  ctaLabel,
  ctaHref
}: JournalHeroProps = {}) {
  const resolvedImage = image || "";
  const resolvedImageAlt = imageAlt || "";
  const resolvedCtaLabel = ctaLabel || "";
  const resolvedCtaHref = ctaHref || "";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-ink text-chalk grain"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src={resolvedImage}
          alt={resolvedImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/20" />
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
