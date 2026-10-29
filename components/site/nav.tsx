"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { IconSearch, IconAccount, IconHeart, IconBag } from "@/components/ui/icons";
import { useStore } from "@/components/store/store-provider";
import { HighContrastToggle } from "@/components/site/high-contrast-toggle";
import { fetchCategories, type Category } from "@/lib/categories-api";

const PRIMARY_LINKS: Array<{ href: string; label: string; tag?: string }> = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "The Collection" },
  { href: "/edit", label: "The Edit" },
  { href: "/house", label: "The House" },
  { href: "/journal", label: "The Studio" }
];

// "Luxe Exclusive" sits as a fixed tail bookend — it's a dedicated page,
// not a backend category. "All Objects" is admin-managed via the reserved
// `all-objects` slug in the Categories tab (so its label and position are
// controlled like any other category); the storefront routes that slug to
// the existing /collections/objects page instead of a slug-matched page.
const COLLECTION_BOOKEND_TAIL = { href: "/exclusive", label: "Luxe Exclusive" };
const ALL_OBJECTS_SLUG = "all-objects";
const ALL_OBJECTS_HREF = "/collections/objects";

// Sits inside a floating dark panel that drops below the navbar on hover
const DROPDOWN_LINKS = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "The Collection" },
  { href: "/edit", label: "The Edit" },
  { href: "/house", label: "The House" },
  { href: "/journal", label: "The Studio" }
];

