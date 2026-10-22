export type ProductDetail = {
  label: string;
  body: string;
  image: string;
};

// The "Inspiration" editorial block — a full-bleed in-situ shot followed by
// a numbered three-column rationale grid: the reasons the buyer would want
// to live with this piece. `image` falls back to lifestyleImage /
// product.image; `body` is an optional intro paragraph above the grid.
export type ProductInspirationReason = {
  label: string;
  body: string;
};
export type ProductInspiration = {
  eyebrow?: string;
  title: string;
  body?: string;
  reasons?: ProductInspirationReason[];
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type Product = {
  handle: string;
  name: string;
  // Category slug (matches a Category._id on the backend). Previously a
  // strict union of hardcoded labels; now any slug the backend returns is
  // valid so admin-authored categories flow through without a code change.
  category: string;
  // Edit tag slug (matches an EditTag._id on the backend). Used by the
  // /edit page to group products under each tag. Optional — not every
  // product belongs to an edit.
  editTag?: string;
  description: string;
  price: { inr: number; usd: number };
  image: string;
  aspect: "portrait" | "landscape" | "square";
  // Detail-page fields — optional so the type stays permissive; the product
  // detail page falls back gracefully when a field is missing.
  material?: string;
  gallery?: string[];
  body?: string;
  details?: ProductDetail[];
  pullQuote?: string;
  lifestyleImage?: string;
  inspiration?: ProductInspiration;
};

// URL slug for a product's category page. Accepts either a slug (already
// lowercase and hyphenated — just returns it) or a display label (title-case
// → slug). The backend now stores Product.category as a slug; hardcoded
// storefront data still uses display labels and both go through here.
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

// Canonical product URL. All product-card call sites should use this.
export function productHref(product: Product): string {
  return `/collections/${categorySlug(product.category)}/${product.handle}`;
}

// Reference number displayed on the detail page — derived from handle so we
// don't have to author a SKU per product.
export function productRef(product: Product): string {
  const hash = product.handle
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
  return `LV-${String(hash).slice(0, 6).padStart(6, "0")}`;
}

// Related pieces for the "Discover Also" rail: same category first, then
// other pieces from the house. Excludes the current product.
export function getRelatedProducts(current: Product, limit = 3): Product[] {
  const sameCategory = PRODUCTS.filter(
    (p) => p.category === current.category && p.handle !== current.handle
  );
  const rest = PRODUCTS.filter(
    (p) => p.category !== current.category && p.handle !== current.handle
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

// Every image path below is scoped to a category folder under public/images.
// Do not reference stock imagery (Pexels/Unsplash) or root-level images from
// this data — the folders are the single source of truth.
export const PRODUCTS: Product[] = [
  {
    handle: "chandelier-verre",
    name: "Chandelier — Verre",
    category: "Lighting",
    description:
      "A hand-blown glass chandelier in warm brass. Suspended presence for the dining table or a double-height entry.",
    price: { inr: 328000, usd: 4050 },
    image: "/images/lighting/light1.png",
    aspect: "portrait",
    material: "Hand-blown glass, unlacquered brass",
    body:
      "A chandelier of many small glass forms, each shaped by hand and suspended in warm, unlacquered brass. Scaled for the dining table or the double-height entry — a slow, held presence that reads as jewellery for the room. The brass is left raw; it warms and deepens with time, so the piece belongs more fully to the house each year.",
    gallery: [
      "/images/lighting/light1.png",
      "/images/lighting/light2.png",
      "/images/lighting/light3.png",
      "/images/lighting/light4.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Unlacquered brass frame with hand-blown clear glass leaves. Finished by hand; the brass warms with time. Weight: 12 kg. Overall drop: 90–140 cm, made to order.",
        image: "/images/materials/glass.png"
      },
      {
        label: "Craft",
        body:
          "Each leaf is shaped by a single glassblower in a small studio outside Firozabad. Assembly, wiring and finishing take four to six weeks per piece.",
        image: "/images/lighting/light6.png"
      }
    ],
    pullQuote:
      "One fixture that holds the whole room together — hung once, lived with for decades.",
    lifestyleImage: "/images/lighting/light4.png",
    inspiration: {
      title: "The piece the room is built around",
      reasons: [
        {
          label: "Craftsmanship",
          body:
            "Each glass leaf is shaped by a single glassblower in a small studio outside Firozabad. No two Verre chandeliers are identical."
        },
        {
          label: "Made to your ceiling",
          body:
            "Four to six weeks per piece. Drop, wiring and rose fitted to the exact height your room asks for."
        },
        {
          label: "Living surface",
          body:
            "The brass is unlacquered — it warms and darkens with every year in the house. Fixtures at this scale are typically inherited, not bought."
        }
      ]
    }
  },
  {
    handle: "table-lamp-alba",
    name: "Table Lamp — Alba",
    category: "Lighting",
    description:
      "A brass table lamp with an ivory linen shade. Warm enough to read by — for the side table or the console.",
    price: { inr: 68000, usd: 840 },
    image: "/images/lighting/light2.png",
    aspect: "portrait",
    material: "Turned brass, ivory linen shade",
    body:
      "A turned brass table lamp with a hand-sewn ivory linen shade. Warm enough to read by, quiet enough to leave on all evening. Sized for the side table, the console, the writing desk that wants a single warm light.",
    gallery: [
      "/images/lighting/light2.png",
      "/images/lighting/light3.png",
      "/images/lighting/light4.png",
      "/images/lighting/light5.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Solid turned brass base with a hand-sewn linen shade. E27 fitting, dimmable. 52 cm overall height, 30 cm shade diameter.",
        image: "/images/materials/metal.png"
      },
      {
        label: "Craft",
        body:
          "The base is turned and hand-finished in a small workshop. Each shade is cut, sewn and trimmed to order — no two identical.",
        image: "/images/lighting/light1.png"
      }
    ],
    pullQuote: "The lamp you leave on until the last of the guests have gone.",
    lifestyleImage: "/images/lighting/light5.png",
    inspiration: {
      title: "The lamp you stop replacing",
      reasons: [
        {
          label: "Solid brass",
          body:
            "Turned from solid stock — not plated, not lacquered. Nothing thin to chip; the finish gets better with age."
        },
        {
          label: "Shade to order",
          body:
            "Each linen shade is cut, sewn and trimmed by hand. Small variations are inherent — no two are identical."
        },
        {
          label: "Generational",
          body:
            "Buy this once at forty; hand it down at seventy. Replaces the whole cycle of disposable side-table lamps."
        }
      ]
    }
  },
  {
    handle: "sculpture-ardor",
    name: "Sculpture — Ardor",
    category: "Sculptures",
    description:
      "A rare sculpture captures strength and momentum. Its sweeping horns and grounded stance convey an unmistakable sense of power and resolve.",
    price: { inr: 96000, usd: 1180 },
    image: "/images/sculptures/Ardor/Ardor0.png",
    aspect: "portrait",
    material: "Metal, textured bronze finish",
    body:
      "Defined by its richly textured surface and sculptural weight, the piece captures the bull's muscularity with striking depth. Sweeping horns, a lowered stance and pronounced contours heighten its sense of movement, while the nuanced bronze finish accentuates the character of the piece.",
    gallery: [
      "/images/sculptures/Ardor/Ardor0.png",
      "/images/sculptures/Ardor/Ardor1.png",
       "/images/sculptures/Ardor/Ardor2.png",
      "/images/sculptures/Ardor/Ardor3.png",
      "/images/sculptures/Ardor/Ardor5.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Cast metal with a textured bronze finish. Weight: 1.49 kg / 3.3 lb.",
        image: "/images/materials/metal.png"
      },
      {
        label: "Craft",
        body:
          "Cast in metal and hand-finished in a textured bronze patina. The surface catches light differently at every angle; every casting bears its own tonal variations — no two Ardor read exactly the same way.",
        image: "/images/sculptures/Ardor/Ardor-craft.png"
      }
    ],
    pullQuote: "Momentum captured in bronze — a study in strength and resolve.",
    lifestyleImage: "/images/sculptures/Ardor/The-Ardor1.png",
    inspiration: {
      title: "Strength and momentum, held in bronze",
      reasons: [
        {
          label: "Muscularity in bronze",
          body:
            "The textured bronze captures the bull's musculature with striking depth. Sculptural weight rather than decoration — the piece reads as a study in animal form."
        },
        {
          label: "Movement, held still",
          body:
            "Sweeping horns and a lowered stance suggest a moment of gathered force. The sculpture is at rest, but never passive — the room reads it first."
        },
        {
          label: "Character in every contour",
          body:
            "Pronounced contours and the nuanced bronze finish give ARDOR its individual presence. No two castings catch the light the same way."
        }
      ]
    }
  },
  {
    handle: "pendant-lume",
    name: "Pendant — Lume",
    category: "Lighting",
    description:
      "A single-drop pendant in unlacquered brass. Reads as jewellery for the room — above a console, a bar, or a corner reading chair.",
    price: { inr: 84000, usd: 1040 },
    image: "/images/lighting/light3.png",
    aspect: "portrait",
    material: "Unlacquered brass, single drop",
    body:
      "A single-drop pendant in unlacquered brass — a small, held light that reads as jewellery for the room. Hung low over a console, a bar corner, or a reading chair. The brass is raw; it warms and darkens with time.",
    gallery: [
      "/images/lighting/light3.png",
      "/images/lighting/light4.png",
      "/images/lighting/light5.png",
      "/images/lighting/light6.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Unlacquered brass shade and stem. E14 fitting, 2m black fabric cord, brass ceiling rose.",
        image: "/images/materials/metal.png"
      },
      {
        label: "Craft",
        body:
          "Spun and hand-finished in the same brass workshop as the Verre chandelier. Made to order; drop height specified at purchase.",
        image: "/images/lighting/light2.png"
      }
    ],
    pullQuote: "Jewellery, hung.",
    lifestyleImage: "/images/lighting/light6.png",
    inspiration: {
      title: "The small piece with real provenance",
      reasons: [
        {
          label: "Same maker",
          body:
            "Spun and finished in the same brass workshop that shapes the Verre chandelier — same hands, same brass."
        },
        {
          label: "Cut to your drop",
          body:
            "Drop height set at purchase. No standard length; every Lume is fitted to a specific ceiling."
        },
        {
          label: "Ages upward",
          body:
            "Unlacquered brass warms into the walls over years. The finish improves rather than fades."
        }
      ]
    }
  },
  {
    handle: "sculpture-cadence",
    name: "Sculpture — Cadence",
    category: "Sculptures",
    description:
      "A study in rhythm, form and restraint. Sculpted in textured wood, CADENCE pairs a bowed silhouette with a deeply textured black finish, carrying a quiet yet commanding presence.",
    price: { inr: 128000, usd: 1580 },
    image: "/images/sculptures/Cadence/Cadence3.png",
    aspect: "portrait",
    material: "Textured wood, textured black finish",
    body:
      "Defined by its graphic equine silhouette, CADENCE balances the solidity of carved wood with the visual lightness of slender metal supports. The raised composition gives the sculpture an architectural quality, while the textured surface brings depth to its monochromatic form.",
    gallery: [
      "/images/sculptures/Cadence/Cadence3.png",
      "/images/sculptures/Cadence/Cadence1.png",
      "/images/sculptures/Cadence/Cadence2.png",
      "/images/sculptures/Cadence/Cadence5.png",
      "/images/sculptures/Cadence/Cadence4.png",
      "/images/sculptures/Cadence/Cadence6.png",
      "/images/sculptures/Cadence/Cadence7.png",
      "/images/sculptures/Cadence/Cadence8.png",
      "/images/sculptures/Cadence/Cadence9.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Textured wood with a textured black finish. Dimensions: 44 × 9 × 43 cm (17.3 × 3.5 × 16.9 in). Weight: 4.0 kg / 8.7 lb.",
        image: "/images/materials/wood.png"
      },
      {
        label: "Craft",
        body:
          "Hand-carved from solid wood, the equine silhouette shaped by successive cuts. The textured black finish is worked into the surface by hand — deepening the grain rather than covering it. Signed at the base.",
        image: "/images/sculptures/Cadence/cadence-craft.png"
      }
    ],
    pullQuote: "Rhythm and restraint, carved in wood.",
    lifestyleImage: "/images/sculptures/Cadence/candecehover.png",
    inspiration: {
      title: "A study in rhythm, form and restraint",
      reasons: [
        {
          label: "Carved by hand",
          body:
            "Shaped from solid wood by successive cuts. The textured black finish deepens the grain rather than covering it — each piece bears its own pattern of light."
        },
        {
          label: "Solidity meets lightness",
          body:
            "Substantial carved wood set on slender metal supports. The pairing lets the piece hold weight while reading as though it hovers."
        },
        {
          label: "Bowed, not bent",
          body:
            "The equine silhouette curves gently forward — a moment of restraint held still. Quiet in expression, commanding in presence."
        }
      ]
    }
  },
  {
    handle: "vase-auren",
    name: "Vase — Auren",
    category: "Vases",
    description:
      "A sculptural vase defined by sweeping vertical contours and a dramatic petal-like crown. AUREN is a study of scale and texture, with a quiet presence.",
    price: { inr: 74000, usd: 910 },
    image: "/images/vases/Auren/Vase-Auren1.png",
    aspect: "portrait",
    material: "Ceramic, textured grey glaze",
    body:
      "A substantial ceramic vase defined by its broad proportions and sculptural, foliage-inspired silhouette. Deep vertical ridges travel across the surface into curved, rising edges, giving AUREN a distinct architectural character.",
    gallery: [
      "/images/vases/Auren/Vase-Auren1.png",
      "/images/vases/Auren/Auren2.png",
      "/images/vases/Auren/Auren3.png",
      "/images/vases/Auren/Auren4.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Ceramic with a textured grey glaze. Dimensions: 27 × 27 × 40 cm (10.6 × 10.6 × 15.7 in). Weight: 3.78 kg / 8.33 lb.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "Thrown, glazed and fired in a small studio in Auroville. Each piece signed and dated at the foot.",
        image: "/images/vases/Auren/Auren-Craft.png"
      }
    ],
    pullQuote:
      "Sculpture that also holds — the honest, ancient trick of the vessel.",
    lifestyleImage: "/images/vases/Auren/Vase-auren-presence.png",
    inspiration: {
      title: "Part of a series of forty. Signed at the foot.",
      reasons: [
        {
          label: "Small batch",
          body:
            "Wheel-thrown in a small Auroville studio. Fired in batches of no more than forty pieces at a time."
        },
        {
          label: "Two objects in one",
          body:
            "Reads as sculpture on the shelf. Holds a dry branch when you want a vessel. Both roles included."
        },
        {
          label: "Signed by the maker",
          body:
            "Each piece signed and dated where the foot meets the wheel. Studio provenance, not stock ceramic."
        }
      ]
    }
  },
  {
    handle: "vase-rivage",
    name: "Vase — Rivage",
    category: "Vases",
    description:
      "A sculptural ceramic form where colour moves like an abstract landscape. Sweeps of mineral blue, ivory, charcoal and muted rust travel across its broad silhouette, giving the piece the presence of a painted canvas.",
    price: { inr: 82000, usd: 1010 },
    image: "/images/vases/Vase-rivage/Rivage1.png",
    aspect: "portrait",
    material: "Premium ceramic, hand-painted multitone finish",
    body:
      "RIVAGE transforms a vessel into an art object. Its generous proportions, tactile surface and expressive composition allow it to stand confidently on its own — commanding attention without excess.",
    gallery: [
      "/images/vases/Vase-rivage/Rivage1.png",
      "/images/vases/Vase-rivage/Rivage2.png",
      "/images/vases/Vase-rivage/Rivage3.png",
      "/images/vases/Vase-rivage/Rivage4.png"
      
    ],
    details: [
      {
        label: "Material",
        body:
          "Premium ceramic. Dimensions: 41 × 11 × 35 cm (16.1 × 4.3 × 13.8 in). Weight: 3.413 kg / 7.52 lb.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "Hand-painted and hand-textured with a coarse, tactile finish and expressive multitone brushwork. Each piece bears its own composition — no two Rivages are alike.",
        image: "/images/vases/Vase-rivage/Rivage-craft.png"
      }
    ],
    pullQuote: "Colour moves across the surface like an abstract landscape.",
    lifestyleImage: "/images/vases/Vase-rivage/Rivage-presence.png",
    inspiration: {
      title: "A vessel transformed into a canvas",
      reasons: [
        {
          label: "Mediterranean coast",
          body:
            "Inspired by the Mediterranean coast of Spain — deep blue waters, sun-washed stone and earthy shores. The palette isn't decorative; it's referential."
        },
        {
          label: "Hand-painted, hand-textured",
          body:
            "Every sweep of colour is applied by hand; the coarse surface texture is worked in during shaping. Each piece bears its own composition — no two Rivages are alike."
        },
        {
          label: "Vessel as art object",
          body:
            "Generous proportions and expressive brushwork let RIVAGE stand alone. It reads as a ceramic form first, a vase second — a canvas on a shelf, not a container."
        }
      ]
    }
  },
  {
    handle: "vase-onde",
    name: "Vase — Onde",
    category: "Vases",
    description:
      "An open porcelain form with a fluid, irregular silhouette. Misty grey markings move across its ivory surface, while fine gold lines trace the rim and descend through the body.",
    price: { inr: 72000, usd: 890 },
    image: "/images/vases/Onde/Onde-1.png",
    aspect: "portrait",
    material: "Porcelain, grey marbling with gold detailing",
    body:
      "Onde means \"wave\" in French. The piece evokes France's Atlantic shoreline: water moving over pale stone, with a trace of gold in the last light. The glossy interior catches light within each curve.",
    gallery: [
      "/images/vases/Onde/06.jpg",
      "/images/vases/Onde/Onde5.png",
      "/images/vases/Onde/Onde3.png",
      "/images/vases/Onde/Onde4.png",
      "/images/vases/Onde/Onde-2.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Porcelain with grey marbling, a smooth lacquered sheen and gold detailing. Dimensions: 52 × 29 × 26 cm (20.5 × 11.4 × 10.2 in). Weight: 3.841 kg / 8.47 lb.",
        image: "/images/materials/marble.png"
      },
      {
        label: "Craft",
        body:
          "The grey marbling is worked into the porcelain by hand — every piece bears its own pattern of drift. Fine gold lines are applied last, tracing the rim and descending through the body.",
        image: "/images/vases/Onde/Vase-onde-craft.png"
      }
    ],
    pullQuote:
      "Water moving over pale stone, with a trace of gold in the last light.",
    lifestyleImage: "/images/vases/Onde/Vase-onde-presence.png",
    inspiration: {
      title: "A wave, held in porcelain",
      reasons: [
        {
          label: "Different from every angle",
          body:
            "The shifting profile offers a distinct view from every side. From above, the opening reveals an entirely new composition — the piece keeps giving new readings."
        },
        {
          label: "Complete when empty",
          body:
            "ONDE has presence even when left unfilled — silhouette, marbling and gold detailing do the work. A vessel that reads as sculpture first, container second."
        },
        {
          label: "Atlantic reference",
          body:
            "Named for the French word for wave, the piece evokes France's Atlantic shoreline — water moving over pale stone, with a trace of gold in the last light."
        }
      ]
    }
  },
  {
    handle: "sculpture-Rein",
    name: "Sculpture — Rein",
    category: "Sculptures",
    description:
      "A lowered gaze and flowing mane give REIN its composed presence. Carved in wood, its sculpted contours carry a weathered grey finish with bronze-painted accents. A black pedestal lends the form an architectural stance.",
    price: { inr: 136000, usd: 1620 },
    image: "/images/sculptures/Rein/Rein1.png",
    aspect: "portrait",
    material: "Wood, Weathered grey with bronze-painted accents, mounted on a black base.",
    body:
      "The horse embodies strength guided by sensitivity. REIN captures that balance, bringing quiet authority to a console, study or collected interior.",
      
    gallery: [
      "/images/sculptures/Rein/Rein1.png",
      "/images/sculptures/Rein/Rein4.png",
      "/images/sculptures/Rein/Rein3.png",
      "/images/sculptures/Rein/Rein2.png",
      "/images/sculptures/Rein/Rein5.png",
      "/images/sculptures/Rein/Rein6.png"
      
    ],
    details: [
      {
        label: "Material",
        body:
          "Wood, Weathered grey with bronze-painted accents, mounted on a black base. Dimensions: 12.2 × 5.9 × 19.7 in (31 × 15 × 50 cm). Weight: 3.178 kg / 7.01 lb.",
        image: "/images/sculptures/Rein/Rein-decor.png"
      },
      {
        label: "Craft",
        body:
          "The flowing mane, layered painted finish and precise black base create a measured balance of movement and stillness.",
        image: "/images/sculptures/Rein/Rein-Craft.png"
      }
    ],
    pullQuote: "A STUDY IN STRENGTH, FORM AND TIME.",
    lifestyleImage: "/images/sculptures/Rein/Rein-presence.png",
    inspiration: {
      title: "A STUDY IN STRENGTH AND STILLNESS",
      reasons: [
        {
          label: "TIME-WORN CHARACTER",
          body:
            "Weathered grey tones and bronze-painted accents give REIN a distinctive aged character, allowing the surface to carry a sense of depth and history."
        },
        {
          label: "EQUESTRIAN FORM",
          body:
            "A sculpted horse head captures the strength and presence of the animal through its elongated form, defined features and expressive silhouette."
        },
        {
          label: "QUIETLY MONUMENTAL",
          body:
            "Mounted on a black base, REIN transforms a familiar equestrian form into a striking sculptural object with a strong architectural presence."
        }
      ]
    }
  },
  {
    handle: "sculpture-majeste",
    name: "Sculpture — Majesté",
    category: "Sculptures",
    description:
      "A study in quiet majesty. MAJESTÉ captures the profound stillness of the Buddha through a serene expression and intricately sculpted crown, while its time-worn patina lends the piece a sense of history, character and regal presence.",
    price: { inr: 148000, usd: 1820 },
    image: "/images/sculptures/Majeste/Budha1.png",
    aspect: "portrait",
    material: "Premium ceramic, textured aged patina finish",
    body:
      "Arched brows, elongated features and an intricately carved crown lend MAJESTÉ its distinctly regal character. A richly aged patina in warm earth, ivory and charcoal heightens its time-worn presence. Rising to 52 cm, its substantial scale and commanding form give the sculpture an almost monumental presence.",
    gallery: [
      "/images/sculptures/Majeste/Budha1.png",
      "/images/sculptures/Majeste/Budha2.png",
      "/images/sculptures/Majeste/Budha3.png",
      "/images/sculptures/Majeste/Budha4.png",
      "/images/sculptures/Majeste/Budha5.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Premium ceramic with a textured, aged patina finish. Dimensions: 28 × 27 × 52 cm (11 × 10.6 × 20.5 in). Weight: 4.235 kg / 9.34 lb.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "Hand-sculpted in ceramic, the crown and features shaped by hand. The aged patina is layered by hand — warm earth, ivory and charcoal — so each piece bears its own weathered character. No two Majesté age the same way.",
        image: "/images/sculptures/Majeste/majeste-craft.png"
      }
    ],
    pullQuote: "A study in quiet majesty.",
    lifestyleImage: "/images/sculptures/Majeste/Majeste.png",
    inspiration: {
      title: "A face carried by time",
      reasons: [
        {
          label: "Time-worn patina",
          body:
            "Warm earth, ivory and charcoal, worked into the surface by hand. The finish reads as history rather than decoration — the piece feels as though it was found, not made."
        },
        {
          label: "Regal features",
          body:
            "Arched brows, elongated eyes and an intricately sculpted crown. The face carries the profound stillness of the Buddha — quiet, but never small."
        },
        {
          label: "Monumental in presence",
          body:
            "Rising to 52 cm and weighing over four kilos, MAJESTÉ commands its space. Substantial scale in a single, held gesture."
        }
      ]
    }
  },
  {
    handle: "vase-Obre",
    name: "Vase — Obre",
    category: "Vases",
    description:
      "Defined by a continuous sweep of deep teal glass, Obre balances an elongated silhouette with a generous oval opening. Its substantial 1 cm thickness creates visual depth, while light traces the transition from the rising arch to the rounded body. A subtly lifted lip and clear glass base complete its architectural form.",
    price: { inr: 58000, usd: 720 },
    image: "/images/vases/Obre/Obre1.png",
    aspect: "portrait",
    material: "Polished Deep Teal Glass",
    body:
      "A study in fullness and space. Obre brings fluid movement to architectural settings, its open centre allowing the surroundings to become part of the composition. Perfect for a candlelit cocktail bar or lounge setting, where soft light accentuates its deep teal curves.",
    gallery: [
      "/images/vases/Obre/Obre1.png",
      "/images/vases/Obre/Obre2.png",
      "/images/vases/Obre/Obre3.png",
      "/images/vases/Obre/Obre4.png",
      "/images/vases/Obre/Obre5.png"
    ],
    details: [
      {
        label: "Material",
        body: "Polished deep teal glass with a clear glass base. Dimensions: 8.7 x 3.9 x 15.4 in ( 22 x 10 x 39 cm). Weight: 4.4445 Kg / 9.80 lb.",
        image: "/images/materials/glass.png"
      },
      {
        label: "Craft",
        body:
          "The interplay of substantial glass, fine elegance and flowing contours gives the piece a changing presence as light moves across it.",
        image: "/images/vases/Obre/Obre-craft.png"
      }
    ],
    pullQuote: "A QUIET STATEMENT — WHERE DEEP TEAL GLASS MEETS FLOWING FORM.",
    lifestyleImage: "/images/vases/Obre/Obre-presence.png",
    inspiration: {
      title: "EVERY CURVE HOLDS THE LIGHT",
      reasons: [
        {
          label: "CONTINUOUS FORM",
          body:
            "A single sweeping curve rises into an elongated arch before flowing into the rounded body, giving Obre its distinctive architectural presence."
        },
        {
          label: "DEEP TEAL GLASS",
          body:
            "Its substantial glass construction creates layers of depth within the deep teal surface, revealing changing tones and reflections as light moves across the form."
        },
        {
          label: "SPACE BECOMES PART OF THE FORM",
          body:
            "The generous oval opening gives Obre an airy quality, allowing its surroundings, light, and reflections to become part of the composition."
        }
      ]
    }
  },
  {
    handle: "vase-seve",
    name: "Vase — Sève",
    category: "Vases",
    description:
      "SÈVE expresses botanical grace through softened contours and an asymmetric silhouette. A finely veined gold leaf rests against its textured grey surface, creating a considered balance of warmth, depth and quiet presence.",
    price: { inr: 68000, usd: 840 },
    image: "/images/vases/Seve/Seve1.png",
    aspect: "portrait",
    material: "Premium ceramic, textured surface with gold leaf detailing",
    body:
      "Named after the French word for sap, SÈVE evokes the life within nature. Its solitary leaf becomes a focal point, bringing an intimate sense of artistry to a console, library or thoughtfully composed living space.",
    gallery: [
      "/images/vases/Seve/Seve1.png",
      "/images/vases/Seve/Seve2.png",
      "/images/vases/Seve/Seve3.png",
      "/images/vases/Seve/Seve4.png",
      "/images/vases/Seve/Seve5.png",
      "/images/vases/Seve/Seve6.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Premium ceramic in grey with a gold leaf motif. Dimensions: 21 × 14 × 34 cm (8.3 × 5.5 × 13.4 in). Weight: 1.368 kg / 3.02 lb.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "A textured grey surface is finished by hand, then detailed with a single finely veined gold leaf — applied individually, no two placements identical.",
        image: "/images/vases/Seve/Seve-craft.png"
      }
    ],
    pullQuote: "A solitary leaf — the quietest way to speak of nature.",
    lifestyleImage: "/images/vases/Seve/Seve-presence.png",
    inspiration: {
      title: "Named for the sap that moves inside a living thing",
      reasons: [
        {
          label: "Botanical grace",
          body:
            "Softened contours and an asymmetric silhouette draw from the shapes plants make when they are left to grow unchecked — never symmetrical, always balanced."
        },
        {
          label: "A single gold leaf",
          body:
            "One finely veined leaf, applied by hand against the textured grey. The piece needs no second gesture; the leaf alone carries it."
        },
        {
          label: "Intimate scale",
          body:
            "At 34 cm tall and 1.37 kg, SÈVE belongs on a console, library shelf or dining composition — close enough to be read, not so large it dominates."
        }
      ]
    }
  },
  {
    handle: "vase-fauve",
    name: "Vase — Fauve",
    category: "Vases",
    description:
      "Broad, rounded shoulders meet an elongated body in a sculptural study of form and proportion. A fine dull gold seam traces the textured grey surface, lending a quiet luminosity to its earthy character.",
    price: { inr: 72000, usd: 890 },
    image: "/images/vases/Fauve/Fauve1.png",
    aspect: "portrait",
    material: "Premium ceramic, textured grey with dull gold seam",
    body:
      "FAUVE finds beauty in irregularity — the subtle shifts of tone, the expressive surface, the line that draws the eye. Its composed presence brings depth and character to a thoughtfully curated setting.",
    gallery: [
      "/images/vases/Fauve/Fauve1.png",
      "/images/vases/Fauve/Fauve2.png",
      "/images/vases/Fauve/Fauve3.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Premium ceramic in grey with a dull gold seam. Dimensions: 19 × 11 × 38 cm (7.48 × 4.33 × 14.96 in). Weight: 2.276 kg / 5.02 lb.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "The textured surface is worked by hand before firing; the fine gold seam is applied individually, following the natural line of each piece.",
        image: "/images/vases/Fauve/Fauve-craft.png"
      }
    ],
    pullQuote: "Substantial form, restrained detail — the quiet finesse of a single line.",
    lifestyleImage: "/images/vases/Fauve/Fauve-presence.png",
    inspiration: {
      title: "Where generous silhouette meets a single, considered line",
      reasons: [
        {
          label: "A single gold seam",
          body:
            "A generous silhouette balanced by a delicate dull gold seam. The contrast between substantial form and restrained detailing gives the piece its quiet finesse."
        },
        {
          label: "Beauty in irregularity",
          body:
            "Subtle shifts of tone and an expressive, hand-worked surface mean no two FAUVE vases read identically. The irregularity is the point, not a flaw to correct."
        },
        {
          label: "Weight that holds the room",
          body:
            "At 38 cm tall and over two kilos, FAUVE anchors a console or library shelf. Substantial enough to hold its own; composed enough never to shout."
        }
      ]
    }
  },
  {
    handle: "charger-terra",
    name: "Charger — Terra",
    category: "Tabletop",
    description:
      "A wide stoneware charger in matte oxide. Sits under the dinner plate; reads as a low sculpture the rest of the day.",
    price: { inr: 32000, usd: 400 },
    image: "/images/table-top/table1.png",
    aspect: "portrait",
    material: "Stoneware, matte iron-oxide glaze",
    body:
      "A wide stoneware charger finished in matte iron-oxide glaze. Sits beneath the dinner plate at supper; reads as a low sculpture on the sideboard the rest of the day.",
    gallery: [
      "/images/table-top/table1.png",
      "/images/table-top/table2.png",
      "/images/table-top/table3.png",
      "/images/table-top/table4.png"
    ],
    details: [
      {
        label: "Material",
        body: "Stoneware clay, matte iron-oxide glaze. 32 cm diameter. Dishwasher-safe.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "Wheel-thrown and glazed in the same Auroville studio as the Vestige vessels. Signed at the foot.",
        image: "/images/table-top/table6.png"
      }
    ],
    pullQuote: "Under the plate at eight; low sculpture by ten.",
    lifestyleImage: "/images/table-top/table4.png",
    inspiration: {
      title: "China for people who don't own china",
      reasons: [
        {
          label: "Made to be used",
          body:
            "Dishwasher-safe stoneware. Meant to sit on the table, not in a cabinet behind glass."
        },
        {
          label: "Dual life",
          body:
            "Under the plate at supper. On the sideboard as low sculpture the rest of the day. Two roles, one piece."
        },
        {
          label: "Signed studio piece",
          body:
            "Wheel-thrown and signed at the foot. The provenance of a studio ceramic, at the price of dinnerware."
        }
      ]
    }
  },
  {
    handle: "carafe-verre",
    name: "Carafe — Verre",
    category: "Tabletop",
    description:
      "A hand-blown water carafe with a slightly gathered neck. For the dinner table, the desk, the bedside.",
    price: { inr: 28000, usd: 350 },
    image: "/images/table-top/table2.png",
    aspect: "portrait",
    material: "Hand-blown clear glass",
    body:
      "A hand-blown water carafe with a slightly gathered neck. For the dinner table, the writing desk, the bedside — the piece that makes even water feel considered.",
    gallery: [
      "/images/table-top/table2.png",
      "/images/table-top/table3.png",
      "/images/table-top/table4.png",
      "/images/table-top/table5.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Hand-blown clear glass, 1L capacity. Sold as a piece; a matching tumbler set is available separately.",
        image: "/images/materials/glass.png"
      },
      {
        label: "Craft",
        body:
          "Blown by the same glassblowers who shape the Verre chandelier. Small bubbles and slight asymmetries are inherent to the process.",
        image: "/images/table-top/table1.png"
      }
    ],
    pullQuote: "Even water, held with intent.",
    lifestyleImage: "/images/table-top/table5.png",
    inspiration: {
      title: "The everyday piece, from the same hands as the chandelier",
      reasons: [
        {
          label: "Same makers",
          body:
            "Blown by the same glassblowers who shape the Verre chandelier. Same studio, same lungs, same rods."
        },
        {
          label: "No duplicates",
          body:
            "Small bubbles and slight asymmetries are inherent to the process. No two carafes are identical."
        },
        {
          label: "A daily ritual",
          body:
            "Turns pouring water — an act you'll repeat thousands of times — into something worth doing well."
        }
      ]
    }
  },
  {
    handle: "runner-bruma",
    name: "Runner — Bruma",
    category: "Tabletop",
    description:
      "A long linen runner in undyed flax, hand-hemmed. Softens the wood, holds the plates, wears in with use.",
    price: { inr: 24000, usd: 300 },
    image: "/images/table-top/table3.png",
    aspect: "portrait",
    material: "Undyed European flax, hand-hemmed",
    body:
      "A long linen runner in undyed flax, hand-hemmed at both ends. Softens the wood, holds the plates, wears in with use — the older it gets, the better it looks.",
    gallery: [
      "/images/table-top/table3.png",
      "/images/table-top/table4.png",
      "/images/table-top/table5.png",
      "/images/table-top/table6.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "100% European flax, undyed. 240 × 45 cm. Machine-washable cold; line-dry.",
        image: "/images/materials/wood.png"
      },
      {
        label: "Craft",
        body:
          "Woven in a small Belgian mill and hand-hemmed. The flax softens and pales with each wash.",
        image: "/images/table-top/table2.png"
      }
    ],
    pullQuote: "Softens the wood, holds the plates, wears in like a favourite shirt.",
    lifestyleImage: "/images/table-top/table6.png",
    inspiration: {
      title: "Better after fifty washes than the day it arrived",
      reasons: [
        {
          label: "Undyed flax",
          body:
            "One hundred percent European flax. No dye to fade, no synthetics blended in for stretch."
        },
        {
          label: "Single mill",
          body:
            "Woven at one small Belgian mill and hand-hemmed at both ends. Traceable end to end."
        },
        {
          label: "Ages upward",
          body:
            "Most textiles cost more when new. This one is at its best after fifty washes. Rare in linen; rarer elsewhere."
        }
      ]
    }
  },
  {
    handle: "sconce-fumo",
    name: "Sconce — Fumo",
    category: "Lighting",
    description:
      "A brass wall sconce with a small hand-sewn linen shade. Warm to sit beside, quiet on the wall.",
    price: { inr: 46000, usd: 570 },
    image: "/images/lighting/light4.png",
    aspect: "portrait",
    material: "Turned brass, linen shade",
    body:
      "A brass wall sconce with a small hand-sewn linen shade. Hung on either side of a bed, a mantel, or a corridor — warm to sit beside, quiet on the wall."
  },
  {
    handle: "floor-lamp-colonne",
    name: "Floor Lamp — Colonne",
    category: "Lighting",
    description:
      "A tall column lamp in unlacquered brass. A single warm light for a reading corner or the edge of a sofa.",
    price: { inr: 118000, usd: 1450 },
    image: "/images/lighting/light5.png",
    aspect: "portrait",
    material: "Unlacquered brass, silk shade",
    body:
      "A slim brass column with a hand-sewn silk shade. Placed at the end of a sofa or beside a reading chair — one warm light, sized to last a lifetime."
  },
  {
    handle: "chandelier-prisme",
    name: "Chandelier — Prisme",
    category: "Lighting",
    description:
      "A faceted glass chandelier on a blackened bronze frame. For the low-ceilinged room that still wants presence.",
    price: { inr: 268000, usd: 3300 },
    image: "/images/lighting/light6.png",
    aspect: "portrait",
    material: "Cut glass, blackened bronze",
    body:
      "A compact chandelier of faceted glass panels on a blackened bronze frame. Sized for a lower ceiling — the dining nook, the entry, the small hall that still wants presence."
  },
  {
    handle: "sculpture-sillage",
    name: "Sculpture — Sillage",
    category: "Sculptures",
    description:
      "A carved metal sculpture captured in motion. SILLAGE is conceived for a mantel, lounge or formal living that calls for a defining line.",
    price: { inr: 174000, usd: 2150 },
    image: "/images/sculptures/Sillage/Sillage1.png",
    aspect: "portrait",
    material: "Metal, textured gold finish",
    body:
      "Monumental in scale, SILLAGE expresses an extravagance of form and gold, with a fluidity that seems to know no bounds. Its substantial metal construction gives the piece weight, solidity and commanding presence.",
    gallery: [
      "/images/sculptures/Sillage/Sillage1.png",
      "/images/sculptures/Sillage/Sillage2.png",
      "/images/sculptures/Sillage/Sillage3.png",
      "/images/sculptures/Sillage/Sillage4.png",
      "/images/sculptures/Sillage/Sillage5.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Metal with a textured gold finish. Dimensions: 36 × 25 × 54 cm (14.2 × 9.8 × 21.3 in). Weight: 3.2 kg / 7.1 lb.",
        image: "/images/materials/metal.png"
      },
      {
        label: "Craft",
        body:
          "Cast in metal and hand-finished in textured gold. Each surface is layered to catch light differently at every angle; the tactile character emerges only when the piece is placed in a room.",
        image: "/images/sculptures/Sillage/Sillage-Craft.png"
      }
    ],
    pullQuote:
      "An extravagance of form — a fluidity that seems to know no bounds.",
    lifestyleImage: "/images/sculptures/Sillage/Sillage-presence.png",
    inspiration: {
      title: "A defining line for the room",
      reasons: [
        {
          label: "Captured in motion",
          body:
            "The form is carved as though caught mid-gesture — fluid, extravagant, refusing to sit still. A sculpture that reads as movement even at rest."
        },
        {
          label: "Monumental in scale",
          body:
            "Rising to 54 cm and weighing over three kilos, SILLAGE holds a mantel, lounge or formal living room in its full presence. Weight and scale are the piece."
        },
        {
          label: "Textured gold, not polished",
          body:
            "The gold finish is textured, not smooth — every surface catches light at a different angle. Reads as sculpture in daylight, as jewellery at dusk."
        }
      ]
    }
  },
  {
    handle: "sculpture-vestige",
    name: "Sculpture — Vestige",
    category: "Sculptures",
    description:
      "Ancient in spirit. Monumental in presence. VESTIGE rises in carved wood, its Egyptian-inspired form shaped by geometry, instinct and time.",
    price: { inr: 112000, usd: 1380 },
    image: "/images/sculptures/Vestige/Vestige.png",
    aspect: "portrait",
    material: "Solid wood, distressed finish",
    body:
      "At over five feet, VESTIGE commands space without ornament. Deep incisions trace its elongated form, while the weathered surface reveals the natural character of solid wood. Primitive in expression, architectural in scale — an object with the presence of a discovered artefact.",
    gallery: [
      "/images/sculptures/Vestige/Vestige.png",
      "/images/sculptures/Vestige/Vestige3.jpg",
      "/images/sculptures/Vestige/vestige5.png",
      "/images/sculptures/Vestige/Vestige1.jpg",
      "/images/sculptures/Vestige/Vestige6.jpg"
    
    ],
    details: [
      {
        label: "Material",
        body:
          "Solid wood with a distressed finish. Height: 162.56 cm (64 inches). Weight: 14 kg / 30.9 lb.",
        image: "/images/materials/wood.png"
      },
      {
        label: "Craft",
        body:
          "Deep incisions trace the elongated form; each cut is worked by hand. The distressed finish preserves the natural character of the wood — grain, knots and the marks of shaping intact.",
        image: "/images/sculptures/Vestige/Vestige-Craft.png"
      }
    ],
    pullQuote: "Ancient in spirit. Monumental in presence.",
    lifestyleImage: "/images/sculptures/Vestige/Vestige-presence.png",
    inspiration: {
      title: "An object with the presence of a discovered artefact",
      reasons: [
        {
          label: "Egyptian in reference",
          body:
            "The form is drawn from ancient Egyptian sculpture — geometry, instinct and time worked into a single elongated line. The reference is ancient; the presence is monumental."
        },
        {
          label: "Architectural in scale",
          body:
            "At over five feet, VESTIGE commands the floor rather than the shelf. Freestanding, weighted, permanent — a piece that changes how a room reads from any angle."
        },
        {
          label: "Weathered, not finished",
          body:
            "The distressed surface reveals the natural character of solid wood — grain, incisions, the marks of shaping. Nothing polished away."
        }
      ]
    }
  },
  {
    handle: "object-enigme",
    name: "Object — Énigme",
    category: "Sculptures",
    description:
      "A study in abstraction and restraint. ÉNIGME reduces the human face to its most elemental lines, leaving expression deliberately unresolved.",
    price: { inr: 132000, usd: 1620 },
    image: "/images/sculptures/Engime/Engime1.png",
    aspect: "portrait",
    material: "Metal, textured pale gold and charcoal finish",
    body:
      "Two faces, two scales, two finishes — held together by a singular sculptural language. Their quiet ambiguity invites interpretation rather than defining it.",
    gallery: [
      "/images/sculptures/Engime/Engime1.png",
      "/images/sculptures/Engime/Engime2.png",
      "/images/sculptures/Engime/Engime3.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Metal with a textured pale gold and charcoal finish. Dimensions: 11 × 6 × 6 cm (4.3 × 2.4 × 2.4 in).",
        image: "/images/sculptures/Engime/engime-presence2.png"
      },
      {
        label: "Craft",
        body:
          "Cast in metal, the pairing juxtaposes pale gold with deep charcoal. Textured surfaces temper the metallic finish, while carved contours give each face its individual presence.",
        image: "/images/sculptures/Engime/Engime-craft.png"
      }
    ],
    pullQuote:
      "Two faces, one language — expression deliberately unresolved.",
    lifestyleImage: "/images/sculptures/Engime/Engime-presence.png",
    inspiration: {
      title: "Two faces, one sculptural language",
      reasons: [
        {
          label: "A study in pairs",
          body:
            "Two faces, two scales, two finishes — held together by a singular sculptural language. The composition invites interpretation rather than defining it."
        },
        {
          label: "Cast in contrast",
          body:
            "Pale gold set against deep charcoal. Textured surfaces temper the metallic finish, letting the pairing read as sculpture rather than object."
        },
        {
          label: "Reduced to essentials",
          body:
            "The human face pared back to its elemental lines. Expression is deliberately unresolved — the eye completes what the sculpture leaves open."
        }
      ]
    }
  },
  {
    handle: "sculpture-fougue",
    name: "Sculpture — Fougue",
    category: "Sculptures",
    description:
      "An abstract interpretation of the horse, defined by elongated lines, sculptural geometry and a commanding stance. The contrasting metallic mane brings a quiet flash of opulence to its otherwise restrained form.",
    price: { inr: 118000, usd: 1450 },
    image: "/images/sculptures/Fouge/Fouge-new1.png",
    aspect: "portrait",
    material: "Metal, aged patina with metallic mane",
    body:
      "FOUGUE embodies contained power — strong without heaviness, expressive without excess. Its poised silhouette and architectural proportions give it a striking presence from every angle.",
    gallery: [
      "/images/sculptures/Fouge/Fouge-new1.png",
      "/images/sculptures/Fouge/Fouge-new2.png",
      "/images/sculptures/Fouge/Fouge-new3.png",
      "/images/sculptures/Fouge/Fouge-new4.png",
      "/images/sculptures/Fouge/horse1.jpg",
      "/images/sculptures/Fouge/horse2.jpg"
    ],
    details: [
      {
        label: "Material",
        body:
          "Textured metal with a deep aged patina, contrasted by a muted metallic mane and set on a black base. Dimensions: 18 × 10 × 45 cm (7.1 × 3.9 × 17.7 in). Weight: 1.675 kg / 3.69 lb.",
        image: "/images/materials/metal.png"
      },
      {
        label: "Craft",
        body:
          "Tonal variations and an intentionally irregular surface texture lend depth and individual character to the piece. Each casting bears a slightly different pattern of light — no two Fougue read exactly the same way.",
        image: "/images/sculptures/Fouge/Fouge-craft.png"
      }
    ],
    pullQuote:
      "Contained power — strong without heaviness, expressive without excess.",
    lifestyleImage: "/images/sculptures/Fouge/Fouge-presence.png",
    inspiration: {
      title: "The horse, reduced to line and gesture",
      reasons: [
        {
          label: "Abstract in form",
          body:
            "Elongated lines and sculptural geometry — the horse expressed as a single held gesture rather than a literal figure. Contained power in an abstract silhouette."
        },
        {
          label: "A quiet flash of opulence",
          body:
            "The metallic mane sits against the aged patina like jewellery — restrained, but the piece asks for a second look because of it."
        },
        {
          label: "No two alike",
          body:
            "Tonal variations and an intentionally irregular surface finish mean every Fougue reads slightly differently under any light. Character is built into the casting."
        }
      ]
    }
  },
  {
    handle: "sculpture-linconnu",
    name: "Sculpture — L'Inconnu",
    category: "Sculptures",
    description:
      "A study of human instinct — what is concealed, what is sought, what is ultimately revealed. A fluid gesture veils the gaze, poised between shadow and awakening.",
    price: { inr: 168000, usd: 2060 },
    image: "/images/sculptures/Linconnu/L1.png",
    aspect: "portrait",
    material: "Textured metal with layered detailing, black marble base",
    body:
      "L'INCONNU explores the space between the visible and the unknown. Its raw, fragmented surface is interrupted by a fluid gesture across the gaze — creating a sculptural presence that feels both human and abstract.",
    gallery: [
      "/images/sculptures/Linconnu/L1.png",
      "/images/sculptures/Linconnu/L2.PNG",
      "/images/sculptures/Linconnu/L3.PNG",
      "/images/sculptures/Linconnu/L4.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Sculpted textured metal with layered metal detailing, mounted on a black marble base. Sculpture: 45 × 20 × 47 cm (17.7 × 8 × 18.5 in). Base: 32 × 16 × 3 cm (12.6 × 6.3 × 1.2 in). Weight: 13.8 kg / 30.4 lb.",
        image: "/images/materials/metal.png"
      },
      {
        label: "Craft",
        body:
          "Monumental in expression, L'Inconnu commands through elegance, texture and restraint — an enigmatic objet d'art conceived as a focal point. The metallic surfaces are layered by hand; every piece bears its own pattern of light.",
        image: "/images/sculptures/Linconnu/Linconnu-craft.png"
      }
    ],
    pullQuote:
      "As instinct yields to consciousness, light becomes revelation.",
    lifestyleImage: "/images/sculptures/Linconnu/Linconnu-presence.png",
    inspiration: {
      title: "The space between the visible and the unknown",
      reasons: [
        {
          label: "Human and abstract",
          body:
            "A raw, fragmented surface interrupted by a fluid gesture across the gaze. The piece reads as both figure and idea — recognisable, yet refusing to resolve."
        },
        {
          label: "Layered by hand",
          body:
            "Sculpted textured metal with layered detailing worked into the surface by hand. Every piece bears its own pattern of light — no two L'Inconnu look exactly alike."
        },
        {
          label: "Grounded on marble",
          body:
            "A black marble base — 32 × 16 × 3 cm — anchors nearly fourteen kilos of sculpted metal. Solidity beneath expression; the piece stays where you place it."
        }
      ]
    }
  },
  {
    handle: "sculpture-thalassa",
    name: "Sculpture — Thalassa",
    category: "Sculptures",
    description:
      "THALASSA reads like a jewel magnified into sculpture. Its clear, crystalline edge catches the light around a richly amber body, while dark striations travel into a sweeping, smoky crest. More than a foot across, the shell has impressive scale, yet its finely defined rim draws you in to look closer.",
    price: { inr: 148000, usd: 1820 },
    image: "/images/sculptures/Telassa/21.jpg",
    aspect: "landscape",
    material: "Mouth-blown, hand-shaped glass",
    body:
      "Named for the sea, THALASSA calls to mind the Amalfi Coast: the movement of water against sculpted cliffs, the warmth of late sunlight and the glint of light along the shore. Its open spiral holds that sense of movement in glass, revealing new depths of amber and smoke from every angle.",
    gallery: [
      "/images/sculptures/Telassa/21.jpg",
      "/images/sculptures/Telassa/22.jpg",
      "/images/sculptures/Telassa/23.jpg",
      "/images/sculptures/Telassa/24.jpg",
      "/images/sculptures/Telassa/25.jpg"
    ],
    details: [
      {
        label: "Material",
        body:
          "Mouth-blown, hand-shaped glass with a glossy, translucent amber and smoky grey body, a crystal-clear edge, dark striations and warm copper-toned flecks. Dimensions: 32 × 15 × 18 cm (12.6 × 5.9 × 7.1 in). Weight: 2.688 kg / 5.93 lb.",
        image: "/images/materials/glass.png"
      },
      {
        label: "Craft",
        body:
          "Selected for its generous scale, layered colour and exceptionally defined, jewel-like edge. Each piece is mouth-blown by hand — the spiral, the striations and the coppered flecks are the maker's decisions in the moment.",
        image: "/images/sculptures/Telassa/Telassa-craft.png"
      }
    ],
    pullQuote:
      "The sea, held in glass — sunlight along the shore.",
    lifestyleImage: "/images/sculptures/Telassa/Telassa-presence.png",
    inspiration: {
      title: "Selected for what a machine cannot make",
      reasons: [
        {
          label: "Jewel-like edge",
          body:
            "The exceptionally defined, crystal-clear rim is where THALASSA earns its selection — a hand-shaped edge, not a moulded one."
        },
        {
          label: "Amalfi light",
          body:
            "Named for the sea, evoking the Amalfi Coast: sunlight through amber, dark striations like water against cliff."
        },
        {
          label: "Mouth-blown, one hand",
          body:
            "Every piece is mouth-blown and hand-shaped — the layered colour and coppered flecks belong to that one moment."
        }
      ]
    }
  },
  {
    handle: "sculpture-altesse",
    name: "Sculpture — Altesse",
    category: "Sculptures",
    description:
      "ALTESSE captures the regal presence of an eagle in a magnificent study of scale and proportion. Its transparent wing rises like an architectural gesture, giving the silhouette striking movement. Free-flowing, seemingly unstoppable curves carry ivory, black, amber and touches of brown through the glass. The finesse lies in its watchful eye, defined beak and talons, and the changing light within the form.",
    price: { inr: 158000, usd: 1940 },
    image: "/images/sculptures/Altesse/Altesse1.png",
    aspect: "portrait",
    material: "Glass",
    body:
      "Its scale makes it a focal point, yet its transparency allows the room to breathe. From a distance, the silhouette commands attention; up close, the layers of colour invite discovery.",
    gallery: [
      "/images/sculptures/Altesse/Altesse1.png",
      "/images/sculptures/Altesse/Altesse5.png",
      "/images/sculptures/Altesse/Altesse7.png",
      "/images/sculptures/Altesse/Altesse2.png",
      "/images/sculptures/Altesse/Altesse3.png",
      "/images/sculptures/Altesse/Altesse4.png",
      "/images/sculptures/Altesse/Altesse6.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Transparent glass with black, ivory and brown detailing, and amber accents. Dimensions: 27 × 22 × 42 cm (10.6 × 8.7 × 16.5 in). Weight: 4.223 kg / 9.31 lb.",
        image: "/images/materials/glass.png"
      },
      {
        label: "Craft",
        body:
          "Selected for its architectural scale, balanced proportions and fluid layers of colour. The watchful eye, defined beak and talons are worked by hand — the finesse of the piece lives in those small marks against the sweep of the wing.",
        image: "/images/sculptures/Altesse/Altesse-carft.png"
      }
    ],
    pullQuote:
      "A silhouette from across the room; layers of colour from close up.",
    lifestyleImage: "/images/sculptures/Altesse/Altesse-presence.png",
    inspiration: {
      title: "Architecture in glass, watched over by an eye",
      reasons: [
        {
          label: "Architectural scale",
          body:
            "Forty-two centimetres tall — a focal point at real architectural scale, yet the transparency keeps the room breathing around it."
        },
        {
          label: "Balanced proportions",
          body:
            "The wing rises as one uninterrupted gesture; the body holds the counterweight. Balance is the whole reason the piece stands as it does."
        },
        {
          label: "Fluid layers of colour",
          body:
            "Ivory, black, amber and brown are carried through the glass in free-flowing bands — layers that reveal themselves only as the light changes."
        }
      ]
    }
  },
  {
    // Dimensions are estimated — confirm against finished piece before publishing.
    handle: "vase-elio",
    name: "Vase — Elio",
    category: "Vases",
    description:
      "Named for its association with Helios, the Greek sun god, ELIO evokes light and warmth. A serene facial profile emerges from this sculptural vase, its elongated form complemented by a white marble-effect finish with flowing grey veins — a poetic expression of presence and stillness.",
    price: { inr: 74000, usd: 910 },
    image: "/images/vases/Elios/Elio1.png",
    aspect: "portrait",
    material: "Ceramic and glass, white marble-effect finish with grey veining",
    body:
      "ELIO invites contemplation through a face only partly revealed. Its architectural proportions create a distinctive focal point, bringing quiet strength and individuality to a thoughtfully composed space.",
    gallery: [
      "/images/vases/Elios/Elio1.png",
      "/images/vases/Elios/Elio2.png",
      "/images/vases/Elios/Elio3.png",
      "/images/vases/Elios/Elio4.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Ceramic and glass with a white marble-effect finish and flowing grey veins. Dimensions: 18 × 14 × 45 cm (7.1 × 5.5 × 17.7 in). Weight: 2.83 kg / 6.24 lb.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "The sculpted facial profile is modelled by hand; the marble veining is drawn across the surface individually, so the pattern of each piece is its own.",
        image: "/images/vases/Elios/Elios-craft.png"
      }
    ],
    pullQuote: "A face only partly revealed — the rest, held in stillness.",
    lifestyleImage: "/images/vases/Elios/Elio-presence.png",
    inspiration: {
      title: "Named for Helios — light and warmth, held in form",
      reasons: [
        {
          label: "A face, only partly revealed",
          body:
            "The profile emerges from the vessel rather than sitting on it. Half-sculpture, half-vase — the piece asks the room to look twice."
        },
        {
          label: "Marble-effect finish",
          body:
            "A white marble-effect surface with hand-drawn grey veining. The pattern of each piece is its own; no two ELIOs read identically."
        },
        {
          label: "Architectural proportions",
          body:
            "At 45 cm tall and under 3 kg, ELIO rises as a distinctive focal point — tall enough to command a console, quiet enough to let the room breathe around it."
        }
      ]
    }
  },
  {
    handle: "vessel-argile",
    name: "Vessel — Argile",
    category: "Vases",
    description:
      "A hand-pinched terracotta vessel, unglazed. The clay reads warm and matte — a shelf object first, a vase second.",
    price: { inr: 44000, usd: 540 },
    image: "/images/vases/vase5.png",
    aspect: "portrait",
    material: "Hand-pinched terracotta, unglazed",
    body:
      "A hand-pinched terracotta vessel, left unglazed so the clay reads directly. A shelf object first, a vase second — the shape carries even when empty."
  },
  {
    handle: "vase-sable",
    name: "Vase — Sable",
    category: "Vases",
    description:
      "A tall glass vase in a soft sand tint. Reads sculptural in daylight, holds a single tall stem beautifully.",
    price: { inr: 78000, usd: 960 },
    image: "/images/vases/vase6.png",
    aspect: "portrait",
    material: "Hand-blown tinted glass",
    body:
      "A tall glass vase, hand-blown with a soft sand tint pulled through the wall. Reads sculptural in daylight; holds a single tall stem — a branch, a lily — beautifully."
  },
  {
    handle: "vase-obra",
    name: "Vase — Obra",
    category: "Vases",
    description:
      "A tall bronze-glazed vessel with a narrow throat. Reads sculptural empty; holds a single stem beautifully.",
    price: { inr: 96000, usd: 1180 },
    image: "/images/vases/vase3.png",
    aspect: "portrait",
    material: "Stoneware, bronze glaze",
    body:
      "A tall bronze-glazed vessel with a narrow throat. Reads sculptural when empty; holds a single stem — a branch, a long tulip — beautifully.",
    gallery: [
      "/images/vases/vase3.png",
      "/images/vases/vase4.png",
      "/images/vases/vase5.png",
      "/images/vases/vase6.png"
    ],
    details: [
      {
        label: "Material",
        body:
          "Stoneware body, layered bronze glaze fired to cone 10. 46 cm tall, 6 cm mouth.",
        image: "/images/materials/ceramic.png"
      },
      {
        label: "Craft",
        body:
          "Thrown and glazed by hand. Bronze fluctuates in the kiln — no two vessels take the light identically.",
        image: "/images/vases/vase2.png"
      }
    ],
    pullQuote: "One stem, held. The rest of the room composes itself.",
    lifestyleImage: "/images/vases/vase6.png",
    inspiration: {
      title: "The kiln decides how each one looks",
      reasons: [
        {
          label: "Unpredictable glaze",
          body:
            "Bronze glaze at cone 10 is unstable by nature. The potter loads the piece; the kiln decides the finish."
        },
        {
          label: "No duplicates",
          body:
            "No two vessels reflect light the same way. There is no way to order a matching pair."
        },
        {
          label: "Two objects in one",
          body:
            "Holds a single tall stem beautifully. Empty, it is a sculpture. Neither role requires the other."
        }
      ]
    }
  },
  {
    handle: "salt-cellar-sel",
    name: "Salt Cellar — Sel",
    category: "Tabletop",
    description:
      "A small pinch-pot in matte white porcelain. For the dinner table, for the kitchen counter, for close at hand.",
    price: { inr: 12000, usd: 150 },
    image: "/images/table-top/table4.png",
    aspect: "portrait",
    material: "Hand-thrown porcelain, matte glaze",
    body:
      "A small hand-thrown porcelain pinch-pot for salt. Left on the table between meals; kept beside the stove the rest of the time — the small vessel the kitchen keeps returning to."
  },
  {
    handle: "pitcher-cara",
    name: "Pitcher — Cara",
    category: "Tabletop",
    description:
      "A stoneware pitcher in matte cream. Wide-mouthed for water, milk, a bough of herbs in warmer months.",
    price: { inr: 26000, usd: 320 },
    image: "/images/table-top/table5.png",
    aspect: "portrait",
    material: "Wheel-thrown stoneware, matte cream glaze",
    body:
      "A wide-mouthed stoneware pitcher, wheel-thrown and finished in a soft matte cream glaze. Water at supper, milk at breakfast, a small bough of herbs the rest of the time."
  },
  {
    handle: "board-planche",
    name: "Board — Planche",
    category: "Tabletop",
    description:
      "A long walnut serving board, hand-oiled. For bread, cheese, the long lunch that runs into afternoon.",
    price: { inr: 22000, usd: 270 },
    image: "/images/table-top/table6.png",
    aspect: "portrait",
    material: "Solid walnut, hand-oiled",
    body:
      "A long walnut serving board finished with a slow, hand-rubbed oil. For bread and cheese, for the long lunch that runs into the afternoon; the wood deepens with each use."
  }
];

