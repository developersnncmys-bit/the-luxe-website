"use client";

import { motion } from "framer-motion";

export function ExclusiveIntro() {
  return (
    <section
      className="relative bg-ink py-32 text-chalk md:py-48"
      aria-labelledby="exclusive-intro-heading"
    >
      <div className="mx-auto max-w-3xl px-6 text-center md:px-14">
        <motion.p
          id="exclusive-intro-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-[10px] uppercase tracking-[0.38em] text-chalk/55"
        >
          A Note from the Studio
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(0.9375rem,1.2vw,1.125rem)] font-light leading-[1.65] text-chalk/85 md:leading-[1.7]"
        >
          Pieces on this page do not sit on a shelf. They are made in the studio
          after you ask for them — one at a time, by the same hands, finished to
          the house standard. Expect a lead time. Expect the piece to be worth it.
        </motion.p>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 block h-px w-14 origin-center bg-chalk/40"
        />
      </div>
    </section>
  );
}
