"use client";

import { motion } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";

// Shape used by the grid — matches both the hardcoded MATERIALS list below
// and admin-authored Material rows (which carry { name, description, image }).
export type HouseMaterialItem = {
  name: string;
  image?: string;
  body: string;
};

export type HouseMaterialsProps = {
  headline?: string;      // admin override for the big centered heading
  lead?: string;          // admin override for the centered intro paragraph
  items?: HouseMaterialItem[]; // admin-authored list; falls back to hardcoded
};

const DEFAULT_HEADLINE = "Materials";
const DEFAULT_LEAD =
  "Five families of matter. We work in these because they age with the room instead of against it — because the light finds them differently at every hour.";

export function HouseMaterials({ headline, lead, items }: HouseMaterialsProps = {}) {
  const resolvedHeadline = headline || DEFAULT_HEADLINE;
  const resolvedLead = lead || DEFAULT_LEAD;
  // Backend wins when items array is non-empty; otherwise the hardcoded
  // MATERIALS list keeps the section populated (and the storefront usable
  // when no admin content has been seeded yet).
  const resolvedItems = items && items.length > 0 ? items : MATERIALS;

  return (
    <section
      className="relative bg-ink py-32 text-chalk md:py-44"
      aria-labelledby="materials-heading"
    >
      <div className="mx-auto max-w-editorial px-6 md:px-14">
        {/* Centered header — the material section is the most inventory-adjacent
            chapter, so the header sits centred (museum-label posture). */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            id="materials-heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-display-md font-semibold uppercase leading-[1.02] tracking-[0.06em]"
          >
            {resolvedHeadline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-[13px] leading-[1.85] text-chalk/75 md:text-[14px]"
          >
            {resolvedLead}
          </motion.p>
        </div>

        {/* Grid of material tiles — image on top, name + short body below.
            5-across on desktop for the "material sample wall" feel; collapses
            on smaller screens. */}
        <ul className="mx-auto mt-24 grid grid-cols-2 gap-x-6 gap-y-14 md:mt-32 md:grid-cols-3 md:gap-x-8 md:gap-y-20 lg:grid-cols-5 lg:gap-x-10">
          {resolvedItems.map((m, i) => (
            <motion.li
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-onyx">
                <SafeImage
                  src={m.image ?? ""}
                  alt={`${m.name} — material sample`}
                  fallbackSeed={`material-${m.name.toLowerCase()}`}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-6 font-display text-[clamp(1rem,1.25vw,1.25rem)] font-semibold uppercase leading-none tracking-[0.08em]">
                {m.name}
              </h3>
              <p className="mt-3 text-[12px] leading-[1.7] text-chalk/70 md:text-[13px]">
                {m.body}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Material sample stills — pulled from public/images/materials/. Names must
// match the filenames on disk (lowercase, .png).
const MATERIALS = [
  {
    name: "Stone",
    image: "/images/materials/stone.png",
    body:
      "Travertine, marble, alabaster — cool to the hand, warm in the eye."
  },
  {
    name: "Ceramic",
    image: "/images/materials/ceramic.png",
    body:
      "Thrown, glazed and fired at the studio's own kilns."
  },
  {
    name: "Glass",
    image: "/images/materials/glass.png",
    body:
      "Hand-blown by a small circle of makers, breath still on the piece."
  },
  {
    name: "Metal",
    image: "/images/materials/metal.png",
    body:
      "Unlacquered brass and cast bronze — finishes that darken with the years."
  },
  {
    name: "Wood",
    image: "/images/materials/wood.png",
    body:
      "Walnut, oak, and blackened ash — hand-carved, oiled rather than sealed."
  }
];