// Editorial curation layer — reorderable seasonal picks. A given category can
// appear in more than one edit; the edit page rotates through products in
// that category so each edit shows a different piece.
export type EditSelection = {
  slug: string;
  number: string;
  title: string;
  intro: string;
  categories: Product["category"][];
};

export const EDITS: EditSelection[] = [
  {
    slug: "statement",
    number: "01",
    title: "Statement pieces",
    intro:
      "The pieces that command a room — a chandelier, a mirror, a sculpted form scaled to be seen.",
    categories: ["Lighting", "Sculptures"]
  },
  {
    slug: "new",
    number: "02",
    title: "New pieces",
    intro:
      "This season's new work — recent arrivals from the studio floor.",
    categories: ["Lighting", "Sculptures", "Vases"]
  },
  {
    slug: "limited",
    number: "03",
    title: "Limited pieces",
    intro:
      "Small editions and one-of-one commissions — signed, numbered, brief.",
    categories: ["Lighting", "Sculptures"]
  },
  {
    slug: "designer",
    number: "04",
    title: "Designer pieces",
    intro:
      "Signature works from the studio — the pieces the house is known for.",
    categories: ["Sculptures", "Lighting"]
  }
];

// In-house, made-to-order pieces — not part of the regular catalogue. Each
// is produced on request, with a quoted lead time. Shown on /exclusive as a
// slow, full-bleed procession rather than a grid.
export type ExclusivePiece = {
  slug: string;
  number: string;
  name: string;
  discipline: string;
  intro: string;
  body: string;
  material: string;
  dimensions: string;
  leadTime: string;
  edition: string;
  image: string;
};

