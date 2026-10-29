"use client";

import { motion } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";

const SPEC_ROWS = [
  { label: "Where", value: "UB City · Bengaluru" },
  { label: "Duration", value: "60 – 90 minutes" },
  { label: "Hours", value: "Mon – Fri · 10:00 – 19:00" },
  { label: "Weekend", value: "Sat · 10:00 – 17:00 · Sun by request" }
];

export function AppointmentStudio() {
  return (
    <section
      className="relative bg-ink py-20 text-chalk md:py-28"
      aria-labelledby="appointment-studio-heading"
    >
      <div className="mx-auto grid max-w-editorial grid-cols-1 items-center gap-10 px-6 md:grid-cols-12 md:gap-12 md:px-14 lg:gap-20">
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] w-full overflow-hidden md:col-span-6 md:aspect-[4/5]"
        >
          <SafeImage
            src="/images/figurines/appointment.avif"
            alt="Figurative pieces at the studio"
            fallbackSeed="appointment-studio"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            quality={76}
            className="object-cover"
          />
        </motion.figure>
        

        <div className="min-w-0 md:col-span-6 md:pl-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] uppercase tracking-[0.38em] text-chalk/55"
          >
            The Studio
          </motion.p>

          <motion.h2
            id="appointment-studio-heading"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[clamp(1.5rem,2.8vw,2.5rem)] font-light uppercase leading-[1.1] tracking-[0.015em]"
          >
            Pieces Seen in Person
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-[13px] leading-[1.85] text-chalk/75 md:text-[14px]"
          >
            The studio sits above UB City on Vittal Mallya Road, Bengaluru.
            Appointments are complimentary and run through the week. A single
            visit is held for one guest or one small party at a time — not
            shared with another viewing.
          </motion.p>

          <motion.dl
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 divide-y divide-chalk/10 border-y border-chalk/10"
          >
            {SPEC_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-6 py-4"
              >
                <dt className="text-[10px] uppercase tracking-[0.3em] text-chalk/55">
                  {row.label}
                </dt>
                <dd className="text-right text-[12px] tracking-[0.04em] text-chalk/85">
                  {row.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
