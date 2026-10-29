"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import clsx from "clsx";
import {
  useStore,
  type Address,
  type Order,
  type Preferences
} from "@/components/store/store-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// The whole /account page. Sections stack vertically; the sidebar nav (or
// drawer menu items) jump-scrolls to each via #anchor.
export function AccountClient() {
  const {
    user,
    openDrawer,
    signOut,
    addresses,
    addAddress,
    removeAddress,
    preferences,
    updatePreferences,
    wishlist,
    cartCount,
    orders,
    cancelOrder
  } = useStore();

  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  // Scroll to hash after mount (Next doesn't auto-scroll to hash on same-page
  // navigations reliably when the target is inside a client component that
  // mounts on route change).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  if (!user) {
    return <SignInGate onOpen={() => openDrawer("account")} />;
  }

  const greeting = user.name || user.email.split("@")[0];

  return (
    <div className="bg-ink text-chalk">
      {/* Hero band */}
      <section className="border-b border-chalk/10 pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-editorial px-6 md:px-14">
          <p className="text-[10px] uppercase tracking-[0.32em] text-chalk/55">
            My Account
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold uppercase leading-[1.05] tracking-[0.02em]">
            Welcome back, {greeting}
          </h1>
          <p className="mt-4 text-[13px] text-chalk/60">{user.email}</p>
        </div>
      </section>

      <div className="mx-auto max-w-editorial px-6 py-16 md:grid md:grid-cols-12 md:gap-12 md:px-14 md:py-24">
        {/* Sidebar */}
        <aside className="md:col-span-3 lg:col-span-3">
          <nav className="sticky top-32 space-y-1 border-l border-chalk/10 pl-6" aria-label="Account sections">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block py-2 text-[11px] uppercase tracking-[0.24em] text-chalk/60 transition-colors hover:text-chalk"
              >
                {s.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => setConfirmingSignOut(true)}
              className="mt-6 block py-2 text-[11px] uppercase tracking-[0.24em] text-chalk/70 underline underline-offset-[6px] decoration-chalk/30 transition-colors hover:text-chalk hover:decoration-chalk/70"
            >
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Sections */}
        <div className="mt-16 space-y-24 md:col-span-9 md:mt-0 md:space-y-32 lg:col-span-9">
          <OrdersSection
            orders={orders}
            cartCount={cartCount}
            onCancel={cancelOrder}
          />
          <AddressesSection
            addresses={addresses}
            onAdd={addAddress}
            onRemove={removeAddress}
          />
          <WishlistSection count={wishlist.length} onOpen={() => openDrawer("wishlist")} />
          <PreferencesSection
            preferences={preferences}
            onChange={updatePreferences}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmingSignOut}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onCancel={() => setConfirmingSignOut(false)}
        onConfirm={() => {
          setConfirmingSignOut(false);
          signOut();
        }}
      />
    </div>
  );
}

const SECTIONS = [
  { id: "orders", label: "My Orders" },
  { id: "addresses", label: "My Addresses" },
  { id: "wishlist", label: "My Wishlist" },
  { id: "preferences", label: "Preferences" }
];