export const EXCLUSIVE_PIECES: ExclusivePiece[] = [
  {
    slug: "monolithe",
    number: "I",
    name: "Monolithe",
    discipline: "Floor sculpture",
    intro: "A single carved form, standing.",
    body:
      "Hand-shaped at the studio and finished in a slow, matte patina. Monolithe is sized to anchor a room — a quiet, upright presence meant to be lived with rather than looked at.",
    material: "Burnished bronze, hand-patinated",
    dimensions: "H 1420 · W 320 · D 280 mm",
    leadTime: "14 – 18 weeks",
    edition: "Made to order · signed",
    image: "/images/sculptures/scu3.png"
  },
  {
    slug: "halo",
    number: "II",
    name: "Halo",
    discipline: "Suspended lighting",
    intro: "A ring of brass, suspended in air.",
    body:
      "A single machined ring, polished and then softly brushed by hand. Halo throws a warm, downward wash — a quiet circle of light above a table, a bed, a stair.",
    material: "Solid brass, hand-brushed",
    dimensions: "Ø 1100 · D 60 mm",
    leadTime: "10 – 12 weeks",
    edition: "Made to order · numbered",
    image: "/images/lighting/light2.png"
  },
  {
    slug: "veille",
    number: "III",
    name: "Veille",
    discipline: "Tabletop vessel",
    intro: "A vessel the shape of a long evening.",
    body:
      "Thrown in a single pour and finished in a soft, chalk-white glaze. Veille is intended for the table — flowers, dried branches, or nothing at all.",
    material: "Stoneware, chalk glaze",
    dimensions: "H 480 · Ø 220 mm",
    leadTime: "8 – 10 weeks",
    edition: "Made to order · signed",
    image: "/images/vases/vase2.png"
  },
  {
    slug: "silence",
    number: "IV",
    name: "Silence",
    discipline: "Wall relief",
    intro: "A low relief, carved in a single pass.",
    body:
      "A hand-carved panel in cast plaster, finished to a soft matte. Silence hangs flush to the wall and shifts entirely with the hour of the day — read it in morning light, then again at dusk.",
    material: "Cast plaster, hand-finished",
    dimensions: "H 900 · W 1200 · D 45 mm",
    leadTime: "12 – 16 weeks",
    edition: "Made to order · one of one",
    image: "/images/sculptures/scu6.png"
  }
];

