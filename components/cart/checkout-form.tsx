"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { SafeImage } from "@/components/ui/safe-image";
import { useStore } from "@/components/store/store-provider";
import { CheckoutChrome } from "./checkout-chrome";

type ContactShipping = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

type Delivery = "standard" | "express";

const COD_FEE = 100;

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  title: string;
  subtitle: string;
  note?: string;
}> = [
  {
    id: "upi",
    title: "UPI",
    subtitle: "GPay, PhonePe, Paytm, BHIM"
  },
  {
    id: "card",
    title: "Credit / Debit card",
    subtitle: "Visa, Mastercard, RuPay, Amex"
  },
  {
    id: "netbanking",
    title: "Net banking",
    subtitle: "All major Indian banks"
  },
  {
    id: "cod",
    title: "Cash on delivery",
    subtitle: "Pay the courier at hand-over",
    note: `+ ₹${COD_FEE} handling fee`
  }
];

const EMPTY_CONTACT: ContactShipping = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal: "",
  country: "India"
};

const REQUIRED_CONTACT: Array<keyof ContactShipping> = [
  "email",
  "firstName",
  "lastName",
  "line1",
  "city",
  "state",
  "postal",
  "country"
];

const DELIVERY_OPTIONS: Array<{
  id: Delivery;
  title: string;
  body: string;
  price: string;
}> = [
  {
    id: "standard",
    title: "Standard delivery",
    body: "Complimentary. Hand-delivered in 5–7 working days.",
    price: "Complimentary"
  },
  {
    id: "express",
    title: "Express delivery",
    body: "White-glove, 2–3 working days. Signed hand-over.",
    price: "₹ 2,400"
  }
];

