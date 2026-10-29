"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const COLUMNS = [
  {
    title: "Explore The House",
    links: [
      { href: "/collections/sculptures", label: "Sculptures" },
      { href: "/collections/vases", label: "Vases" },
      { href: "/collections", label: "The Complete Collection" }
    ]
  },
  {
    title: "Online Services",
    links: [
      { href: "/payment", label: "Payment Policy" },
      { href: "/shipping", label: "Shipping Policy" },
      { href: "/account", label: "My Account" },
      { href: "/returns", label: "Return, Refund & Replacement Policy" },
      { href: "/cancellation", label: "Cancellation Policy" },
      { href: "/care", label: "Care & Restoration" },
      { href: "/faq", label: "FAQ's" }
    ]
  },
  {
    title: "Studio Services",
    links: [
      { href: "/studio/appointment", label: "Book an appointment" },
      { href: "/studio/bespoke", label: "Bespoke commissions" },
      { href: "/studio/interior", label: "Interior consultation" },
      { href: "/contact", label: "Contact" }
    ]
  },
  {
    title: "The Luxe Version",
    links: [
      { href: "/house", label: "The House" },
      { href: "/journal", label: "The Studio" },
      { href: "/careers", label: "Careers" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" }
    ]
  }
];

const SOCIALS = [
  { label: "Instagram", href: "#", d: "M6 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm4 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm4-1a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" },
  { label: "Facebook", href: "#", d: "M11 3h3v3h-2c-.5 0-1 .3-1 1v2h3l-.5 3H11v7H8v-7H6v-3h2V6.5A3.5 3.5 0 0 1 11 3Z" },
  { label: "YouTube", href: "#", d: "M2 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Zm6.5 1.2v4.6L13 10.5 8.5 8.2Z" },
  { label: "LinkedIn", href: "#", d: "M4 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM4.5 8h2v9h-2V8Zm4 0h2v1.3c.5-.9 1.6-1.5 2.7-1.5 2 0 3.3 1.3 3.3 3.5V17h-2v-5.2c0-1.2-.6-1.9-1.6-1.9-1.1 0-1.7.8-1.7 2V17h-2V8Z" }
];

export function Footer() {
  const stripRef = useRef<HTMLElement>(null);

  /* Parallax the white client-services strip against page scroll.
     Faster-than-scroll upward translate (foreground plane) — strip rises
     out of the flow as the dark footer scrolls up behind it, so it visually
     reads as a floating layer above the footer's top edge. */
  const { scrollYProgress } = useScroll({
    target: stripRef,
    offset: ["start end", "end start"]
  });
  const stripY = useTransform(scrollYProgress, [0, 1], [220, -220]);

  return (
    <footer className="relative bg-ink text-chalk pt-16 md:pt-24">
      {/* CLIENT-SERVICES STRIP — parallax layer floating above the dark footer's top edge.
          Dark pt on <footer> above gives the strip a visible dark band to sit on.
          Negative bottom margin pulls the dark footer up behind the strip's bottom edge.
          Soft white glow (visible on dark) implies elevation. */}
      <motion.section
        ref={stripRef}
        style={{ y: stripY }}
        className="relative z-20 -mb-20 md:-mb-28 bg-chalk text-ink py-16 md:py-20 shadow-[0_30px_60px_-20px_rgba(255,255,255,0.08),0_-30px_60px_-20px_rgba(255,255,255,0.06)]"
      >
        <div className="mb-14 flex justify-center md:mb-16">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-ink/55 md:text-[11px]">
            <span className="inline-block h-px w-8 bg-ink/40" />
            Client Care
            <span className="inline-block h-px w-8 bg-ink/40" />
          </p>
        </div>

          <div className="mx-auto grid w-full max-w-editorial grid-cols-1 gap-14 px-6 md:grid-cols-3 md:gap-8 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em]">
                Contact an advisor
              </p>
              <p className="text-[13px] leading-[1.8] text-ink/75">
                Please contact The Luxe Version Client Care, Monday – Sunday, 10 a.m. – 8 p.m. IST
                (except National Holidays) via{" "}
                <a href="mailto:clientcare@theluxeversion.example" className="underline underline-offset-4 hover:no-underline">
                  clientcare@theluxeversion.example
                </a>{" "}
                or by calling{" "}
                <a href="tel:0008000504446" className="underline underline-offset-4 hover:no-underline">
                  000 800 050 4446
                </a>.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em]">Find the studio</p>
              <p className="mb-4 text-[13px] leading-[1.8] text-ink/75">
                Visit The Luxe Version by appointment.
              </p>
              <form className="flex items-center gap-3 border-b border-ink/30 pb-2">
                <input
                  type="text"
                  placeholder="City or postal code"
                  aria-label="Find the studio"
                  className="w-full bg-transparent text-[13px] placeholder:text-ink/40 focus:outline-none"
                />
                <button type="submit" className="text-[10px] uppercase tracking-[0.22em] text-ink/70 hover:text-ink">
                  Search
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em]">Newsletter</p>
              <p className="mb-4 text-[13px] leading-[1.8] text-ink/75">
                Subscribe to receive the latest dispatches from The Luxe Version.
              </p>
              <form className="flex items-center gap-3 border-b border-ink/30 pb-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  aria-label="Email address"
                  className="w-full bg-transparent text-[13px] placeholder:text-ink/40 focus:outline-none"
                />
                <button type="submit" className="text-[10px] uppercase tracking-[0.22em] text-ink/70 hover:text-ink">
                  Subscribe
                </button>
              </form>
            </motion.div>
          </div>
      </motion.section>

      {/* Rest of footer — flows normally below the client-services strip */}
      <div className="relative z-10 bg-ink">
        {/* Small centered wordmark — serif, matching preloader + nav */}
        <div className="mx-auto max-w-editorial px-6 pt-16 pb-10 text-center md:px-10 md:pt-20 md:pb-14">
          <div
            style={{
              fontFamily: "var(--font-serif-display)",
              transform: "scaleY(1.55)",
              transformOrigin: "center",
              display: "inline-block"
            }}
            className="text-[clamp(1.125rem,2.4vw,2.25rem)] font-semibold uppercase leading-none tracking-[0.06em]"
          >
            The Luxe Version
          </div>
        </div>

        {/* 4-col link grid */}
        <div className="mx-auto max-w-editorial px-6 pb-16 md:px-10">
          <div className="mb-6 flex items-center justify-end border-b border-chalk/15 pb-4">
            <ul className="flex items-center gap-4 text-chalk/80" aria-label="Social">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} aria-label={s.label} className="block transition-opacity hover:opacity-60">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden>
                      <path d={s.d} />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em]">
                  {col.title}
                </p>
                <ul className="space-y-3 text-[13px] text-chalk/80">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="transition-opacity hover:opacity-60">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Region + legal */}
        <div className="mx-auto max-w-editorial px-6 pb-14 md:px-10">
          <div className="mt-12 flex flex-col-reverse gap-4 border-t border-chalk/15 pt-8 md:mt-8 md:flex-row md:items-center md:justify-between">
            <p className="text-[13px] text-chalk/55">
              The Luxe Version Private Limited, 5th Floor, Unit N° 505, UB City,
              24 Vittal Mallya Road, Bengaluru 560001, India.
            </p>
            <p className="self-start text-[13px] uppercase tracking-[0.22em] text-chalk/70 md:self-auto">
              © {new Date().getFullYear()} The Luxe Version. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
