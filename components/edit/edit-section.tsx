"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";
import { productHref, type Product } from "@/lib/content";

type Props = {
  id: string;
  number: string;
  title: string;
  intro: string;
  products: Product[];
  mirror?: boolean;
  // Backend-authored overrides (all optional). When undefined, the section
  // keeps its historical hardcoded-feel behaviour.
  piecesCount?: number;      // explicit count — overrides products.length
  description?: string;       // longer editorial paragraph below the intro
  featureImage?: string;      // hero image shown above the product stack
  featuredPieceName?: string; // caption under the hero image
};

export function EditSection({
  id,
  number,
  title,
  intro,
  products,
  mirror = false,
  piecesCount,
  description,
  featureImage,
  featuredPieceName
}: Props) {
  // Admin override wins; falls back to the matched-product count.
  const resolvedCount =
    typeof piecesCount === "number" && piecesCount > 0
      ? piecesCount
      : products.length;

  return (
    <section
      id={id}
      className="relative bg-ink py-28 text-chalk md:py-40"
      aria-labelledby={`${id}-heading`}
    >
      <div className="mx-auto max-w-editorial px-6 md:px-14">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-16 lg:gap-24">
          {/* Text panel — sticky pin per section, positioned so the pinned
              block sits around the vertical centre of the viewport.
              Placement flips on `mirror` for editorial rhythm. */}
          <div
            className={clsx(
              "md:col-span-4 md:sticky md:top-[32vh] md:self-start",
              mirror ? "md:col-start-9" : "md:col-start-1"
            )}
          >
            <motion.h2
              id={`${id}-heading`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-display-md font-semibold uppercase leading-[1.02] tracking-[0.005em]"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 max-w-sm text-[11px] uppercase leading-[1.9] tracking-[0.18em] text-chalk/80 md:text-[12px]"
            >
              {intro}
            </motion.p>

            {/* Description was previously rendered here below the tagline.
                Moved to the right column under the feature piece name to
                match the deployed reference layout (title → description →
                CTA, all beside the image). */}

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <span
                aria-hidden
                className="text-[10px] uppercase tracking-[0.32em] text-chalk/40"
              >
                {String(resolvedCount).padStart(2, "0")} pieces in this edit
              </span>
            </motion.div>
          </div>

          {/* Product stack — narrower column with capped image width for strong
              negative space around each piece. Optional admin-authored feature
              lead card sits above the first piece. */}
          <div
            className={clsx(
              "flex flex-col gap-20 md:col-span-5 md:gap-32",
              mirror ? "md:col-start-1 md:row-start-1" : "md:col-start-8"
            )}
          >
            {(featureImage || featuredPieceName || description) && (
              <motion.article
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto w-full max-w-md"
              >
                {featureImage && (
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-onyx">
                    <SafeImage
                      src={featureImage}
                      alt={featuredPieceName || title}
                      fallbackSeed={`edit-feature-${id}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Prominent title → description → CTA cluster, matching the
                    deployed reference layout. The admin-authored
                    `featuredPieceName` becomes the big display heading, not
                    a small caption. */}
                <div className="mt-8 flex flex-col gap-4">
                  {featuredPieceName && (
                    <h3 className="font-display text-[clamp(1.25rem,2vw,1.75rem)] font-semibold uppercase leading-[1.1] tracking-[0.005em]">
                      {featuredPieceName}
                    </h3>
                  )}
                  {description && (
                    <p className="max-w-[46ch] text-[13px] leading-[1.7] text-chalk/75">
                      {description}
                    </p>
                  )}
                  {/* "Discover the piece" CTA — links to the first product
                      in this edit when available. Hidden otherwise. Later we
                      can add an explicit CTA href field on EditTag if admins
                      want to point elsewhere. */}
                  {products[0] && (
                    <Link
                      href={productHref(products[0])}
                      className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk underline underline-offset-[6px] decoration-chalk/50 transition-colors hover:decoration-chalk"
                    >
                      Discover the piece
                    </Link>
                  )}
                </div>
              </motion.article>
            )}

            {products.map((p) => (
              <EditCard key={p.handle} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EditCard({ product }: { product: Product }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="group mx-auto w-full max-w-md"
    >
      <Link href={productHref(product)} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-onyx">
          <SafeImage
            src={product.image}
            alt={product.name}
            fallbackSeed={product.handle}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1600ms] ease-silk group-hover:scale-[1.04]"
          />
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <h3 className="font-display text-[clamp(1.25rem,2vw,1.75rem)] font-semibold uppercase leading-[1.1] tracking-[0.005em]">
            {product.name}
          </h3>
          <p className="max-w-[46ch] text-[13px] leading-[1.7] text-chalk/75">
            {product.description}
          </p>
          <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk underline underline-offset-[6px] decoration-chalk/50 transition-colors group-hover:decoration-chalk">
            Discover the piece
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