export function CheckoutForm() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    productByHandle,
    cartExtras,
    user,
    addresses,
    addAddress,
    clearCart,
    signIn,
    signUp,
    signOut,
    placeOrder
  } = useStore();

  // Guest-mode is per-visit, not persisted — if a visitor returns later we
  // want them to be prompted to sign in again rather than silently continuing
  // as a guest from last time.
  const [guestMode, setGuestMode] = useState(false);
  const canCheckout = Boolean(user) || guestMode;

  const [contact, setContact] = useState<ContactShipping>(() => ({
    ...EMPTY_CONTACT,
    email: user?.email ?? "",
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? ""
  }));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // Saved-address picker: null = "use a new address" (manual input). If the
  // signed-in visitor has saved addresses we default to the first one so the
  // form arrives pre-filled; guests never see the picker at all.
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => (user && addresses.length > 0 ? addresses[0].id : null)
  );
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [addressSaveNotice, setAddressSaveNotice] = useState("");

  // When a saved address is picked, mirror its fields into `contact` so the
  // rest of the submit path doesn't need to know whether the data came from
  // the picker or the manual form.
  useEffect(() => {
    if (!selectedAddressId) return;
    const addr = addresses.find((a) => a.id === selectedAddressId);
    if (!addr) return;
    const [first, ...rest] = addr.name.split(" ");
    setContact((prev) => ({
      ...prev,
      firstName: first ?? prev.firstName,
      lastName: rest.join(" ") || prev.lastName,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      postal: addr.postal,
      country: addr.country,
      phone: addr.phone ?? prev.phone
    }));
  }, [selectedAddressId, addresses]);

  // Guard: no items → bounce back to the bag. The empty-state copy there is
  // kinder than an empty checkout form.
  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/cart");
    }
  }, [cart.length, router]);

  const deliveryCost = delivery === "express" ? 2400 : 0;
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const total = cartSubtotal + deliveryCost + codFee;
  const gst = useMemo(() => Math.round(total - total / 1.18), [total]);

  const updateContact = (patch: Partial<ContactShipping>) =>
    setContact((prev) => ({ ...prev, ...patch }));

  // Save the currently-filled address to the account book immediately,
  // without placing an order. Lets a signed-in visitor collect more than
  // one address during checkout — the saved-address picker above the
  // manual form updates as each one lands. Address fields only; email is
  // a contact-level concern and left untouched.
  const handleSaveAddress = () => {
    const addressKeys: Array<keyof ContactShipping> = [
      "firstName",
      "lastName",
      "line1",
      "city",
      "state",
      "postal",
      "country"
    ];
    const missing = addressKeys.filter((k) => !contact[k].trim());
    if (missing.length > 0) {
      setAttempted(true);
      setAddressSaveNotice("");
      return;
    }
    addAddress({
      name: `${contact.firstName} ${contact.lastName}`.trim(),
      line1: contact.line1,
      line2: contact.line2 || undefined,
      city: contact.city,
      state: contact.state,
      postal: contact.postal,
      country: contact.country,
      phone: contact.phone || undefined
    });
    // Clear the address fields so the user can enter another; keep
    // email/phone paths untouched. Flip back to "Use a new address" mode
    // in case the picker was previously pointed at a saved row.
    setContact((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal: "",
      country: ""
    }));
    setSelectedAddressId(null);
    setSaveNewAddress(false);
    setAddressSaveNotice("Address saved. You can enter another below.");
  };

  const invalidFields = useMemo(() => {
    const missing: string[] = [];
    REQUIRED_CONTACT.forEach((k) => {
      if (!contact[k].trim()) missing.push(`contact.${k}`);
    });
    return new Set(missing);
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (invalidFields.size > 0) {
      // Scroll to first invalid field by querying the DOM — simple and avoids
      // threading refs through every input.
      const first = document.querySelector<HTMLElement>("[data-invalid='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    const draft = {
      items: cart.map((item) => {
        const p = productByHandle(item.handle);
        return {
          handle: item.handle,
          name: p?.name ?? item.handle,
          image: p?.image,
          qty: item.qty,
          unitPrice: p?.price.inr ?? 0,
          lineTotal: (p?.price.inr ?? 0) * item.qty
        };
      }),
      extras: cartExtras,
      delivery: {
        method: delivery,
        cost: deliveryCost
      },
      payment: {
        method: paymentMethod,
        fee: codFee
      },
      contact: {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone
      },
      shipping: {
        line1: contact.line1,
        line2: contact.line2,
        city: contact.city,
        state: contact.state,
        postal: contact.postal,
        country: contact.country
      },
      subtotal: cartSubtotal,
      total,
      gst
    };

    // placeOrder returns the stored order (with id, placedAt, status) and
    // pushes it to the orders list. We stash the id in sessionStorage so the
    // confirmation page knows which order was just placed — the order itself
    // is read live from the store, so cancel/status updates reflect instantly.
    try {
      const order = await placeOrder(draft);
      try {
        sessionStorage.setItem("tlv:last-order-id", order.id);
      } catch {
        // Quota errors are harmless — confirmation page falls back on redirect.
      }

      // If the visitor filled a new address and ticked "save this address", add
      // it to their account book for next time. Only possible when signed in.
      if (user && !selectedAddressId && saveNewAddress) {
        addAddress({
          name: `${contact.firstName} ${contact.lastName}`.trim(),
          line1: contact.line1,
          line2: contact.line2 || undefined,
          city: contact.city,
          state: contact.state,
          postal: contact.postal,
          country: contact.country,
          phone: contact.phone || undefined
        });
      }

      clearCart();
      router.push("/checkout/confirmation");
    } catch (err) {
      setSubmitting(false);
      // Surface the backend message if present (e.g. unavailable items).
      // Falls back to a scroll-to-top so the (yet-to-be-added) toast would show.
      alert(err instanceof Error ? err.message : "Could not place the order. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-svh bg-chalk pt-16 text-ink md:pt-32">
        <CheckoutChrome />
      </div>
    );
  }

  if (!canCheckout) {
    return (
      <div className="min-h-svh bg-chalk pt-16 text-ink md:pt-32">
        <CheckoutChrome />
        <CheckoutLoginGate
          onGuest={() => setGuestMode(true)}
          onSignIn={signIn}
          onSignUp={signUp}
          onSignOut={signOut}
        />
      </div>
    );
  }

  const invalid = (key: string) => attempted && invalidFields.has(key);

  return (
    <div className="min-h-svh bg-chalk pt-16 text-ink md:pt-32">
      <CheckoutChrome />

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-10 md:grid-cols-[1fr_380px] md:gap-16 md:px-12 md:pt-16"
      >
        <div>
          <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold uppercase tracking-[0.03em]">
            Checkout
          </h1>

          <Section title="Contact">
            <Field
              label="Email"
              type="email"
              value={contact.email}
              onChange={(v) => updateContact({ email: v })}
              invalid={invalid("contact.email")}
            />
          </Section>

          <Section title="Shipping address">
            {/* Saved-address picker — only when signed in with at least one
                address in the book. Guests go straight to the manual form. */}
            {user && addresses.length > 0 && (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={clsx(
                      "flex cursor-pointer items-start gap-4 border px-5 py-4 transition-colors",
                      selectedAddressId === addr.id
                        ? "border-ink"
                        : "border-ink/15 hover:border-ink/40"
                    )}
                  >
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink/40">
                      {selectedAddressId === addr.id && (
                        <span className="h-2 w-2 rounded-full bg-ink" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name="saved-address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="sr-only"
                    />
                    <div className="min-w-0 flex-1 text-[13px] leading-[1.65]">
                      <p className="font-semibold uppercase tracking-[0.14em]">
                        {addr.name}
                      </p>
                      <p className="mt-1 text-ink/70">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}
                        <br />
                        {addr.city}, {addr.state} {addr.postal}
                        <br />
                        {addr.country}
                        {addr.phone && (
                          <>
                            <br />
                            {addr.phone}
                          </>
                        )}
                      </p>
                    </div>
                  </label>
                ))}

                <label
                  className={clsx(
                    "flex cursor-pointer items-center gap-4 border px-5 py-4 transition-colors",
                    selectedAddressId === null
                      ? "border-ink"
                      : "border-ink/15 hover:border-ink/40"
                  )}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink/40">
                    {selectedAddressId === null && (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    )}
                  </span>
                  <input
                    type="radio"
                    name="saved-address"
                    checked={selectedAddressId === null}
                    onChange={() => setSelectedAddressId(null)}
                    className="sr-only"
                  />
                  <span className="text-[13px] font-semibold uppercase tracking-[0.14em]">
                    Use a new address
                  </span>
                </label>
              </div>
            )}

            {/* Manual address form — hidden when a saved address is selected.
                For guests, this is the only input path. */}
            {selectedAddressId === null && (
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="First name"
                    value={contact.firstName}
                    onChange={(v) => updateContact({ firstName: v })}
                    invalid={invalid("contact.firstName")}
                  />
                  <Field
                    label="Last name"
                    value={contact.lastName}
                    onChange={(v) => updateContact({ lastName: v })}
                    invalid={invalid("contact.lastName")}
                  />
                </div>
                <Field
                  label="Address line 1"
                  value={contact.line1}
                  onChange={(v) => updateContact({ line1: v })}
                  invalid={invalid("contact.line1")}
                />
                <Field
                  label="Address line 2 (optional)"
                  value={contact.line2}
                  onChange={(v) => updateContact({ line2: v })}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="City"
                    value={contact.city}
                    onChange={(v) => updateContact({ city: v })}
                    invalid={invalid("contact.city")}
                  />
                  <Field
                    label="State / Region"
                    value={contact.state}
                    onChange={(v) => updateContact({ state: v })}
                    invalid={invalid("contact.state")}
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Postal code"
                    value={contact.postal}
                    onChange={(v) => updateContact({ postal: v })}
                    invalid={invalid("contact.postal")}
                  />
                  <Field
                    label="Country"
                    value={contact.country}
                    onChange={(v) => updateContact({ country: v })}
                    invalid={invalid("contact.country")}
                  />
                </div>
                <Field
                  label="Phone (optional)"
                  type="tel"
                  value={contact.phone}
                  onChange={(v) => updateContact({ phone: v })}
                />

                {/* Save-to-account options — only for signed-in visitors.
                    The checkbox saves on order submit; the button saves
                    immediately and clears the form so the visitor can
                    collect multiple addresses in one checkout. */}
                {user && (
                  <div className="space-y-3 pt-2">
                    <label className="flex cursor-pointer items-center gap-3 text-[12px] text-ink/80">
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="h-4 w-4 accent-ink"
                      />
                      <span>Save this address to my account</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        className="inline-flex items-center justify-center border border-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink transition-colors duration-500 ease-silk hover:bg-ink hover:text-chalk"
                      >
                        + Save & add another
                      </button>
                      {addressSaveNotice && (
                        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/70">
                          {addressSaveNotice}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>

          <Section title="Delivery">
            <div className="mt-6 space-y-4">
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={clsx(
                    "flex cursor-pointer items-start gap-5 border px-5 py-5 transition-colors md:px-7",
                    delivery === opt.id
                      ? "border-ink"
                      : "border-ink/15 hover:border-ink/40"
                  )}
                >
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink/40">
                    {delivery === opt.id && (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    )}
                  </span>
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === opt.id}
                    onChange={() => setDelivery(opt.id)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em]">
                      {opt.title}
                    </p>
                    <p className="mt-2 text-[12px] leading-[1.65] text-ink/70">
                      {opt.body}
                    </p>
                  </div>
                  <span className="shrink-0 self-center text-[11px] uppercase tracking-[0.22em] text-ink/70">
                    {opt.price}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Payment">
            <p className="mt-3 text-[12px] leading-[1.65] text-ink/60">
              256-bit SSL. You'll be redirected to our secure payment partner
              after you place the order.
            </p>
            <div className="mt-6 space-y-4">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={clsx(
                    "flex cursor-pointer items-center gap-5 border px-5 py-5 transition-colors md:px-7",
                    paymentMethod === method.id
                      ? "border-ink"
                      : "border-ink/15 hover:border-ink/40"
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/70">
                    <PaymentIcon method={method.id} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em]">
                      {method.title}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-[1.55] text-ink/60">
                      {method.subtitle}
                    </p>
                    {method.note && (
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-ink/55">
                        {method.note}
                      </p>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink/40">
                    {paymentMethod === method.id && (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    )}
                  </span>
                </label>
              ))}
            </div>

            {/* "We accept" badge strip — matches the Tridhavarnam reference. */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/55">
                We accept
              </p>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "Amex", "RuPay", "UPI", "COD"].map((label) => (
                  <span
                    key={label}
                    className="border border-ink/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-ink/70"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Sticky order summary — right column on desktop, stacked below on mobile */}
        <aside className="md:sticky md:top-10 md:self-start">
          <div className="bg-ink/[0.03] px-6 py-8 md:px-8 md:py-10">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.26em]">
              Order summary
            </h2>

            <ul className="mt-6 space-y-5 border-b border-ink/15 pb-6">
              {cart.map((item) => {
                const product = productByHandle(item.handle);
                if (!product) return null;
                return (
                  <li
                    key={item.handle}
                    className="flex gap-4 text-[12px] leading-[1.55]"
                  >
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-ink/5">
                      <SafeImage
                        src={product.image}
                        alt=""
                        fallbackSeed={`${product.handle}-summary`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold uppercase tracking-[0.14em]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-ink/60">Qty {item.qty}</p>
                    </div>
                    <p className="shrink-0 self-start tracking-[0.02em]">
                      ₹{" "}
                      {(product.price.inr * item.qty).toLocaleString("en-IN")}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-6 space-y-2 text-[13px]">
              <SummaryLine
                label="Subtotal"
                value={`₹ ${cartSubtotal.toLocaleString("en-IN")}.00`}
              />
              <SummaryLine
                label="Delivery"
                value={
                  deliveryCost === 0
                    ? "Complimentary"
                    : `₹ ${deliveryCost.toLocaleString("en-IN")}.00`
                }
              />
              {codFee > 0 && (
                <SummaryLine
                  label="COD handling"
                  value={`₹ ${codFee.toLocaleString("en-IN")}.00`}
                />
              )}
              <SummaryLine
                label="GST included"
                value={`₹ ${gst.toLocaleString("en-IN")}.00`}
              />
            </dl>

            <div className="mt-6 border-t border-ink/15 pt-6">
              <SummaryLine
                label="Total"
                value={`₹ ${total.toLocaleString("en-IN")}.00`}
                strong
              />
            </div>

            {cartExtras.wrapping && (
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-ink/60">
                Wrapping · {cartExtras.wrapping === "classic" ? "The Classic" : "The Essential"}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full bg-ink py-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-chalk transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>

            <Link
              href="/cart"
              className="mt-5 block w-full py-2 text-center text-[11px] uppercase tracking-[0.26em] text-ink/70 underline underline-offset-[6px] decoration-ink/30 transition-colors hover:text-ink"
            >
              Return to bag
            </Link>
          </div>
        </aside>
      </form>
    </div>
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
    <section className="mt-12">
      <h2 className="border-b border-ink/15 pb-5 text-[12px] font-semibold uppercase tracking-[0.26em]">
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  invalid,
  placeholder,
  inputMode
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  invalid?: boolean;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.22em] text-ink/70">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        data-invalid={invalid ? "true" : undefined}
        className={clsx(
          "mt-2 w-full border-b bg-transparent py-2 text-[14px] text-ink placeholder:text-ink/30 focus:outline-none",
          invalid
            ? "border-red-500 focus:border-red-700"
            : "border-ink/25 focus:border-ink"
        )}
      />
    </label>
  );
}

function SummaryLine({
  label,
  value,
  strong
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex items-baseline justify-between",
        strong && "text-[15px] font-semibold uppercase tracking-[0.18em]"
      )}
    >
      <dt className={strong ? "" : "uppercase tracking-[0.18em] text-ink/70"}>
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function CheckoutLoginGate({
  onGuest,
  onSignIn,
  onSignUp,
  onSignOut
}: {
  onGuest: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name?: string) => Promise<void>;
  onSignOut: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        await onSignUp(trimmed, password, name.trim() || undefined);
        // Backend register auto-issues a session; clear it so the user is
        // not silently signed in, then drop them on the Sign In tab with
        // their email prefilled so they can log in and continue checkout.
        onSignOut();
        setMode("signin");
        setPassword("");
        setName("");
        setNotice("Account created. Please sign in to continue.");
      } else {
        await onSignIn(trimmed, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-6 pb-32 pt-10 md:px-12 md:pt-16">
      <header className="text-center">
        <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold uppercase tracking-[0.03em]">
          Sign in to continue
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[13px] leading-[1.75] text-ink/70">
          Sign in to your account to complete your purchase, or continue as a
          guest.
        </p>
      </header>

      <div className="mt-10 border-b border-ink/15 pb-5">
        <div className="flex justify-center gap-10">
          <GateTab active={mode === "signin"} onClick={() => { setMode("signin"); setError(""); }}>
            Sign In
          </GateTab>
          <GateTab active={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>
            Create Account
          </GateTab>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {mode === "register" && (
          <GateField
            label="Name"
            type="text"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
        )}
        <GateField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <GatePasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
        />

        {mode === "signin" && (
          <button
            type="button"
            className="text-[11px] uppercase tracking-[0.24em] text-ink/60 underline underline-offset-[6px] decoration-ink/30 transition-colors hover:text-ink"
          >
            Forgot password?
          </button>
        )}

        {error && (
          <p className="text-[12px] uppercase tracking-[0.22em] text-red-600">
            {error}
          </p>
        )}

        {notice && !error && (
          <p className="text-[12px] uppercase tracking-[0.22em] text-ink/70">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink py-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-chalk transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting
            ? mode === "signin"
              ? "Signing in…"
              : "Creating account…"
            : mode === "signin"
              ? "Sign in"
              : "Create account & continue"}
        </button>
      </form>

      <div className="my-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-ink/50">
        <span aria-hidden className="h-px flex-1 bg-ink/15" />
        <span>Or</span>
        <span aria-hidden className="h-px flex-1 bg-ink/15" />
      </div>

      <button
        type="button"
        onClick={onGuest}
        className="w-full border border-ink/30 py-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-chalk"
      >
        Continue as guest
      </button>

      <p className="mt-10 text-center text-[11px] leading-[1.7] text-ink/55">
        Your details will be used for this purchase only. Create an account
        above to save addresses and track future orders.
      </p>
    </main>
  );
}

function GateTab({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "relative pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] transition-colors",
        active ? "text-ink" : "text-ink/50 hover:text-ink/80"
      )}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-[6px] left-0 right-0 h-px bg-ink"
        />
      )}
    </button>
  );
}

function GateField({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-ink/60">
        {label}
        {required && <span className="ml-1 text-ink/40">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full border-b border-ink/25 bg-transparent py-2 text-[14px] text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-none"
      />
    </label>
  );
}

// Password input for the checkout gate (light background), with a
// show/hide toggle. Mirrors GateField styling and keeps autocomplete
// hints so password managers keep working.
function GatePasswordField({
  label,
  value,
  onChange,
  autoComplete,
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-ink/60">
        {label}
        {required && <span className="ml-1 text-ink/40">*</span>}
      </span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          className="w-full border-b border-ink/25 bg-transparent py-2 pr-10 text-[14px] text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-ink/55 transition-colors hover:text-ink"
        >
          {visible ? (
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 3l14 14" />
              <path d="M8.2 5.1A9 9 0 0 1 10 5c5.5 0 8.5 5 8.5 5a14.5 14.5 0 0 1-2.6 3.2" />
              <path d="M6.1 6.6C3.5 8.1 1.5 10 1.5 10S4.5 15 10 15c1.3 0 2.4-.3 3.4-.7" />
              <path d="M8.4 8.4a2.5 2.5 0 0 0 3.3 3.3" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10Z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}

function PaymentIcon({ method }: { method: PaymentMethod }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true
  };
  switch (method) {
    case "upi":
      // Chevrons — nods to the UPI arrow mark without infringing on the logo.
      return (
        <svg {...common}>
          <path d="M7 6l5 6-5 6" />
          <path d="M12 6l5 6-5 6" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="1.5" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </svg>
      );
    case "netbanking":
      // Columned building — classic bank glyph.
      return (
        <svg {...common}>
          <path d="M3 10l9-5 9 5" />
          <path d="M5 10v8" />
          <path d="M9 10v8" />
          <path d="M15 10v8" />
          <path d="M19 10v8" />
          <path d="M3 20h18" />
        </svg>
      );
    case "cod":
      // Rupee inside a circle — unambiguous "pay in cash" cue.
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 8h6" />
          <path d="M9 11h6" />
          <path d="M9 11c2 0 3 1 3 3h-3l5 5" />
        </svg>
      );
  }
}