const SECONDARY_LINKS = [
  { href: "/studio/appointment", label: "Book an appointment" },
  { href: "/faq", label: "Client Care" },
  { href: "/careers", label: "Careers" }
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerRevealed, setFooterRevealed] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const [overLight, setOverLight] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();

  // Pull the admin-managed category list once on mount. Nav is persistent
  // across client-side navigations, so this runs a single time per full
  // page load. On failure we silently fall back to the two fixed bookends,
  // which still gets the visitor into the catalog via "All Objects".
  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => {
        /* leave the sublinks row with just the fixed bookends */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // <admin categories, order-sorted, active-only> + "Luxe Exclusive".
  // The reserved `all-objects` slug behaves like any other category in the
  // nav (admin-authored label and order), but its href routes to the
  // existing /collections/objects page rather than a slug-matched route.
  const collectionSublinks = useMemo(() => {
    const dynamic = [...categories]
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => ({
        href: c.id === ALL_OBJECTS_SLUG ? ALL_OBJECTS_HREF : `/collections/${c.id}`,
        label: c.name
      }));
    return [...dynamic, COLLECTION_BOOKEND_TAIL];
  }, [categories]);
  const { openDrawer, cartCount, wishlist, user } = useStore();
  const wishlistCount = wishlist.length;
  const isSignedIn = !!user;
  const isProductPage = pathname.startsWith("/collections/");
  const isExclusivePage = pathname.startsWith("/exclusive");
  // Cart + checkout flow: nav flips to white (like product pages) and the
  // secondary row of page links is suppressed so the page is a bare brand
  // bar + breadcrumb.
  const isCheckoutPage =
    pathname.startsWith("/cart") || pathname.startsWith("/checkout");
  // Treat checkout + Luxe Exclusive the same as product pages for white-nav styling.
  const navLight = isProductPage || isCheckoutPage || isExclusivePage;
  // Three-or-more segments under /collections → product detail page.
  // Distinct from `isProductPage` (which covers any collections subpath and
  // drives the white/ink nav styling); this narrower flag suppresses the
  // auto-dropdown pill that would otherwise sit on top of the product hero.
  const isProductDetailPage =
    pathname.startsWith("/collections/") &&
    pathname.split("/").filter(Boolean).length >= 3;

  // Exact match for "/" (otherwise every route matches); prefix match for the
  // rest so /collections/showpieces highlights /collections in the top nav.
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Past-hero trigger — swaps the full nav for a compact rectangular panel
      // once the hero has scrolled out of view. Small buffer so the swap fires
      // just before the hero fully exits.
      setPastHero(window.scrollY > window.innerHeight - 80);
      /* Footer counts as "revealed" once its top edge has scrolled into
         the top ~20% of the viewport — at that point the client-services
         strip is dominant on screen and the nav should retract. */
      const footer = document.querySelector("footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        setFooterRevealed(rect.top < window.innerHeight * 0.2);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Recompute scroll-derived state on route change — Nav is persistent across
  // client-side navigations, so pastHero/scrolled would otherwise stay stale
  // until the next scroll event fires and briefly render both bars at once.
  // Two passes: one now (in case scroll is already correct) and one on the
  // next frame (after Next.js scroll-restoration finishes).
  useEffect(() => {
    const check = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setPastHero(y > window.innerHeight - 80);
    };
    check();
    const raf = requestAnimationFrame(check);
    const t = window.setTimeout(check, 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname]);

  // Watch for light-background sections (marked with data-nav-invert) sitting
  // under the nav. Scroll-based check is the source of truth — recomputes the
  // full set every scroll, so the state can never get stuck on stale entries.
  useEffect(() => {
    const NAV_BAND = 80; // pixels from viewport top the nav pill occupies
    const check = () => {
      const targets = document.querySelectorAll<HTMLElement>("[data-nav-invert]");
      const anyOver = Array.from(targets).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < NAV_BAND && r.bottom > NAV_BAND;
      });
      setOverLight(anyOver);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  // Lock body scroll and support Escape while the menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        onMouseEnter={() => setNavHovered(true)}
        onMouseLeave={() => setNavHovered(false)}
        className={clsx(
          // group/nav lives on <header> (not the inner bar) so that
          // group-hover/nav:* keeps firing while the mouse is on the floating
          // dropdown panel below the bar — the panel is a header child but a
          // sibling of the bar, so CSS :hover on the bar itself would drop.
          "group/nav fixed inset-x-0 top-0 z-50 text-chalk transition-transform duration-500 ease-silk",
          footerRevealed && !menuOpen ? "-translate-y-full" : "translate-y-0"
        )}
      >
        {/* Compact rectangular panel — only shown after the hero has scrolled past.
            Replaces the full navbar (wordmark + icons + sublinks) with a small
            floating pill of the main page links. */}
        <AnimatePresence>
          {pastHero && !menuOpen && !isProductPage && !isCheckoutPage && !isExclusivePage && (
            <motion.div
              key="nav-compact"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-4 flex justify-center px-6 md:top-5"
            >
              <nav
                aria-label="Site sections"
                className={clsx(
                  "shadow-lg backdrop-blur-xl transition-[background-color,border-color,color,box-shadow] duration-500 ease-silk",
                  overLight
                    ? "border border-ink/10 bg-chalk/90 shadow-black/10 text-ink"
                    : "border border-chalk/15 bg-ink/85 shadow-black/20 text-chalk"
                )}
              >
                <ul className="flex items-center gap-8 px-8 py-3 lg:gap-12">
                  {DROPDOWN_LINKS.map((l) => {
                    const active = isActive(l.href);
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          aria-current={active ? "page" : undefined}
                          className={clsx(
                            "relative text-[11px] font-bold uppercase tracking-[0.28em] text-current transition-colors duration-300 ease-silk hover:opacity-70",
                            active &&
                              "after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-px after:bg-current after:opacity-70"
                          )}
                        >
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full navbar — visible only over the hero. Fades out once pastHero fires. */}
        <div
          className={clsx(
            "w-full border-b transition-[background-color,border-color,color,backdrop-filter,opacity] duration-500 ease-silk",
            menuOpen
              ? "border-transparent bg-transparent"
              : navLight
                ? // Product + checkout pages get the inverted look permanently — white bar, ink text.
                  "border-ink/10 bg-white text-ink"
                : scrolled
                  ? "border-chalk/10 bg-ink/75 backdrop-blur-md group-hover/nav:border-ink/10 group-hover/nav:bg-white group-hover/nav:text-ink group-hover/nav:backdrop-blur-none"
                  : // At the top (over the hero) — solid dark bar; on hover, whole strip inverts to white with dark text (Chanel-style).
                    "border-transparent bg-ink group-hover/nav:bg-white group-hover/nav:text-ink",
            pastHero && !menuOpen && !navLight && "pointer-events-none opacity-0"
          )}
        >
          <div className="relative mx-auto flex h-16 max-w-editorial items-center justify-end px-6 md:h-20 md:px-10">
            {/* Left: hamburger / close toggle + Menu label — hidden for now */}
            {/*
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative z-[60] flex items-center gap-3 text-chalk/90 transition-opacity hover:opacity-60"
            >
              <span className="relative inline-block h-[14px] w-[20px]">
                <span
                  className={clsx(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-500 ease-silk",
                    menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                  )}
                />
                <span
                  className={clsx(
                    "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current transition-opacity duration-300",
                    menuOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={clsx(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-500 ease-silk",
                    menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                  )}
                />
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.28em] md:inline">
                {menuOpen ? "Close" : "Menu"}
              </span>
            </button>
            */}

            {/* Center: wordmark */}
            <Link
              href="/"
              aria-label="THE LUXE VERSION — home"
              style={{
                fontFamily: "var(--font-serif-display)",
                transform: "translate(-50%, -50%) scaleY(1.55)",
                transformOrigin: "center",
                display: "inline-block"
              }}
              className="absolute left-1/2 top-1/2 z-[60] whitespace-nowrap text-[16px] font-bold uppercase leading-none tracking-[0.12em] md:text-[22px]"
            >
              The Luxe Version
            </Link>

            {/* Right: utility icons */}
            <nav
              className={clsx(
                "relative z-[60] flex items-center gap-4 transition-colors duration-500 ease-silk md:gap-5",
                // Solid chalk/ink (no /opacity) so high-contrast mode's
                // opacity-lift rule doesn't force chalk with !important and
                // clobber the group-hover:text-ink flip when the bar inverts.
                navLight ? "text-ink" : "text-chalk group-hover/nav:text-ink"
              )}
              aria-label="Utilities"
            >
              <HighContrastToggle />
              <button
                type="button"
                onClick={() => openDrawer("search")}
                className="p-1.5 transition-opacity hover:opacity-60"
                aria-label="Search"
              >
                <IconSearch />
              </button>
              <button
                type="button"
                onClick={() => openDrawer("account")}
                className="relative p-1.5 transition-opacity hover:opacity-60"
                aria-label={isSignedIn ? "My account" : "Sign in"}
              >
                <IconAccount />
                {isSignedIn && (
                  <span
                    aria-hidden
                    className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-current"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => openDrawer("wishlist")}
                className="relative hidden p-1.5 transition-opacity hover:opacity-60 md:inline"
                aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`}
              >
                <IconHeart />
                {wishlistCount > 0 && <NavBadge count={wishlistCount} />}
              </button>
              <button
                type="button"
                onClick={() => openDrawer("cart")}
                className="relative p-1.5 transition-opacity hover:opacity-60"
                aria-label={`Bag${cartCount > 0 ? ` (${cartCount})` : ""}`}
              >
                <IconBag />
                {cartCount > 0 && <NavBadge count={cartCount} />}
              </button>
            </nav>
          </div>

          {/* Below-wordmark row — swaps content based on hover:
              unhovered = page links (Home, The Collection, …)
              hovered = collection sublinks (All Objects, Sculptures, …)
              Checkout flow always shows the category sublinks so visitors can
              still browse mid-purchase, but never the page-level links which
              feel out of place on a transactional page. */}
          {!menuOpen && (
            <nav aria-label="Collections" className="hidden md:block">
              <ul className="mx-auto flex max-w-editorial items-center justify-center gap-10 px-10 py-3 lg:gap-14">
                {(isCheckoutPage || navHovered || pathname.startsWith("/collections/") || pathname.startsWith("/exclusive") ? collectionSublinks : DROPDOWN_LINKS).map((l) => {
                  const active = isActive(l.href);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                          "relative text-[11px] font-bold uppercase tracking-[0.28em] transition-colors duration-500 ease-silk",
                          navLight
                            ? "text-ink hover:text-ink/70"
                            : "text-chalk group-hover/nav:text-ink/80 hover:!text-ink",
                          active &&
                            "after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-px after:bg-current after:opacity-70"
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>

        {/* Floating dark dropdown panel — appears below the navbar on hover.
            Only over the hero (before the compact panel takes over). */}
        <AnimatePresence>
          {(navHovered || pathname.startsWith("/collections/") || isExclusivePage) && !menuOpen && !pastHero && !isProductDetailPage && !isCheckoutPage && (
            <motion.div
              key="nav-dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none hidden justify-center pt-3 md:flex"
            >
              <nav
                aria-label="Site sections"
                className="pointer-events-auto border border-chalk/10 bg-ink/95 backdrop-blur-md"
              >
                <ul className="flex items-center gap-6 px-8 py-3 md:gap-8 lg:gap-10">
                  {DROPDOWN_LINKS.map((l) => {
                    const active = isActive(l.href);
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          aria-current={active ? "page" : undefined}
                          className={clsx(
                            "relative text-[11px] font-bold uppercase tracking-[0.28em] text-chalk transition-colors duration-300 ease-silk hover:text-white",
                            active &&
                              "after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-px after:bg-current after:opacity-70"
                          )}
                        >
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            key="site-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[45] bg-ink text-chalk"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="mx-auto flex h-full max-w-editorial flex-col justify-between px-6 pb-10 pt-28 md:px-10 md:pt-32">
              <motion.ul
                initial="initial"
                animate="animate"
                variants={{ animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                className="space-y-2 md:space-y-3"
              >
                {PRIMARY_LINKS.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <motion.li
                      key={l.href}
                      variants={{
                        initial: { opacity: 0, y: 24 },
                        animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
                      }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        style={{ fontFamily: "var(--font-serif-display)" }}
                        className={clsx(
                          "group relative inline-flex items-baseline gap-3 text-[clamp(1.125rem,1.8vw,1.75rem)] font-light leading-[1.2] text-chalk transition-opacity hover:opacity-60",
                          active &&
                            "after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-current after:opacity-70"
                        )}
                      >
                        <span>{l.label}</span>
                        {l.tag && (
                          <span className="text-[11px] uppercase tracking-[0.24em] text-champagne font-normal">
                            {l.tag}
                          </span>
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <div className="mt-16 flex flex-col gap-8 border-t border-chalk/15 pt-8 md:flex-row md:items-end md:justify-between">
                <ul className="flex flex-wrap gap-x-8 gap-y-3">
                  {SECONDARY_LINKS.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-[11px] uppercase tracking-[0.24em] text-chalk/70 transition-opacity hover:text-chalk"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="text-[10px] uppercase tracking-[0.32em] text-chalk/40">
                  India · English
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-current px-1 text-[9px] font-semibold leading-none"
    >
      <span className="mix-blend-difference text-white">{count}</span>
    </span>
  );
}
