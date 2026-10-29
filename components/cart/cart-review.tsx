"use client";

import Link from "next/link";
import { useMemo } from "react";
import clsx from "clsx";
import { SafeImage } from "@/components/ui/safe-image";
import { useStore, type WrappingOption } from "@/components/store/store-provider";
import { productHref } from "@/lib/content";
import { CheckoutChrome } from "./checkout-chrome";

// Full-page shopping bag — the Chanel-style review that appears when a visitor
// clicks "Review Bag & Checkout" from the drawer. Light theme (white bg, dark
// text) to differentiate it visually from the storefront's dark palette.

const WRAPPING: Array<{
  id: WrappingOption;
  title: string;
  body: string;
  image: string;
}> = [
  {
    id: "essential",
    title: "THE ESSENTIAL",
    body: "A 100% cotton pouch nestled in a recyclable shipping box.",
    image: "/images/wrapping/essential.png"
  },
  {
    id: "classic",
    title: "THE CLASSIC",
    body: "Presented in a timeless black-and-white box.",
    image: "/images/wrapping/classic.png"
  }
];

export function CartReview() {
  const {
    cart,
    cartSubtotal,
    productByHandle,
    removeFromCart,
    updateCartQty,
    toggleWishlist,
    cartExtras,
    setCartExtras
  } = useStore();

  const isEmpty = cart.length === 0;

  // Indian GST — pieces are MRP-inclusive. Back-calculate the tax component
  // so we can display "GST included" without changing the final total.
  const gst = useMemo(
    () => Math.round(cartSubtotal - cartSubtotal / 1.18),
    [cartSubtotal]
  );

  return (
    <div className="min-h-svh bg-chalk pt-16 text-ink md:pt-32">
      <CheckoutChrome />

      {isEmpty ? (
        <EmptyBag />
      ) : (
        <main className="mx-auto max-w-6xl px-6 pb-32 pt-10 md:px-12 md:pt-16">
          <header className="text-center">
            <h1 className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold uppercase tracking-[0.02em]">
              Shopping Bag
            </h1>
            <p className="mx-auto mt-8 max-w-md text-[13px] leading-[1.8] text-ink/70">
              Need assistance?
              <br />
              Our advisors can assist you by email or phone,
              <br />
              from Monday to Sunday, 10 a.m. — 8 p.m.
            </p>
          </header>

          <section className="mt-16 border-t border-ink/10">
            {cart.map((item) => {
              const product = productByHandle(item.handle);
              if (!product) return null;
              return (
                <article
                  key={item.handle}
                  className="grid grid-cols-[88px_1fr_auto] items-start gap-6 border-b border-ink/10 py-8 md:grid-cols-[112px_1fr_auto_auto] md:gap-10"
                >
                  <Link
                    href={productHref(product)}
                    className="relative h-28 w-20 overflow-hidden bg-ink/5 md:h-36 md:w-28"
                  >
                    <SafeImage
                      src={product.image}
                      alt=""
                      fallbackSeed={`${product.handle}-bag`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={productHref(product)}
                      className="text-[13px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
                    >
                      {product.name}
                    </Link>
                    {product.material && (
                      <p className="mt-2 text-[12px] leading-[1.6] text-ink/70">
                        {product.material}
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[11px] uppercase tracking-[0.22em] text-ink/60">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQty(item.handle, item.qty + 1)
                        }
                        className="underline underline-offset-[6px] decoration-ink/30 transition-colors hover:text-ink hover:decoration-ink"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.handle)}
                        className="underline underline-offset-[6px] decoration-ink/30 transition-colors hover:text-ink hover:decoration-ink"
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleWishlist(item.handle);
                          removeFromCart(item.handle);
                        }}
                        className="underline underline-offset-[6px] decoration-ink/30 transition-colors hover:text-ink hover:decoration-ink"
                      >
                        Move to Wishlist
                      </button>
                    </div>
                  </div>

                  <div className="col-start-2 flex items-center gap-3 text-[12px] uppercase tracking-[0.18em] text-ink/70 md:col-start-3 md:self-center">
                    <span>Qty</span>
                    <select
                      value={item.qty}
                      onChange={(e) =>
                        updateCartQty(item.handle, Number(e.target.value))
                      }
                      aria-label={`Quantity for ${product.name}`}
                      className="border-b border-ink/30 bg-transparent px-2 py-1 pr-6 text-[12px] text-ink focus:outline-none"
                    >
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="col-start-3 self-center text-right text-[14px] tracking-[0.02em] md:col-start-4">
                    ₹ {(product.price.inr * item.qty).toLocaleString("en-IN")}
                    .00
                  </p>
                </article>
              );
            })}
          </section>

          {/* Totals block */}
          <section className="mt-10 bg-ink/[0.03] px-6 py-8 md:px-10 md:py-10">
            <SummaryRow label="Subtotal" value={formatRupees(cartSubtotal)} />
            <SummaryRow label="GST included" value={formatRupees(gst)} />
            <SummaryRow label="Delivery" value="Complimentary" muted />
            <div className="mt-6 border-t border-ink/15 pt-6">
              <SummaryRow
                label="Total"
                value={formatRupees(cartSubtotal)}
                strong
              />
            </div>
          </section>

          {/* Wrapping */}
          <Section title="Wrapping options">
            <div className="mt-8 space-y-5">
              {WRAPPING.map((opt) => (
                <label
                  key={opt.id}
                  className={clsx(
                    "flex cursor-pointer items-start gap-5 border border-ink/15 px-5 py-5 transition-colors md:gap-6 md:px-7 md:py-6",
                    cartExtras.wrapping === opt.id
                      ? "border-ink"
                      : "hover:border-ink/40"
                  )}
                >
                  <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink/40">
                    {cartExtras.wrapping === opt.id && (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    )}
                  </span>
                  <input
                    type="radio"
                    name="wrapping"
                    value={opt.id}
                    checked={cartExtras.wrapping === opt.id}
                    onChange={() => setCartExtras({ wrapping: opt.id })}
                    className="sr-only"
                  />
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-ink/5 md:h-24 md:w-24">
                    <SafeImage
                      src={opt.image}
                      alt=""
                      fallbackSeed={`wrap-${opt.id}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em]">
                      {opt.title}
                    </p>
                    <p className="mt-2 text-[12px] leading-[1.65] text-ink/70">
                      {opt.body}
                    </p>
                  </div>
                  <span className="shrink-0 self-center text-[10px] uppercase tracking-[0.24em] text-ink/60">
                    Complimentary
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Gift message */}
          <Section title="Gift message">
            <p className="mt-4 text-[13px] leading-[1.7] text-ink/70">
              Add a personal touch with a complimentary gift message.
            </p>
            <div className="mt-6 space-y-4">
              <RadioRow
                label="Do not include a card"
                checked={cartExtras.giftMessage === ""}
                onChange={() => setCartExtras({ giftMessage: "" })}
              />
              <RadioRow
                label="Write a gift message"
                checked={cartExtras.giftMessage !== ""}
                onChange={() =>
                  setCartExtras({
                    giftMessage: cartExtras.giftMessage || " "
                  })
                }
              />
              {cartExtras.giftMessage !== "" && (
                <textarea
                  value={cartExtras.giftMessage.trimStart() || ""}
                  onChange={(e) =>
                    setCartExtras({ giftMessage: e.target.value })
                  }
                  rows={4}
                  maxLength={240}
                  placeholder="Your message…"
                  className="mt-2 w-full resize-none border border-ink/20 bg-transparent px-4 py-3 text-[13px] leading-[1.7] placeholder:text-ink/40 focus:border-ink focus:outline-none"
                />
              )}
            </div>
          </Section>

          <div className="mt-16 flex justify-center">
            <Link
              href="/checkout"
              className="w-full max-w-md bg-ink py-5 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-chalk transition-opacity hover:opacity-90"
            >
              Continue to checkout
            </Link>
          </div>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.24em] text-ink/50">
            *MRP inclusive of all taxes.
          </p>
        </main>
      )}
    </div>
  );
}

function EmptyBag() {
  return (
    <main className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-ink/55">
        Your shopping bag is empty
      </p>
      <p className="mt-6 max-w-[32ch] text-[14px] leading-[1.7] text-ink/70">
        Pieces you add to your bag will be held here while you continue to
        browse.
      </p>
      <Link
        href="/collections/objects"
        className="mt-10 text-[11px] uppercase tracking-[0.3em] text-ink underline underline-offset-[6px] decoration-ink/40 transition-colors hover:decoration-ink"
      >
        Browse the collection
      </Link>
    </main>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <h2 className="border-b border-ink/15 pb-5 text-[12px] font-semibold uppercase tracking-[0.26em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  muted
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex items-baseline justify-between py-2",
        strong ? "text-[16px] font-semibold uppercase tracking-[0.18em]" : "text-[13px]",
        muted && "text-ink/70"
      )}
    >
      <span className={strong ? "" : "uppercase tracking-[0.18em] text-ink/80"}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function RadioRow({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[13px]">
      <span
        className={clsx(
          "flex h-4 w-4 items-center justify-center rounded-full border",
          checked ? "border-ink" : "border-ink/40"
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span>{label}</span>
    </label>
  );
}

function formatRupees(value: number) {
  return `₹ ${value.toLocaleString("en-IN")}.00`;
}
