"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";
import { productHref, type Product } from "@/lib/content";
import {
  categoryLabelFromSlug,
  type Category
} from "@/lib/categories-api";
import {
  FilterDrawer,
  FilterIcon,
  applyProductFilters,
  getAvailableMaterials
} from "@/components/collections/filters/product-filters";

// "all" is a fixed bookend. Every other chip id is a backend category slug.
type FilterId = string;

type Chip = {
  id: FilterId;
  label: string; // display label in the chip
  match?: Product["category"]; // omitted for "all"
};

// Reserved slug the admin can create to override the "All Objects" chip —
// their category name becomes the chip label and their category image
// becomes the chip thumbnail. The chip is always rendered; deleting the
// backend category just reverts to the hardcoded defaults, so the "show
// all" entry can never be removed by accident.
const ALL_OBJECTS_OVERRIDE_SLUG = "all-objects";

export function ObjectsCatalog({
  products,
  categories
}: {
  products: Product[];
  categories: Category[];
}) {
  // Build the chip list from backend categories. `match` compares against the
  // product's title-cased category label (which is itself derived from the
  // slug in products-api.adaptBackendProduct), so chip filtering survives
  // admin renames of the display `name`.
  const CHIPS: Chip[] = useMemo(() => {
    const allOverride = categories.find(
      (c) => c.id === ALL_OBJECTS_OVERRIDE_SLUG
    );
    const rest = categories.filter((c) => c.id !== ALL_OBJECTS_OVERRIDE_SLUG);
    return [
      { id: "all", label: allOverride?.name || "All Objects" },
      ...rest.map((c) => ({
        id: c.id,
        label: c.name || categoryLabelFromSlug(c.id),
        match: categoryLabelFromSlug(c.id)
      }))
    ];
  }, [categories]);

  const [active, setActive] = useState<FilterId>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedPrices, setSelectedPrices] = useState<Set<string>>(
    () => new Set()
  );

  // 1. Chip narrows by category.
  const chipFiltered = useMemo(() => {
    if (active === "all") return products;
    const match = CHIPS.find((c) => c.id === active)?.match;
    return match ? products.filter((p) => p.category === match) : products;
  }, [active, products, CHIPS]);

  // 2. Available materials adapt to the current chip selection — only surface
  //    material keywords that at least one currently-visible product has.
  const availableMaterials = useMemo(
    () => getAvailableMaterials(chipFiltered),
    [chipFiltered]
  );

  // 3. Drawer filters (material + price) apply on top of the chip filter.
  const visible = useMemo(
    () => applyProductFilters(chipFiltered, selectedMaterials, selectedPrices),
    [chipFiltered, selectedMaterials, selectedPrices]
  );

  const activeDrawerCount = selectedMaterials.size + selectedPrices.size;

  const toggleMaterial = (kw: string) =>
    setSelectedMaterials((prev) => {
      const next = new Set(prev);
      next.has(kw) ? next.delete(kw) : next.add(kw);
      return next;
    });

  const togglePrice = (key: string) =>
    setSelectedPrices((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const clearDrawerFilters = () => {
    setSelectedMaterials(new Set());
    setSelectedPrices(new Set());
  };

  // Build a thumbnail per chip. Primary source is the Category's `image`
  // (the admin's "Tile image" field) so the circle reflects an editorial
  // choice, not whatever product happens to sit first in the category.
  // Falls back to the first product in that category when the admin hasn't
  // uploaded a tile yet. Purely visual — clickability lives on the
  // surrounding button.
  const chipImages = useMemo(() => {
    const allOverride = categories.find(
      (c) => c.id === ALL_OBJECTS_OVERRIDE_SLUG
    );
    const byId = new Map(categories.map((c) => [c.id, c]));
    const map = new Map<FilterId, { src: string; seed: string }>();
    CHIPS.forEach((c) => {
      if (c.id === "all") {
        map.set(c.id, {
          src: allOverride?.image || products[0]?.image || "",
          seed: "chip-all"
        });
      } else {
        const cat = byId.get(c.id);
        const first = products.find((p) => p.category === c.match);
        map.set(c.id, {
          src: cat?.image || first?.image || "",
          seed: `chip-${c.id}`
        });
      }
    });
    return map;
  }, [products, CHIPS, categories]);

  return (
    <>
      {/* Toolbar — non-sticky, sits between the hero and product grid.
          Top+bottom hairlines frame it as a defined horizontal band. */}
      <div className="border-t border-chalk/10 bg-ink">
        <div className="mx-auto max-w-editorial px-6 py-5 md:px-14 md:py-7">
          <div className="flex items-center gap-4 md:gap-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="hidden shrink-0 items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-chalk/85 transition-colors hover:text-chalk md:inline-flex"
              aria-label="Open filters"
            >
              <FilterIcon />
              Filters
              {activeDrawerCount > 0 && (
                <span className="text-chalk/60">({activeDrawerCount})</span>
              )}
            </button>

            {/* Category chip row — horizontal scroll on mobile, centered on desktop */}
            <div className="min-w-0 flex-1">
              <ul className="flex items-start gap-6 overflow-x-auto md:justify-center md:gap-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {CHIPS.map((c) => {
                  const img = chipImages.get(c.id);
                  const isActive = active === c.id;
                  return (
                    <li key={c.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setActive(c.id)}
                        aria-pressed={isActive}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div
                          className={clsx(
                            "relative h-14 w-14 overflow-hidden rounded-full border transition-colors md:h-16 md:w-16",
                            isActive
                              ? "border-chalk"
                              : "border-chalk/25 group-hover:border-chalk/60"
                          )}
                        >
                          {img && (
                            <SafeImage
                              src={img.src}
                              alt={c.label}
                              fallbackSeed={img.seed}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          )}
                          {!isActive && (
                            <span
                              className="absolute inset-0 bg-ink/40 transition-opacity group-hover:bg-ink/20"
                              aria-hidden
                            />
                          )}
                        </div>
                        <span
                          className={clsx(
                            "whitespace-nowrap text-[10px] uppercase tracking-[0.24em] transition-colors md:text-[11px]",
                            isActive
                              ? "text-chalk"
                              : "text-chalk/60 group-hover:text-chalk/85"
                          )}
                        >
                          {c.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Piece count — updates as the filter changes */}
            <p className="hidden shrink-0 text-[11px] uppercase tracking-[0.28em] text-chalk/60 md:block">
              {visible.length} {visible.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-chalk/10" />
      </div>

      {/* Product grid — animates when the filter changes */}
      <section className="relative bg-ink py-20 text-chalk md:py-28">
        <div className="mx-auto max-w-editorial px-6 md:px-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active}-${activeDrawerCount}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 md:gap-x-12 md:gap-y-28 lg:grid-cols-3 lg:gap-x-16"
            >
              {visible.map((product, i) => (
                <ProductCard key={product.handle} product={product} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {visible.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-[13px] uppercase tracking-[0.28em] text-chalk/50">
                No pieces match this selection.
              </p>
              {activeDrawerCount > 0 && (
                <button
                  type="button"
                  onClick={clearDrawerFilters}
                  className="mt-8 text-[11px] uppercase tracking-[0.28em] text-chalk underline underline-offset-[6px] decoration-chalk/50 transition-colors hover:decoration-chalk"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        materials={availableMaterials}
        selectedMaterials={selectedMaterials}
        toggleMaterial={toggleMaterial}
        selectedPrices={selectedPrices}
        togglePrice={togglePrice}
        onClear={clearDrawerFilters}
        resultCount={visible.length}
      />
    </>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.9,
        delay: (index % 3) * 0.08,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="group"
    >
      <Link href={productHref(product)} className="block text-center">
        <div className="relative mb-8 aspect-[4/5] w-full overflow-hidden bg-onyx">
          <SafeImage
            src={product.image}
            alt={product.name}
            fallbackSeed={product.handle}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-[1600ms] ease-silk group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] uppercase tracking-[0.32em] text-chalk/55">
            {product.category}
          </p>
          <h3 className="font-display text-[15px] font-semibold uppercase leading-[1.15] tracking-[0.005em] md:text-[16px]">
            {product.name}
          </h3>
          <p className="max-w-[36ch] text-[13px] leading-[1.6] text-chalk/70">
            {product.description}
          </p>
          <p className="mt-1 text-[13px] tracking-[0.02em] text-chalk/85">
            ₹ {product.price.inr.toLocaleString("en-IN")}
            <span className="text-chalk/50">*</span>
          </p>
          <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk underline underline-offset-[6px] decoration-chalk/50 transition-colors group-hover:decoration-chalk">
            View details
            <span aria-hidden>›</span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
