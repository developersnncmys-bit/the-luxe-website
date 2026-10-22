import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categorySlug, productRef } from "@/lib/content";
// `getRelatedProducts` was the hardcoded-catalog fallback; replaced by
// `fetchRelatedProducts` which queries the backend for same-category pieces.
// import { getRelatedProducts } from "@/lib/content";
import { fetchProduct, fetchRelatedProducts } from "@/lib/products-api";
import { ProductHero } from "@/components/product/product-hero";
import { ProductStickyBar } from "@/components/product/product-sticky-bar";
import { ProductInfo } from "@/components/product/product-info";
import { ProductQuote } from "@/components/product/product-quote";
import { ProductDetails } from "@/components/product/product-details";
import { ProductInspiration } from "@/components/product/product-inspiration";
// ProductDiscoverAlso — WIRED to the backend via fetchRelatedProducts.
// Hidden by its own `products.length === 0` guard when the category has
// no siblings.
import { ProductDiscoverAlso } from "@/components/product/product-discover-also";
// Hardcoded editorial / cta sections — DISABLED. Backend-only now via
// <BannerSections page="product" />. Uncomment the imports AND the JSX
// below together to restore any section.
//
// import { ProductCollection } from "@/components/product/product-collection";
// import { ProductServices } from "@/components/product/product-services";
// import { ProductBoutique } from "@/components/product/product-boutique";
import { ProductBreadcrumb } from "@/components/product/product-breadcrumb";
import { BannerSections } from "@/components/site/banner-sections";

type Params = { category: string; handle: string };

// Rendered on demand. We deliberately don't declare generateStaticParams
// here — the parent [category] segment already enumerates the categories,
// and adding a nested generator triggers a known Next 14 dev-mode webpack
// hiccup when descendant client components pull in framer-motion.

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await fetchProduct(params.handle);
  if (!product) return { title: "Not found — The Luxe Version" };
  return {
    title: `${product.name} — The Luxe Version`,
    description: product.description
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const product = await fetchProduct(params.handle);
  // Guard against slug mismatch (e.g., product moved category) — 404 rather
  // than silently rendering under the wrong category URL.
  if (!product || categorySlug(product.category) !== params.category) {
    notFound();
  }

  // Related pieces for the "Discover Also" rail — backend query for other
  // products in the same category, excluding the current piece, capped at 3.
  // Hardcoded `getRelatedProducts` fallback — DISABLED (see import above).
  const related = await fetchRelatedProducts(product, 3);
  const ref_ = productRef(product);

  return (
    <>
      <ProductStickyBar product={product} />
      <ProductHero product={product} ref_={ref_} />
      <ProductInfo product={product} />
      <ProductDetails product={product} />
      <ProductInspiration product={product} />
      <ProductQuote product={product} />
      <ProductDiscoverAlso products={related} />
      {/* <ProductCollection product={product} /> */}
      {/* <ProductServices /> */}
      {/* <ProductBoutique /> */}
      {/* Admin-authored banners for `page: 'product'` — shared across every
          product detail page (admin dropdown labels it "Product detail (all
          pieces)"). Common use: a CTA band like "See the piece in the studio". */}
      <BannerSections page="product" />
      <ProductBreadcrumb product={product} />
    </>
  );
}
