"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconPlay } from "@/components/ui/icons";
import { SafeImage } from "@/components/ui/safe-image";
import { PRODUCTS, type Product } from "@/lib/content";

// A tile in either slot can now be a video OR an image — the discriminant is `kind`.
// `caption` is an optional admin override consumed by HeroPlusInset below:
// renders a line of supporting copy under the label.
export type MediaTile =
  | {
      kind: "video";
      src: string;
      poster: string;
      label: string;
      kicker: string;
      caption?: string;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
      label: string;
      kicker: string;
      caption?: string;
    };

// Category order for the beats — matches the home Collection section so both
// grids walk the house in the same rhythm.
//   Hero  ← first product of the category (its main image + name)
//   Inset ← SECOND product of the category (its lifestyleImage / image)
// Using a different piece for the inset avoids showing the same product
// twice in one beat, which read as duplication rather than "in the room".
const CATEGORY_ORDER: Product["category"][] = [
  "Sculptures",
  "Vases"
];

// Per-category hero handle override for the home "Shop the Piece" beats.
// Without this, the beat picks the first product in the category — which
// shifts whenever content.ts is reordered. Pin the intended handle here.
const HERO_HANDLE_OVERRIDE: Partial<Record<Product["category"], string>> = {
  Sculptures: "sculpture-linconnu",
  Vases: "vase-onde"
};

// Per-category HERO IMAGE override. When set, this path is used as the big
// hero shot on the beat, ignoring the pinned product's own `image` field.
// Lets us pick a specific in-frame image without mutating the product data
// (which would also change the collection card, sticky bar, etc.).
const HERO_IMAGE_OVERRIDE: Partial<Record<Product["category"], string>> = {
  Sculptures: "/images/sculptures/Linconnu/Linconnu-presence.png",
  Vases: "/images/vases/Onde/Vase-onde-presence.png"
};

// Per-category INSET IMAGE override — same idea, for the "In the Room ·
// <category>" inset. Path is used verbatim; not tied to any product's own
// image or lifestyleImage.
const INSET_IMAGE_OVERRIDE: Partial<Record<Product["category"], string>> = {
  Sculptures: "/images/sculptures/Telassa/22.jpg",
  Vases: "/images/sculptures/Altesse/Altesse-home.png"
};

export type Beat = { hero: MediaTile; inset: MediaTile };

const BEATS: Beat[] = CATEGORY_ORDER
  .map((cat) => {
    const catProducts = PRODUCTS.filter((p) => p.category === cat);
    const pinned = HERO_HANDLE_OVERRIDE[cat];
    const heroProduct =
      (pinned && catProducts.find((p) => p.handle === pinned)) ?? catProducts[0];
    if (!heroProduct) return null;
    // Inset falls back to the hero product if only one entry — but prefer
    // a DIFFERENT product than the hero when available.
    const insetProduct =
      catProducts.find((p) => p.handle !== heroProduct.handle) ?? heroProduct;
    return { heroProduct, insetProduct };
  })
  .filter((b): b is { heroProduct: Product; insetProduct: Product } => b !== null)
  .map(({ heroProduct, insetProduct }) => ({
    hero: {
      kind: "image" as const,
      src: HERO_IMAGE_OVERRIDE[heroProduct.category] ?? heroProduct.image,
      alt: heroProduct.name,
      kicker: heroProduct.category,
      label: heroProduct.name
    },
    inset: {
      kind: "image" as const,
      src:
        INSET_IMAGE_OVERRIDE[heroProduct.category] ??
        insetProduct.lifestyleImage ??
        insetProduct.image,
      alt: `${insetProduct.name} in situ`,
      kicker: "In Situ",
      label: `In the Room · ${heroProduct.category}`
    }
  }));

// `beats` — optional backend override. When passed and non-empty, replaces
// the hardcoded BEATS list above. The home page server component builds
// this from the InSitu + Products collections.
export type ChapterObjectProps = {
  beats?: Beat[];
};

