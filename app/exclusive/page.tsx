import type { Metadata } from "next";
import { fetchExclusivePieces } from "@/lib/exclusive-api";
import { ExclusiveHero } from "@/components/exclusive/exclusive-hero";
import { ExclusiveIntro } from "@/components/exclusive/exclusive-intro";
import { ExclusiveFeatured } from "@/components/exclusive/exclusive-featured";
import { ExclusivePiece } from "@/components/exclusive/exclusive-piece";
import { ExclusiveClosing } from "@/components/exclusive/exclusive-closing";

export const metadata: Metadata = {
  title: "Luxe Exclusive — The Luxe Version",
  description:
    "A small line of in-house pieces, made to order and finished by hand at the studio."
};

export default async function ExclusivePage() {
  const pieces = await fetchExclusivePieces();
  const [featured, ...rest] = pieces;

  return (
    <>
      <ExclusiveHero />
      <ExclusiveIntro />
      {/* Featured hero — centered image + specs + Add to Bag. Shown
          immediately after the intro note; drops cleanly to no-op if the
          exclusive list is empty. */}
      {featured && <ExclusiveFeatured piece={featured} />}
      {/* Remaining pieces continue in the alternating side-by-side layout
          below. Numbering stays stable because ExclusivePiece reads
          `piece.number` from the data (not from its iteration index). */}
      {rest.map((piece, i) => (
        <ExclusivePiece key={piece.slug} piece={piece} index={i} />
      ))}
      <ExclusiveClosing />
    </>
  );
}