export const JOURNAL_ENTRIES = [
  {
    slug: "AT THE CERAMIC STUDIO",
    kicker: "Guide",
    title: "AT THE CERAMIC STUDIO",
    excerpt:
      "A sculptural vessel shaped by layered colour and movement — Rivage brings a hand-painted character to quiet, considered interiors.",
    image: "/images/vases/Vase-rivage/Rivage-Studio.png"
  },
  {
    slug: "ON THE SCULPTURAL PLINTH",
    kicker: "Guide",
    title: "ON THE SCULPTURAL PLINTH",
    excerpt:
      "A study in contrast and balance — ÉNIGME pairs textured pale gold with charcoal to create an object of quiet visual tension.",
    image: "/images/sculptures/Engime/Engime-Studio.png"
  },
  {
    slug: "IN THE AMBIENT LIGHT",
    kicker: "Studio",
    title: "IN THE AMBIENT LIGHT",
    excerpt:
      "Defined by a fluid silhouette and deep teal glass, OBRE turns a simple vessel into a striking sculptural presence.",
    image: "/images/vases/Obre/Obre-studio.png"
  },
  {
    slug: "IN THE QUIET CORNER",
    kicker: "Guide",
    title: "IN THE QUIET CORNER",
    excerpt:
      "Carved from solid wood and marked by a distressed finish, VESTIGE carries the character of an object shaped by time",
    image: "/images/sculptures/Vestige/Vestige.png"
  },
  {
    slug: "a-house-in-the-hills",
    kicker: "Interior",
    title: "A house in the hills",
    excerpt:
      "The Verre chandelier at rest — a long lens on the room that first commissioned it.",
    image: "/images/lighting/light2.png"
  },
  {
    slug: "on-the-dining-chandelier",
    kicker: "Guide",
    title: "On the dining chandelier",
    excerpt:
      "Choosing a chandelier for the dining table — length, drop height, and the light it should give at eight.",
    image: "/images/lighting/light3.png"
  },
  {
    slug: "the-case-for-unlacquered-brass",
    kicker: "Craft",
    title: "The case for unlacquered brass",
    excerpt:
      "On the finish that ages with the room instead of resisting it — and why we choose it every time.",
    image: "/images/table-top/table1.png"
  },
  {
    slug: "the-making-of-the-sillon",
    kicker: "Object",
    title: "The making of the Sillon",
    excerpt:
      "From clay maquette to cast bronze — the year-long path of a single sculpted seat.",
    image: "/images/sculptures/scu3.png"
  },
  {
    slug: "in-the-workshop-with-louis",
    kicker: "Conversation",
    title: "In the workshop with Louis",
    excerpt:
      "A morning with the glassblower who shapes every leaf of the Verre chandelier by hand.",
    image: "/images/vases/vase2.png"
  }
];