function SignInGate({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex min-h-[80svh] items-center justify-center bg-ink px-6 py-32 text-center text-chalk">
      <div className="max-w-md">
        <p className="text-[10px] uppercase tracking-[0.32em] text-chalk/55">
          My Account
        </p>
        <h1 className="mt-6 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold uppercase leading-[1.05] tracking-[0.02em]">
          Please sign in
        </h1>
        <p className="mt-6 text-[14px] leading-[1.7] text-chalk/70">
          Sign in to view your orders, saved addresses and preferences.
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-10 bg-chalk px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink transition-opacity hover:opacity-90"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ id, label }: { id: string; label: string }) {
  return (
    <div className="mb-10 flex items-baseline justify-between border-b border-chalk/10 pb-5">
      <h2
        id={id}
        className="font-display text-[clamp(1.25rem,2vw,1.75rem)] font-semibold uppercase tracking-[0.04em] scroll-mt-32"
      >
        {label}
      </h2>
    </div>
  );
}

function OrdersSection({
  orders,
  cartCount,
  onCancel
}: {
  orders: Order[];
  cartCount: number;
  onCancel: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeader id="orders" label="My Orders" />

      {orders.length === 0 ? (
        <div className="border border-chalk/10 px-8 py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-chalk/55">
            No orders yet
          </p>
          <p className="mt-6 text-[13px] leading-[1.7] text-chalk/70">
            When you place an order, the details will appear here — pieces,
            delivery status, and receipts.
          </p>
          <Link
            href="/collections/objects"
            className="mt-8 inline-block text-[11px] uppercase tracking-[0.28em] text-chalk underline underline-offset-[6px] decoration-chalk/50 transition-colors hover:decoration-chalk"
          >
            {cartCount > 0 ? "Return to your bag" : "Browse the collection"}
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} onCancel={onCancel} />
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderCard({
  order,
  onCancel
}: {
  order: Order;
  onCancel: (id: string) => void;
}) {
  const placed = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const itemCount = order.items.reduce((acc, i) => acc + i.qty, 0);
  const isCancellable = order.status === "placed";

  const handleCancel = () => {
    const confirmed = window.confirm(
      `Cancel order ${order.id}? Any refund will settle within 5–7 working days.`
    );
    if (confirmed) onCancel(order.id);
  };

  return (
    <li className="border border-chalk/10 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.26em] text-chalk/55">
            Order {order.id}
          </p>
          <p className="mt-2 text-[12px] text-chalk/60">Placed {placed}</p>
        </div>
        <AccountStatusBadge status={order.status} />
      </div>

      <ul className="mt-6 space-y-2 text-[13px] leading-[1.6] text-chalk/80">
        {order.items.slice(0, 3).map((item) => (
          <li key={item.handle} className="flex justify-between gap-6">
            <span className="min-w-0 truncate">
              <span className="text-chalk/60">{item.qty} ×</span> {item.name}
            </span>
            <span className="shrink-0 text-chalk/70">
              ₹ {item.lineTotal.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
        {order.items.length > 3 && (
          <li className="text-chalk/50">
            + {order.items.length - 3} more piece
            {order.items.length - 3 === 1 ? "" : "s"}
          </li>
        )}
      </ul>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-t border-chalk/10 pt-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-chalk/60">
          {itemCount} piece{itemCount === 1 ? "" : "s"}
        </p>
        <p className="text-[14px] font-semibold tracking-[0.02em] text-chalk">
          ₹ {order.total.toLocaleString("en-IN")}.00
        </p>
      </div>

      {isCancellable && (
        <div className="mt-6 text-[11px] uppercase tracking-[0.22em]">
          <button
            type="button"
            onClick={handleCancel}
            className="text-chalk/80 underline underline-offset-[6px] decoration-chalk/30 transition-colors hover:text-chalk hover:decoration-chalk/70"
          >
            Cancel order
          </button>
        </div>
      )}
      {order.status === "cancelled" && order.cancelledAt && (
        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-chalk/50">
          Cancelled on{" "}
          {new Date(order.cancelledAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          })}
        </p>
      )}
    </li>
  );
}

function AccountStatusBadge({ status }: { status: Order["status"] }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={clsx(
        "inline-block border px-3 py-1 text-[9px] uppercase tracking-[0.26em]",
        status === "cancelled" && "border-red-400/40 bg-red-400/10 text-red-200",
        status === "placed" && "border-chalk/25 bg-chalk/5 text-chalk/80",
        status === "shipped" && "border-amber-400/40 bg-amber-400/10 text-amber-200",
        status === "delivered" && "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
      )}
    >
      {label}
    </span>
  );
}

function AddressesSection({
  addresses,
  onAdd,
  onRemove
}: {
  addresses: Address[];
  onAdd: (a: Omit<Address, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(addresses.length === 0);

  return (
    <section>
      <SectionHeader id="addresses" label="My Addresses" />

      {addresses.length > 0 && (
        <ul className="mb-10 grid gap-6 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="border border-chalk/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-chalk">
                    {a.name}
                  </p>
                  <p className="mt-3 text-[13px] leading-[1.7] text-chalk/75">
                    {a.line1}
                    {a.line2 && (
                      <>
                        <br />
                        {a.line2}
                      </>
                    )}
                    <br />
                    {a.city}, {a.state} {a.postal}
                    <br />
                    {a.country}
                    {a.phone && (
                      <>
                        <br />
                        {a.phone}
                      </>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(a.id)}
                  aria-label="Remove address"
                  className="shrink-0 text-chalk/50 transition-colors hover:text-chalk"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M1.5 1.5l9 9M10.5 1.5l-9 9"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <AddressForm
          onCancel={
            addresses.length > 0 ? () => setShowForm(false) : undefined
          }
          onSubmit={(a) => {
            onAdd(a);
            setShowForm(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="border border-chalk/40 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-chalk transition-colors hover:border-chalk hover:bg-chalk hover:text-ink"
        >
          Add a new address
        </button>
      )}
    </section>
  );
}

function AddressForm({
  onSubmit,
  onCancel
}: {
  onSubmit: (a: Omit<Address, "id">) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Omit<Address, "id">>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    country: "India",
    phone: ""
  });

  const set = <K extends keyof Omit<Address, "id">>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      line2: form.line2 || undefined,
      phone: form.phone || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-chalk/10 p-6 md:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} required />
        <TextField label="Phone" value={form.phone || ""} onChange={(v) => set("phone", v)} type="tel" />
        <div className="sm:col-span-2">
          <TextField label="Address line 1" value={form.line1} onChange={(v) => set("line1", v)} required />
        </div>
        <div className="sm:col-span-2">
          <TextField label="Address line 2" value={form.line2 || ""} onChange={(v) => set("line2", v)} />
        </div>
        <TextField label="City" value={form.city} onChange={(v) => set("city", v)} required />
        <TextField label="State / Region" value={form.state} onChange={(v) => set("state", v)} required />
        <TextField label="Postal code" value={form.postal} onChange={(v) => set("postal", v)} required />
        <TextField label="Country" value={form.country} onChange={(v) => set("country", v)} required />
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          className="bg-chalk px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink transition-opacity hover:opacity-90"
        >
          Save address
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] uppercase tracking-[0.28em] text-chalk/70 underline underline-offset-[6px] decoration-chalk/30 transition-colors hover:text-chalk"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function WishlistSection({
  count,
  onOpen
}: {
  count: number;
  onOpen: () => void;
}) {
  return (
    <section>
      <SectionHeader id="wishlist" label="My Wishlist" />
      <div className="border border-chalk/10 px-8 py-12">
        <p className="text-[13px] leading-[1.7] text-chalk/70">
          {count === 0
            ? "You haven't saved any pieces yet."
            : `${count} ${count === 1 ? "piece" : "pieces"} saved.`}
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-6 text-[11px] uppercase tracking-[0.28em] text-chalk underline underline-offset-[6px] decoration-chalk/50 transition-colors hover:decoration-chalk"
        >
          Open wishlist
        </button>
      </div>
    </section>
  );
}

function PreferencesSection({
  preferences,
  onChange
}: {
  preferences: Preferences;
  onChange: (p: Partial<Preferences>) => void;
}) {
  return (
    <section>
      <SectionHeader id="preferences" label="Preferences" />
      <div className="border border-chalk/10 p-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <SelectField
            label="Language"
            value={preferences.language}
            onChange={(v) => onChange({ language: v as Preferences["language"] })}
            options={[{ value: "English", label: "English" }]}
          />
          <SelectField
            label="Currency"
            value={preferences.currency}
            onChange={(v) => onChange({ currency: v as Preferences["currency"] })}
            options={[
              { value: "INR", label: "INR — Indian Rupee" },
              { value: "USD", label: "USD — US Dollar" },
              { value: "EUR", label: "EUR — Euro" },
              { value: "GBP", label: "GBP — Pound Sterling" }
            ]}
          />
        </div>
        <p className="mt-8 text-[11px] text-chalk/40">
          Preferences apply across the site and are saved to this device.
        </p>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-chalk/55">
        {label}
        {required && <span className="ml-1 text-chalk/40">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border-b border-chalk/25 bg-transparent py-2 text-[14px] text-chalk transition-colors focus:border-chalk focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-chalk/55">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-chalk/25 bg-transparent py-2 text-[14px] text-chalk transition-colors focus:border-chalk focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink text-chalk">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
