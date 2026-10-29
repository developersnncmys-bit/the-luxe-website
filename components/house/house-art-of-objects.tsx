"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Admin override props for the full-bleed closing image + caption. Both
// optional — defaults keep the section rendering when no banner is authored.
export type HouseArtOfObjectsProps = {
  featureImage?: string;            // overrides the big full-bleed image
  featureImageAttribution?: string; // overrides the small caption below it
};

const DEFAULT_FEATURE_IMAGE = "/images/house.png";
const DEFAULT_FEATURE_IMAGE_ALT =
  "A single sculpted form — the room around it, kept quiet";
const DEFAULT_FEATURE_IMAGE_ATTRIBUTION = "Objet · Sillon — cast bronze";

export function HouseArtOfObjects({
  featureImage,
  featureImageAttribution
}: HouseArtOfObjectsProps = {}) {
  const resolvedImage = featureImage || DEFAULT_FEATURE_IMAGE;
  const resolvedAttribution =
    featureImageAttribution || DEFAULT_FEATURE_IMAGE_ATTRIBUTION;
  const resolvedAlt = featureImageAttribution || DEFAULT_FEATURE_IMAGE_ALT;

  return (
    <section
      className="relative bg-ink py-32 text-chalk md:py-44"
      aria-labelledby="art-heading"
    >
      <div className="mx-auto max-w-editorial px-6 md:px-14">
        {/* Header — centred Chanel-style cluster, small eyebrow + contained heading */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.h2
            id="art-heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-display-md font-semibold uppercase leading-[1.02] tracking-[0.06em]"
          >
            The art of objects
          </motion.h2>
        </div>

        {/* Three quiet tenets, then a wide image below. Editorial three-up with generous whitespace. */}
        <div className="mt-24 grid grid-cols-12 gap-8 md:mt-32 md:gap-12">
          {TENETS.map((t, i) => (
            <motion.article
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 border-t border-chalk/15 pt-8 md:col-span-4"
            >
              <p className="mb-6 text-[10px] uppercase tracking-[0.32em] text-chalk/45">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display text-[clamp(1.25rem,1.75vw,1.5rem)] font-semibold uppercase leading-[1.15] tracking-[0.005em]">
                {t.title}
              </h3>
              <p className="mt-6 max-w-[40ch] text-[13px] leading-[1.85] text-chalk/75">
                {t.body}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Full-bleed still — the philosophy embodied. Sits below the tenets to close the chapter. */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 md:mt-32"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-onyx">
            <Image
              src={resolvedImage}
              alt={resolvedAlt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-chalk/40">
            {resolvedAttribution}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const TENETS = [
  {
    title: "One thing, done well",
    body:
      "A room holds fewer things than most rooms think. We choose the piece that earns the space it takes."
  },
  {
    title: "Kept, not styled",
    body:
      "Décor is not a season. Our pieces are made to stay — through the room's changing weather, the years, the light."
  },
  {
    title: "The room, then the object",
    body:
      "We think about where a piece lives before we think about what it is. Scale, hour, quiet — first. Form — after."
  }
];
