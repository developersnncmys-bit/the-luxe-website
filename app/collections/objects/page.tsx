import type { Metadata } from "next";
import { fetchCategories } from "@/lib/categories-api";
import { fetchProducts } from "@/lib/products-api";
import { CategoryHero } from "@/components/collections/category/category-hero";
import { ObjectsCatalog } from "@/components/collections/objects/objects-catalog";

export const metadata: Metadata = {
  title: "Objects — The Luxe Version",
  description:
    "Sculptures, vases and tabletop — the objects that finish a room."
};

export default async function ObjectsPage() {
  // Backend-driven. Categories feed the chip row; products feed the grid.
  // Lighting lives on its own page, so we drop it from both lists here.
  const [categories, allProducts] = await Promise.all([
    fetchCategories(),
    fetchProducts()
  ]);

  const objectCategories = categories.filter((c) => c.id !== "lighting");
  const objects = allProducts.filter((p) => p.category !== "Lighting");

  // The reserved `all-objects` category drives the chip override on this
  // page (and the nav entry). Its `heroImage` field — set from the admin's
  // Categories tab — flows into this page's hero banner. Falls back to the
  // bundled asset if the admin hasn't uploaded one yet.
  const allObjects = categories.find((c) => c.id === "all-objects");
  const heroImage =
    allObjects?.heroImage || "/images/product-banners/allobjects-banner.png";
  const heroAlt =
    allObjects?.name || "An arrangement of objects — a curated composition";

  return (
    <>
      <CategoryHero
        kicker="The Collection"
        title="Objects"
        description="Sculptural and quiet — the objects that finish a room. Sculptures in hand-carved wood and cast bronze, vessels wheel-thrown in stoneware and glass, and tabletop pieces for the dining table. Each conceived as a composition, sized to be lived with."
        image={heroImage}
        imageAlt={heroAlt}
      />
      <ObjectsCatalog products={objects} categories={objectCategories} />
    </>
  );
}
