"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ExclusiveHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-ink text-chalk grain"
      aria-labelledby="exclusive-hero-heading"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src="/images/sculptures/scu5.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-ink/65" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col items-start justify-center px-6 text-left md:px-16">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-[10px] uppercase tracking-[0.38em] text-chalk/60"
        >
          By Request · In House
        </motion.p>

        <motion.h1
          id="exclusive-hero-heading"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(1.75rem,4.5vw,4rem)] font-light uppercase leading-[0.95] tracking-[0.02em]"
        >
          Luxe Exclusive
        </motion.h1>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 block h-px w-20 origin-left bg-chalk/50"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 max-w-md text-[13px] leading-[1.9] text-chalk/70 md:text-[14px]"
        >
          A small line of in-house pieces, made to order and finished by hand at
          the studio. Each is produced on request, with a quoted lead time.
        </motion.p>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute inset-x-0 bottom-10 z-10 flex justify-start px-6 md:bottom-14 md:px-16"
      >
        <Link href="#piece-i" className="cta-rule text-chalk">
          Begin the line
        </Link>
      </motion.div>
    </section>
  );
}