export function ChapterObject({ beats }: ChapterObjectProps = {}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Shared parallax offsets — same subtle drift for every beat's hero and inset.
  const yHero = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);
  const yInset = useTransform(scrollYProgress, [0, 1], ["-10%", "6%"]);

  // Backend-authored beats win; otherwise use the hardcoded BEATS. Empty
  // backend arrays also fall through to the hardcoded set — avoids a blank
  // chapter if the admin hasn't seeded any in-situ rows yet.
  const resolvedBeats = beats && beats.length > 0 ? beats : BEATS;

  return (
    <section
      ref={ref}
      className="relative bg-ink py-28 text-chalk md:py-40"
      aria-labelledby="creations-heading"
    >
      <div className="mx-auto max-w-editorial px-6 md:px-10">
        {/* Section header */}
        <div className="mb-28 grid grid-cols-12 items-end gap-6 md:mb-44">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-chalk/60 md:col-span-3 md:col-start-1"
          >
            <span className="inline-block h-px w-10 bg-chalk/50" />
            Shop the Piece
          </motion.p>
          <motion.h2
            id="creations-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 font-display text-[clamp(1.125rem,1.75vw,1.75rem)] font-bold uppercase leading-[1.05] tracking-[0.02em] md:col-span-8 md:col-start-4"
          >
            See the Piece in the Room
          </motion.h2>
        </div>

        {/* One beat per category — alternating mirror for editorial rhythm.
            Spacing between beats matches the previous 40/64 gap. */}
        {resolvedBeats.map((beat, i) => (
          <div key={beat.hero.label} className={i === 0 ? "" : "mt-40 md:mt-64"}>
            <HeroPlusInset
              hero={beat.hero}
              inset={beat.inset}
              yHero={yHero}
              yInset={yInset}
              mirror={i % 2 === 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── BEAT COMPONENT ────────────────────────────────────────────────────────

function HeroPlusInset({
  hero,
  inset,
  yHero,
  yInset,
  mirror
}: {
  hero: MediaTile;
  inset: MediaTile;
  yHero: MotionValue<string>;
  yInset: MotionValue<string>;
  mirror: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* ── HERO CARD ── ~60% width, anchored to one side. Moderate negative
          space (~14%) between hero and inset — Chanel-editorial without a chasm. */}
      <div
        className={clsx(
          "w-full md:w-[60%]",
          mirror ? "md:ml-auto" : "md:mr-auto"
        )}
      >
        <motion.div
          style={{ y: yHero }}
          className="group relative aspect-[16/10] w-full overflow-hidden bg-onyx"
        >
          <MediaCell tile={hero} sizes="(min-width: 768px) 60vw, 100vw" />
        </motion.div>

        {/* Hero caption — stacked kicker + bold label, with an optional
            admin-authored sub-caption below. */}
        <div
          className={clsx(
            "mt-4",
            mirror ? "text-right" : "text-left"
          )}
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-chalk/60">
            {hero.kicker}
          </p>
          <h3 className="mt-2 font-display text-[14px] font-bold uppercase leading-[1.15] tracking-[0.01em] md:text-[16px]">
            {hero.label}
          </h3>
          {hero.caption && (
            <p className="mt-3 max-w-md text-[12px] leading-[1.6] text-chalk/70 md:text-[13px]">
              {hero.caption}
            </p>
          )}
        </div>
      </div>

      {/* ── INSET CARD ── overlaps the hero's OPPOSITE corner. Can be video or image. */}
      <motion.div
        style={{ y: yInset }}
        className={clsx(
          // Mobile: stacks below hero in normal flow.
          "mt-12 w-full md:mt-0 md:absolute md:z-10 md:w-[26%] md:-top-16 lg:-top-20",
          // Desktop: absolute to opposite corner of hero.
          mirror ? "md:left-0" : "md:right-0"
        )}
      >
        <div className="group relative aspect-[4/5] w-full overflow-hidden bg-onyx">
          <MediaCell tile={inset} sizes="(min-width: 768px) 26vw, 100vw" />
        </div>

        {/* Inset caption — anchored below piece, same side */}
        <div
          className={clsx(
            "mt-4",
            mirror ? "text-left" : "text-right"
          )}
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-chalk/60">
            {inset.kicker}
          </p>
          <h3 className="mt-2 font-display text-[14px] font-bold uppercase leading-[1.15] tracking-[0.01em] md:text-[16px]">
            {inset.label}
          </h3>
        </div>
      </motion.div>
    </motion.article>
  );
}

function MediaCell({ tile, sizes }: { tile: MediaTile; sizes: string }) {
  if (tile.kind === "video") {
    return <VideoCell src={tile.src} poster={tile.poster} label={tile.label} />;
  }
  return (
    <SafeImage
      src={tile.src}
      alt={tile.alt}
      fallbackSeed={tile.label}
      fill
      sizes={sizes}
      className="object-cover transition-transform duration-[1600ms] ease-silk group-hover:scale-[1.04]"
    />
  );
}

// ── MEDIA CELLS ───────────────────────────────────────────────────────────

function VideoCell({
  src,
  poster,
  label
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Belt-and-braces: autoPlay attribute is not always honored (React strict-mode
  // remount, hydration timing, Safari muted-autoplay quirks). Force play() on
  // mount as well; the promise catch swallows the harmless AbortError that
  // happens if the element unmounts before the play() promise resolves.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => void 0);
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-cover transition-transform duration-[1600ms] ease-silk group-hover:scale-[1.03]"
      />

      {/* Play glyph acts as a loading indicator — fades out once playback begins. */}
      <span
        className={clsx(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-silk",
          playing ? "opacity-0" : "opacity-100"
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/30 ring-1 ring-chalk/60 backdrop-blur-md">
          <IconPlay />
        </span>
      </span>
    </div>
  );
}
