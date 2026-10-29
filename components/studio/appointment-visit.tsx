"use client";

import { motion } from "framer-motion";

type Step = {
  number: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "The Request",
    body:
      "Write to the studio with a preferred day, a window of time, and a short note on what you'd like to see — the full collection, a specific piece, or a direction you're exploring for a room."
  },
  {
    number: "02",
    title: "The Confirmation",
    body:
      "We propose a time and share a short note on what we'll bring out of storage. If a piece needs to be lit a particular way, we'll set it up before you arrive."
  },
  {
    number: "03",
    title: "The Visit",
    body:
      "An unhurried hour at the studio. No sales floor, no script — a conversation about materials, scale, and the pieces themselves. Tea, water, time."
  }
];

export function AppointmentVisit() {
  return (
    <section
      id="the-visit"
      className="relative scroll-mt-24 bg-ink py-24 text-chalk md:py-36"
      aria-labelledby="appointment-visit-heading"
    >
      <div className="mx-auto max-w-editorial px-6 md:px-14">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] uppercase tracking-[0.38em] text-chalk/55"
          >
            The Visit
          </motion.p>

          <motion.h2
            id="appointment-visit-heading"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 max-w-3xl font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-light uppercase leading-[1.1] tracking-[0.02em]"
          >
            From a Note to an Hour at the Studio
          </motion.h2>

          <motion.span
            aria-hidden
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 block h-px w-14 origin-center bg-chalk/40"
          />
        </div>

        <div className="mt-20 grid grid-cols-1 gap-16 md:mt-28 md:grid-cols-3 md:gap-12">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 1.1,
                delay: 0.15 * i,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="group min-w-0"
            >
              <div className="flex items-center gap-6">
                <p
                  aria-hidden
                  className="font-[family-name:var(--font-serif-display)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-light italic leading-[0.85] text-chalk/30 transition-colors duration-500 ease-silk group-hover:text-chalk/70"
                >
                  {step.number}
                </p>
                <span
                  aria-hidden
                  className="block h-10 w-px bg-chalk/25 transition-colors duration-500 ease-silk group-hover:bg-chalk/60 md:h-12"
                />
              </div>
              <span
                aria-hidden
                className="mt-8 block h-px w-14 origin-left bg-chalk/25 transition-all duration-700 ease-silk group-hover:w-28 group-hover:bg-chalk/60"
              />
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-chalk">
                {step.title}
              </p>
              <p className="mt-5 max-w-sm text-[13px] leading-[1.85] text-chalk/75 md:text-[14px]">
                {step.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
