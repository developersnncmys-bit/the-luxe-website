"use client";

import { motion } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";
import { useStore } from "@/components/store/store-provider";
import type { ExclusivePiece } from "@/lib/content";

// Centered "featured piece" hero that sits between the intro note and the
// alternating ExclusivePiece sections below. Mirrors the reference layout:
// eyebrow → full-bleed image → divider → discipline → name → tagline →
// one-line spec rail → price → "Add to Bag". Add-to-bag pushes the piece's
// slug through the normal store.addToCart flow; the store resolver adapts
// the ExclusivePiece into a Product so the cart drawer renders it.
export function ExclusiveFeatured({ piece }: { piece: ExclusivePiece }) {
  const { addToCart, openDrawer } = useStore();

  const specLine = [piece.material, piece.dimensions]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();

  const handleAddToBag = () => {
    addToCart(piece.slug, 1);
    openDrawer("cart");
  };

  return (
    <section
      aria-labelledby={`featured-${piece.slug}-heading`}
      className="relative bg-ink text-chalk"
    >
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:px-14 md:py-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-chalk/70"
        >
          The Featured Piece
        </motion.p>

        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-10 aspect-[4/3] w-full max-w-[900px] overflow-hidden md:mt-14"
        >
          <SafeImage
            src={piece.image}
            alt={`${piece.name} — ${piece.discipline}`}
            fallbackSeed={`exclusive-featured-${piece.slug}`}
            fill
            sizes="(min-width: 768px) 900px, 100vw"
            quality={78}
            priority
            className="object-contain"
          />
        </motion.figure>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-14 block h-px w-16 bg-chalk/40 md:mt-16"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-chalk/70"
        >
          {piece.discipline}
        </motion.p>

        <motion.h2
          id={`featured-${piece.slug}-heading`}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-center font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold uppercase leading-[1.02] tracking-[0.04em]"
        >
          {piece.name}
        </motion.h2>

        {(piece.tagline || piece.intro) && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-center font-display text-[clamp(0.95rem,1.1vw,1.1rem)] italic text-chalk/75"
          >
            {piece.tagline || piece.intro}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-3xl text-center text-[10px] uppercase leading-[1.9] tracking-[0.26em] text-chalk/70 md:text-[11px]"
        >
          {specLine}
        </motion.p>

        {typeof piece.price === "number" && piece.price > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 text-center text-[15px] tracking-[0.04em] text-chalk"
          >
            ₹ {piece.price.toLocaleString("en-IN")}
            <span className="text-chalk/55">*</span>
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1.1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex justify-center"
        >
          <button
            type="button"
            onClick={handleAddToBag}
            className="inline-flex items-center justify-center border border-chalk bg-chalk px-12 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink transition-colors duration-500 ease-silk hover:bg-transparent hover:text-chalk"
          >
            Add to Bag
          </button>
        </motion.div>
      </div>
    </section>
  );
}
