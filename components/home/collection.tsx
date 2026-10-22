"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, productHref, type Product } from "@/lib/content";
import { SafeImage } from "@/components/ui/safe-image";

// Six hand-picked pieces for the home "Complete Collection" grid — arranged
// so the 3-col desktop layout reads as two full rows (row 1: one per
// category we're highlighting, row 2: a second draw from the two largest
// categories). Handles are looked up in PRODUCTS at build time; if any go
// missing they're silently dropped rather than leaving a blank tile.
const FEATURED_HANDLES = [
  "sculpture-linconnu",
  "vase-onde",
  "charger-terra",
  "chandelier-verre",
  "sculpture-ardor",
  "vase-auren"
];

const FEATURED = FEATURED_HANDLES
  .map((handle) => PRODUCTS.find((p) => p.handle === handle))
  .filter((p): p is Product => Boolean(p));

// Hardcoded tile-image default map — DISABLED. Backend-only now. Admin
// authors overrides via Banners (type: 'weave') and the home page passes
// them in as `tileOverrides`. If no override is authored, the tile falls
// through to the product's own image. Uncomment to restore a hardcoded
// per-category tile.
//
// const DEFAULT_TILE_IMAGE_OVERRIDE: Partial<Record<Product["category"], string>> = {};

export function Collection({
  tileOverrides
}: {
  tileOverrides?: Record<string, string>;
} = {}) {
  const isDesktop = useIsDesktop();
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    // grid enters when its top hits viewport bottom; animation completes when grid center hits viewport center
    offset: ["start end", "center center"]
  });

  return (
    <section
      id="collection"
      className="relative bg-ink py-32 text-chalk md:py-8"
      aria-labelledby="collection-heading"
    >
      <div className="mx-auto max-w-editorial px-6 md:px-10">
        {/* section header */}
        <div className="mb-16 flex flex-col items-center text-center md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-chalk/80 md:text-[11px]"
          >
            The Language of the House
          </motion.p>
          <motion.h2
            id="collection-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(1.125rem,1.75vw,1.75rem)] font-bold uppercase leading-[1.05] tracking-[0.02em]"
          >
            The Complete Collection
          </motion.h2>
        </div>

        <div
          ref={gridRef}
          className="mx-auto grid max-w-[1100px] grid-cols-1 gap-x-6 gap-y-24 md:grid-cols-3 md:gap-x-16 md:gap-y-32"
        >
          {FEATURED.map((p, i) => (
            <ProductTile
              key={p.handle}
              product={p}
              index={i}
              scrollYProgress={scrollYProgress}
              isDesktop={isDesktop}
              tileOverrides={tileOverrides}
            />
          ))}
        </div>

        <div className="mt-32 flex flex-col items-center gap-8 md:mt-40">
          <Link href="/collections" className="cta-outline text-chalk">
            Discover the full index
          </Link>
        </div>
      </div>
    </section>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

function ProductTile({
  product,
  index,
  scrollYProgress,
  isDesktop,
  tileOverrides
}: {
  product: Product;
  index: number;
  scrollYProgress: MotionValue<number>;
  isDesktop: boolean;
  tileOverrides?: Record<string, string>;
}) {
  // grid position on the 3-col desktop layout
  const col = index % 3; // 0 = left, 1 = center, 2 = right
  const row = Math.floor(index / 3); // 0 = top, 1 = bottom

  // fly-in offsets: each tile starts bunched toward the grid center, then springs out to its natural cell
  //   col 0 (left)   → starts pushed RIGHT (+xInit)
  //   col 2 (right)  → starts pushed LEFT  (-xInit)
  //   row 0 (top)    → starts pushed DOWN  (+yInit)
  //   row 1 (bottom) → starts pushed UP    (-yInit)
  const xInit = isDesktop ? (1 - col) * 26 : 0; // vw
  const yInit = isDesktop ? (0.5 - row) * 22 : 0; // vh
  const scaleInit = isDesktop ? 0.62 : 0.94;

  const x = useTransform(scrollYProgress, [0, 0.55], [`${xInit}vw`, "0vw"]);
  const y = useTransform(scrollYProgress, [0, 0.55], [`${yInit}vh`, "0vh"]);
  const scale = useTransform(scrollYProgress, [0, 0.55], [scaleInit, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.32], [0, 1]);

  // Home tiles are framed as one representative per category, so the tile
  // heading shows the category name rather than the specific product name.
  // Admin-authored weave banners override the tile image per category name;
  // we check the backend overrides first, then the hardcoded default map,
  // then fall back to the product's own image.
  const tileHeading = product.category;
  // Lookup: backend weave override → product's own image. The hardcoded
  // DEFAULT_TILE_IMAGE_OVERRIDE middle tier is DISABLED above.
  const tileImage = tileOverrides?.[product.category] ?? product.image;

  return (
    <motion.article
      style={{ x, y, scale, opacity }}
      className="group [will-change:transform,opacity]"
    >
      <Link href={productHref(product)} className="mx-auto block w-full max-w-[300px]">
        {/* Category heading above image */}
        <h3 className="mb-5 font-display text-[15px] font-bold uppercase leading-[1.15] tracking-[0.02em] md:text-[17px]">
          {tileHeading}
        </h3>

        <div className="relative aspect-[4/5] w-full overflow-hidden bg-onyx">
          <SafeImage
            src={tileImage}
            alt={product.category}
            fallbackSeed={`home-tile-${product.category}`}
            fill
            sizes="(min-width: 768px) 300px, 100vw"
            className="object-cover transition-transform duration-[1600ms] ease-silk group-hover:scale-[1.04]"
          />
        </div>

        <p className="mt-7 max-w-[42ch] text-[14px] leading-[1.55] text-chalk/80 md:text-[15px]">
          {product.description}
        </p>

        <span className="mt-6 inline-block text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk underline underline-offset-[6px] decoration-[1.5px] decoration-chalk/70 transition-colors group-hover:decoration-chalk md:text-[12px]">
          Shop now
        </span>
      </Link>
    </motion.article>
  );
}
