"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Shape used for the numbered principles list — matches both the hardcoded
// PRINCIPLES below and admin-authored CraftPrinciple rows.
export type HouseCraftPrincipleItem = {
  title: string;
  body: string;
};

export type HouseCraftProps = {
  headline?: string;              // overrides "Craft"
  lead?: string;                  // overrides the italic lead paragraph on the left
  image?: string;                 // overrides the right-column product shot
  imageAttribution?: string;      // overrides the small caption under the image
  principles?: HouseCraftPrincipleItem[]; // admin-authored list; falls back to hardcoded
};

const DEFAULT_HEADLINE = "Craft";
const DEFAULT_LEAD =
  "Each piece is made by a hand we know, from a workshop we've walked into.";
const DEFAULT_IMAGE = "/images/sculptures/scu4.png";
const DEFAULT_IMAGE_ATTRIBUTION = "Lume Alba · Brass, hand-turned";

export function HouseCraft({
  headline,
  lead,
  image,
  imageAttribution,
  principles
}: HouseCraftProps = {}) {
  const resolvedHeadline = headline || DEFAULT_HEADLINE;
  const resolvedLead = lead || DEFAULT_LEAD;
  const resolvedImage = image || DEFAULT_IMAGE;
  const resolvedAttribution = imageAttribution || DEFAULT_IMAGE_ATTRIBUTION;
  const resolvedPrinciples =
    principles && principles.length > 0 ? principles : PRINCIPLES;

  return (
    <section
      data-nav-invert
      className="relative bg-chalk py-32 text-ink md:py-44"
      aria-labelledby="craft-heading"
    >
      <div className="mx-auto max-w-editorial px-6 md:px-14">
        {/* Header — centred Chanel-style cluster, small eyebrow + contained heading */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.h2
            id="craft-heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-display-md font-semibold uppercase leading-[1.02] tracking-[0.06em]"
          >
            {resolvedHeadline}
          </motion.h2>
        </div>

        {/* Sticky-column body: image pins on the right, principles scroll on the left. */}
        <div className="mt-24 grid grid-cols-1 gap-16 md:mt-32 md:grid-cols-12 md:gap-12 lg:gap-16">
          <div className="md:col-span-6 md:col-start-1 md:pt-6">
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(1.25rem,2vw,1.75rem)] font-light leading-[1.5] text-ink/90"
            >
              {resolvedLead}
            </motion.p>

            <div className="mt-14 flex flex-col divide-y divide-ink/15 border-t border-b border-ink/15">
              {resolvedPrinciples.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-12 gap-4 py-8 md:py-10"
                >
                  <span className="col-span-2 text-[10px] uppercase tracking-[0.32em] text-ink/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="col-span-10">
                    <h3 className="font-display text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold uppercase leading-tight tracking-[0.005em]">
                      {p.title}
                    </h3>
                    <p className="mt-4 max-w-[46ch] text-[13px] leading-[1.85] text-ink/70">
                      {p.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8 md:sticky md:top-28 md:self-start">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] w-full overflow-hidden bg-onyx"
            >
              <Image
                src={resolvedImage}
                alt={resolvedAttribution || "Craft — a hand-finished piece from the studio"}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-ink/40">
              {resolvedAttribution}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  {
    title: "Small workshops",
    body:
      "We work only with makers small enough that the founder is still at the bench. No factory floors, no anonymous chains."
  },
  {
    title: "One at a time",
    body:
      "Every piece is finished by a single hand — poured, blown, turned, or carved. There is no line, no batch."
  },
  {
    title: "Marks kept in",
    body:
      "Where the maker's hand shows, we leave it. A hammer trace, a breath line in glass, a knot in the oak — these are the piece's provenance."
  },
  {
    title: "Time as a material",
    body:
      "Brass darkens. Wood warms. Glass clouds a shade. Our finishes are chosen for the year they will look best in — the fifth, not the first."
  }
];
