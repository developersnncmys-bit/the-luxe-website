"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useStore } from "./store-provider";
import { DrawerShell } from "./drawer-shell";

type View = "signin" | "register";

export function AccountDrawer() {
  const { drawer, closeDrawer, user, signIn, signUp, signOut, openDrawer } = useStore();
  const open = drawer === "account";

  return (
    <DrawerShell
      open={open}
      onClose={closeDrawer}
      title={user ? "My Account" : "Sign In"}
    >
      {user ? (
        <SignedInPanel
          user={user}
          onSignOut={signOut}
          onOpenWishlist={() => openDrawer("wishlist")}
          onClose={closeDrawer}
        />
      ) : (
        <SignedOutPanel
          onSignIn={signIn}
          onSignUp={signUp}
          onClose={closeDrawer}
        />
      )}
    </DrawerShell>
  );
}

function SignedOutPanel({
  onSignIn,
  onSignUp,
  onClose
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
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
    setSubmitting(true);
    try {
      if (view === "register") {
        await onSignUp(trimmed, password, name.trim() || undefined);
      } else {
        await onSignIn(trimmed, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-chalk/10 px-6 py-6 md:px-8">
        <div className="flex gap-6">
          <ViewTab
            active={view === "signin"}
            onClick={() => {
              setView("signin");
              setError("");
            }}
          >
            Sign In
          </ViewTab>
          <ViewTab
            active={view === "register"}
            onClick={() => {
              setView("register");
              setError("");
            }}
          >
            Create Account
          </ViewTab>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-6 px-6 py-8 md:px-8">
        {view === "register" && (
          <Field
            label="Name"
            type="text"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={view === "signin" ? "current-password" : "new-password"}
          required
        />

        {view === "signin" && (
          <button
            type="button"
            className="text-[11px] uppercase tracking-[0.24em] text-chalk/70 underline underline-offset-[6px] decoration-chalk/30 transition-colors hover:text-chalk"
          >
            Forgot password?
          </button>
        )}

        {error && (
          <p className="text-[11px] uppercase tracking-[0.22em] text-champagne">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-chalk py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting
            ? view === "signin"
              ? "Signing in…"
              : "Creating account…"
            : view === "signin"
              ? "Sign In"
              : "Create Account"}
        </button>

        <div className="pt-6">
          <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-chalk/55">
            Client Services
          </p>
          <ul className="space-y-3">
            {[
              { href: "/studio/appointment", label: "Book an appointment" },
              { href: "/faq", label: "Client Care" }
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="text-[13px] text-chalk/85 underline underline-offset-[6px] decoration-chalk/30 transition-colors hover:text-chalk hover:decoration-chalk/70"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}

function SignedInPanel({
  user,
  onSignOut,
  onOpenWishlist,
  onClose
}: {
  user: { email: string; name?: string };
  onSignOut: () => void;
  onOpenWishlist: () => void;
  onClose: () => void;
}) {
  const greeting = user.name || user.email.split("@")[0];
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-chalk/10 px-6 py-8 md:px-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-chalk/55">
          Welcome back
        </p>
        <p className="mt-3 font-display text-[clamp(1.25rem,2vw,1.6rem)] font-semibold uppercase tracking-[0.02em] text-chalk">
          {greeting}
        </p>
        <p className="mt-2 text-[12px] text-chalk/60">{user.email}</p>
      </div>

      <nav className="flex-1 px-6 py-6 md:px-8" aria-label="Account">
        <ul className="divide-y divide-chalk/10">
          <AccountAnchor
            href="/account#orders"
            label="My Orders"
            hint="No orders yet"
            onClose={onClose}
          />
          <AccountAnchor
            href="/account#addresses"
            label="My Addresses"
            hint="Add a shipping address"
            onClose={onClose}
          />
          <li>
            <button
              type="button"
              onClick={() => onOpenWishlist()}
              className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-chalk"
            >
              <span className="text-[13px] uppercase tracking-[0.22em] text-chalk/85">
                My Wishlist
              </span>
              <span aria-hidden className="text-chalk/40">›</span>
            </button>
          </li>
          <AccountAnchor
            href="/account#preferences"
            label="Preferences"
            hint="Language, currency"
            onClose={onClose}
          />
          <li>
            <Link
              href="/faq"
              onClick={onClose}
              className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-chalk"
            >
              <span className="text-[13px] uppercase tracking-[0.22em] text-chalk/85">
                Client Care
              </span>
              <span aria-hidden className="text-chalk/40">›</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-chalk/10 px-6 py-6 md:px-8">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full border border-chalk/40 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-chalk transition-colors hover:border-chalk hover:bg-chalk hover:text-ink"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function AccountAnchor({
  href,
  label,
  hint,
  onClose
}: {
  href: string;
  label: string;
  hint?: string;
  onClose: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-chalk"
      >
        <div>
          <p className="text-[13px] uppercase tracking-[0.22em] text-chalk/85">
            {label}
          </p>
          {hint && <p className="mt-1 text-[11px] text-chalk/50">{hint}</p>}
        </div>
        <span aria-hidden className="text-chalk/40">›</span>
      </Link>
    </li>
  );
}

function ViewTab({
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
      className={`relative pb-1 text-[11px] font-semibold uppercase tracking-[0.28em] transition-colors ${
        active ? "text-chalk" : "text-chalk/50 hover:text-chalk/80"
      }`}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-px left-0 right-0 h-px bg-chalk"
        />
      )}
    </button>
  );
}

function Field({
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
      <span className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-chalk/55">
        {label}
        {required && <span className="ml-1 text-chalk/40">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full border-b border-chalk/25 bg-transparent py-2 text-[14px] text-chalk placeholder:text-chalk/40 transition-colors focus:border-chalk focus:outline-none"
      />
    </label>
  );
}
