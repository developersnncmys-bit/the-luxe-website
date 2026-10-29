"use client";

import { motion } from "framer-motion";

// Intro block that sits between the Studio hero and the first piece in the
// StudioShowcase. Three stacked lines, centered:
//   • small eyebrow with flanking rules (default "NOTES FROM THE HOUSE")
//   • big uppercase title (default "THE STUDIO")
//   • short tagline paragraph
// All three accept admin overrides via props so the content can later be
// wired to the backend without touching the component again.
export type JournalIntroProps = {
  eyebrow?: string;
  title?: string;
  tagline?: string;
};

const DEFAULT_EYEBROW = "Notes from the House";
const DEFAULT_TITLE = "The Studio";
const DEFAULT_TAGLINE =
  "Portraits of the pieces as they leave the floor — hero and every angle.";

export function JournalIntro({
  eyebrow,
  title,
  tagline
}: JournalIntroProps = {}) {
  const resolvedEyebrow = eyebrow || DEFAULT_EYEBROW;
  const resolvedTitle = title || DEFAULT_TITLE;
  const resolvedTagline = tagline || DEFAULT_TAGLINE;

  return (
    <section
      id="intro"
      className="relative bg-ink py-28 text-chalk md:py-40"
      aria-labelledby="journal-intro-heading"
    >
      <div className="mx-auto max-w-3xl px-6 text-center md:px-14">
        {/* Eyebrow — small all-caps with flanking rules, matches reference. */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex items-center justify-center gap-5 text-[10px] uppercase tracking-[0.32em] text-chalk/60"
        >
          <span aria-hidden className="inline-block h-px w-12 bg-chalk/40" />
          {resolvedEyebrow}
          <span aria-hidden className="inline-block h-px w-12 bg-chalk/40" />
        </motion.p>

        {/* Big display title. */}
        <motion.h2
          id="journal-intro-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold uppercase leading-[1.02] tracking-[0.02em]"
        >
          {resolvedTitle}
        </motion.h2>

        {/* Tagline — uppercase, airy letter-spacing, centred under the title. */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-xl text-[11px] uppercase leading-[1.9] tracking-[0.22em] text-chalk/80 md:text-[12px]"
        >
          {resolvedTagline}
        </motion.p>
      </div>
    </section>
  );
}
