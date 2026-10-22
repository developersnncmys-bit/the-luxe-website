"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
// useEffect kept commented alongside the disabled slider interval below.
import { useRef, useState } from "react";

// Hardcoded defaults — DISABLED. Previously used when no backend hero
// banner was authored for the home page. Uncomment to restore the two-
// slide default and the hardcoded "Discover the new collection" CTA.
//
// const DEFAULT_SLIDES = [
//   { src: "/images/home-hero2.png", alt: "The Luxe Version — interior in deep black velvet" },
//   { src: "/images/hero-banner-v2.png", alt: "The Luxe Version — sculptural pieces in warm neutrals" }
// ];
// const DEFAULT_CTA_LABEL = "Discover the new collection";
// const DEFAULT_CTA_HREF = "#collection";

// const SLIDE_DURATION_MS = 4000; // slider disabled

// Props mirror the fields on a backend `type: 'hero'` banner. All optional —
// when a page doesn't fetch a hero (or the admin hasn't authored one) the
// component renders the hardcoded defaults above.
export type HeroProps = {
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function Hero({ image, imageAlt, ctaLabel, ctaHref }: HeroProps = {}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [active] = useState(0);

  // Backend-only. If no banner authored, slides is a single empty-src entry
  // and the Next <Image> below will error — intentional, so missing banners
  // are visible during integration rather than silently papered over.
  const slides = [{ src: image || "", alt: imageAlt || "" }];
  const resolvedCtaLabel = ctaLabel || "";
  const resolvedCtaHref = ctaHref || "";

  // Slider auto-rotation disabled for now — first slide only.
  // useEffect(() => {
  //   const id = window.setInterval(() => {
  //     setActive((i) => (i + 1) % SLIDES.length);
  //   }, SLIDE_DURATION_MS);
  //   return () => window.clearInterval(id);
  // }, []);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-ink text-chalk grain"
    >
      {/* Outer parallax wrapper — scroll drives y + scale for cinematic exit. */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        {/* Stacked slides, crossfade via AnimatePresence. No Ken-Burns zoom —
            the image holds still while it's visible. */}
        <AnimatePresence>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={slides[active].src}
              alt={slides[active].alt}
              fill
              priority={active === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/70" />
      </motion.div>

      {/* Bottom-centered "cta-rule" — the tiny uppercase text sitting above a short vertical line */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-x-0 bottom-10 z-10 flex justify-center md:bottom-14"
      >
        <a href={resolvedCtaHref} className="cta-rule text-chalk">
          {resolvedCtaLabel}
        </a>
      </motion.div>

      {/* Slide indicators — disabled while the slider is turned off.
      <motion.div
        style={{ opacity }}
        className="absolute bottom-10 right-6 z-10 flex items-center gap-2 md:bottom-14 md:right-10"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-[3px] transition-all duration-500 ease-silk ${
              i === active ? "w-8 bg-chalk" : "w-4 bg-chalk/40 hover:bg-chalk/70"
            }`}
          />
        ))}
      </motion.div>
      */}
    </section>
  );
}
