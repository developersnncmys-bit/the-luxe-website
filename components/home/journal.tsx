"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { JOURNAL_ENTRIES } from "@/lib/content";
import { SafeImage } from "@/components/ui/safe-image";

// Shape used by the strip — matches both the hardcoded JOURNAL_ENTRIES
// above and admin-authored Journal rows passed in from app/page.tsx.
// `href` is the destination for the card click (we land on the Studio page
// and anchor to the matching piece).
export type JournalTeaserItem = {
  id: string;
  title: string;
  image: string;
  href: string;
};

export type JournalTeaserProps = {
  entries?: JournalTeaserItem[];
};

export function JournalTeaser({ entries }: JournalTeaserProps = {}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stripRef,
    offset: ["start end", "end start"]
  });

  // Backend entries win when passed and non-empty; otherwise fall back to
  // the hardcoded JOURNAL_ENTRIES slice so the strip never renders empty
  // during local dev or before the admin has authored anything.
  const resolvedEntries: JournalTeaserItem[] =
    entries && entries.length > 0
      ? entries
      : JOURNAL_ENTRIES.slice(0, 4).map((e) => ({
          id: e.slug,
          title: e.title,
          image: e.image,
          // Hardcoded fallback entries don't have individual pages; link to
          // the Studio page itself.
          href: "/journal"
        }));

  return (
    <section
      className="relative bg-ink pt-32 pb-0 text-chalk md:pt-18"
      aria-labelledby="journal-heading"
    >
      {/* header — centered, matches Complete Collection rhythm */}
      <div className="mx-auto max-w-editorial px-6 md:px-10">
        <div className="mb-16 flex flex-col items-center text-center md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-chalk/80 md:text-[11px]"
          >
            Behind the Scenes
          </motion.p>
          <motion.h2
            id="journal-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(1.125rem,1.75vw,1.75rem)] font-bold uppercase leading-[1.05] tracking-[0.02em]"
          >
            From the Studio
          </motion.h2>
        </div>
      </div>

      {/* card strip — tall portraits with breathing room. Home teases only 4;
          full 9-entry gallery lives at /journal. */}
      <div
        ref={stripRef}
        className="mx-auto grid max-w-editorial grid-cols-1 gap-6 px-6 md:grid-cols-4 md:gap-8 md:px-10"
      >
        {resolvedEntries.slice(0, 4).map((entry, i) => (
          <JournalCard
            key={entry.id}
            entry={entry}
            index={i}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>

      {/* View-more CTA — signature cta-rule below the strip, linking to the
          full journal gallery. */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 flex justify-center md:mt-20"
      >
        <Link href="/journal" className="cta-rule text-chalk">
          View all notes
        </Link>
      </motion.div>
    </section>
  );
}

function JournalCard({
  entry,
  index,
  scrollYProgress
}: {
  entry: JournalTeaserItem;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  // index still used for parallax alternation and stagger delay below
  // Alternate parallax direction so adjacent cards drift opposite ways —
  // creates a subtle "breathing" rhythm across the strip.
  const parallaxRange: [string, string] =
    index % 2 === 0 ? ["8%", "-8%"] : ["-8%", "8%"];
  const y = useTransform(scrollYProgress, [0, 1], parallaxRange);

  return (
    <motion.article
      initial={{ opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 1.4,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {/* Cards are intentionally non-clickable. Previously wrapped in a
          Link to entry.href; removed on request. The `group` class is kept
          so the hover scale + underline animations still work on cursor
          enter even without the navigation. */}
      <div
        className="group relative block aspect-square w-full overflow-hidden bg-onyx"
      >
        {/* Parallax image (extends past container so translate doesn't reveal empty edges) */}
        <motion.div style={{ y }} className="absolute -inset-y-[8%] inset-x-0">
          <SafeImage
            src={entry.image}
            alt={entry.title}
            fallbackSeed={entry.id}
            fill
            sizes="(min-width: 768px) 25vw, 100vw"
            quality={68}
            // Eagerly load the first card so it's decoded by the time the
            // section scrolls into view; the other three lazy-load normally.
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            className="object-cover transition-transform duration-[1800ms] ease-silk group-hover:scale-[1.08]"
          />
        </motion.div>

        {/* Bottom gradient — deepens on hover so the reveal text reads cleanly */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent opacity-90 transition-opacity duration-700 ease-silk group-hover:opacity-100" />

        {/* Label stack — title + underline only, no chapter numbering or CTA text */}
        <div className="absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-3 px-4 md:bottom-14">
          <h3 className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-chalk transition-transform duration-[700ms] ease-silk group-hover:-translate-y-1 md:text-[12px]">
            {entry.title}
          </h3>

          <span
            aria-hidden
            className="block h-px w-10 bg-chalk/70 transition-[width,background-color] duration-[600ms] ease-silk group-hover:w-20 group-hover:bg-chalk"
          />
        </div>
      </div>
    </motion.article>
  );
}
