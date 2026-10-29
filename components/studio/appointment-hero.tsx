"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SafeImage } from "@/components/ui/safe-image";

// Full-bleed appointment hero. Left column: tracked eyebrow, headline,
// hairline, short note, and a vertical "HOW A VISIT WORKS" marker. Right
// column: an atmospheric sculpture plate that parallaxes gently against
// scroll.
//
// All copy and the image are overridable from the admin's Banners tab
// (page: 'appointment', type: 'hero'). When nothing is authored, the
// hardcoded defaults below render so the page is never blank.
export function AppointmentHero({
  image = "/images/studio-hero.png",
  eyebrow = "Studio Services · By Appointment",
  title = "Book an Appointment",
  body = "An unhurried hour at the studio. Pieces seen in person, under the light they were made for."
}: {
  image?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden bg-ink text-chalk"
      aria-labelledby="appointment-hero-heading"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <SafeImage
          src={image}
          alt="A sculptural grouping at the studio"
          fallbackSeed="appointment-hero"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        {/* Left-weighted scrim keeps the copy legible against the image. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent md:via-ink/40 lg:w-3/4"
        />
      </motion.div>

      <div className="relative z-10 flex min-h-[100svh] items-center px-6 pt-32 md:px-14 lg:px-20">
        <div className="w-full">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 text-[10px] uppercase tracking-[0.38em] text-chalk/60"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            id="appointment-hero-heading"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(1.75rem,4vw,3.5rem)] font-light uppercase leading-[1.02] tracking-[0.02em]"
          >
            {title}
          </motion.h1>

          <motion.span
            aria-hidden
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 block h-px w-20 origin-left bg-chalk/50"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-md text-[13px] leading-[1.9] text-chalk/70 md:text-[14px]"
          >
            {body}
          </motion.p>
        </div>
      </div>

      {/* Bottom marker — anchor-link to the three-step "Visit" section
          below the hero. Uses the shared .cta-rule pattern (vertical hairline
          growing on hover) so the touchpoint matches other CTAs on the site. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-10 left-6 z-10 md:bottom-14 md:left-14 lg:left-20"
      >
        <a
          href="#the-visit"
          className="cta-rule text-chalk/70 transition-colors duration-500 ease-silk hover:text-chalk"
        >
          How a Visit Works
        </a>
      </motion.div>
    </section>
  );
}
