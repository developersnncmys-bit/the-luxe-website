"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";

// One "piece" rendered as a full alternating section on the Studio page.
// Main image on one side, text + "N OTHER ANGLES" grid on the other.
// Clicking any angle thumbnail swaps the main image.
export type StudioShowcaseItem = {
  id: string;
  number: string;     // "01", "02", ... — admin can set via `order`
  category: string;   // small-caps label (e.g. "STUDIO", "OBJECT")
  title: string;      // big uppercase heading
  body: string;       // supporting paragraph
  hero: string;       // main / fallback image
  images: string[];   // additional angles (thumbnail grid)
};

export function StudioShowcase({ items }: { items: StudioShowcaseItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-ink text-chalk">
      {items.map((item, i) => (
        <StudioPiece key={item.id} item={item} mirror={i % 2 === 1} />
      ))}
    </section>
  );
}

function StudioPiece({
  item,
  mirror
}: {
  item: StudioShowcaseItem;
  mirror: boolean;
}) {
  // Full angle set — hero first, then additional angles. Clicking swaps the
  // main image in-place. Starts at index 0 (the hero).
  const allAngles = [item.hero, ...item.images].filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);
  const mainSrc = allAngles[activeIdx] || item.hero;

  // Reference design shows "7 OTHER ANGLES" when 8 total images → count the
  // non-main angles.
  const otherAnglesCount = Math.max(0, allAngles.length - 1);

  return (
    <article
      aria-labelledby={`studio-piece-${item.id}`}
      className="relative border-b border-chalk/10 py-20 md:py-28"
    >
      <div
        className={clsx(
          "mx-auto grid max-w-editorial grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-14 md:px-14 lg:gap-20",
          // On desktop, flip which column the big image sits in.
          mirror ? "md:[&>figure]:col-start-7" : ""
        )}
      >
        {/* ── MAIN IMAGE ── */}
        <motion.figure
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className={clsx(
            "relative md:col-span-6",
            mirror ? "md:col-start-7" : "md:col-start-1"
          )}
        >
          {/* 1:1 square — matches the deployed reference design
              (the-luxe-version-web.vercel.app/the-studio), where the main
              image renders at 600×600 inside a `aspect-ratio: 1 / 1` box.
              `max-w-[600px]` caps it at the reference width so wider column
              layouts don't stretch the image past that. */}
          <div className="relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden bg-onyx">
            <SafeImage
              key={mainSrc}
              src={mainSrc}
              alt={item.title}
              fallbackSeed={`studio-${item.id}-${activeIdx}`}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover transition-opacity duration-700 ease-silk"
            />
          </div>
        </motion.figure>

        {/* ── TEXT + ANGLES GRID ── */}
        <div
          className={clsx(
            "flex flex-col md:col-span-6",
            mirror ? "md:col-start-1 md:row-start-1" : "md:col-start-7"
          )}
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 text-[10px] uppercase tracking-[0.32em] text-chalk/60"
          >
            <span className="inline-block h-px w-10 bg-chalk/50" />
            {item.number} · {item.category || "STUDIO"}
          </motion.p>

          <motion.h2
            id={`studio-piece-${item.id}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-[clamp(1.75rem,3.5vw,3rem)] font-semibold uppercase leading-[1.05] tracking-[0.02em]"
          >
            {item.title}
          </motion.h2>

          {item.body && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-md text-[14px] leading-[1.75] text-chalk/75"
            >
              {item.body}
            </motion.p>
          )}

          {otherAnglesCount > 0 && (
            <div className="mt-12 md:mt-16">
              <p className="text-[10px] uppercase tracking-[0.32em] text-chalk/50">
                {String(otherAnglesCount).padStart(1, "0")} other angles
              </p>
              {/* 5-column thumbnail grid — wraps to a second row when there
                  are more than 5 angles (reference shows 5 + 3). */}
              <div className="mt-5 grid grid-cols-5 gap-3 md:gap-4">
                {allAngles.map((src, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      aria-label={`Show angle ${i + 1}`}
                      aria-pressed={isActive}
                      className={clsx(
                        "group relative aspect-square w-full overflow-hidden bg-onyx outline-none transition-opacity",
                        isActive
                          ? "opacity-100"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <SafeImage
                        src={src}
                        alt=""
                        fallbackSeed={`studio-${item.id}-thumb-${i}`}
                        fill
                        sizes="(min-width: 768px) 12vw, 20vw"
                        className="object-cover"
                      />
                      {/* Underline on the active thumb — matches the reference. */}
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute inset-x-2 bottom-0 h-[2px] bg-chalk"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
