"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

const SUBJECTS = [
  "The full collection",
  "A specific piece",
  "A room direction",
  "Private commission",
  "Other"
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  note: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  note: ""
};

export function AppointmentForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // No backend endpoint yet — leave this as a placeholder that resolves
    // on the client. Wire to /api/studio/appointments once that exists.
    try {
      await new Promise((r) => setTimeout(r, 400));
      setSubmitted(true);
      setForm(EMPTY);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="relative bg-ink py-24 text-chalk md:py-36"
      aria-labelledby="appointment-form-heading"
    >
      <div className="mx-auto max-w-4xl px-6 md:px-14">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] uppercase tracking-[0.38em] text-chalk/55"
          >
            Request a Visit
          </motion.p>

          <motion.h2
            id="appointment-form-heading"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-light uppercase leading-[1.1] tracking-[0.02em]"
          >
            Write to the Studio
          </motion.h2>

          <motion.span
            aria-hidden
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 block h-px w-14 origin-center bg-chalk/40"
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 max-w-xl text-[13px] leading-[1.85] text-chalk/75 md:text-[14px]"
          >
            Share a preferred day and a short note on what you&apos;d like to
            see. We respond within two working days.
          </motion.p>
        </div>

        {submitted ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-20 text-center text-[13px] uppercase tracking-[0.28em] text-chalk/80"
          >
            Thank you — your note is with the studio.
          </motion.p>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="mt-20 md:mt-24"
          >
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-14 md:gap-y-12">
              <Field
                label="Full Name"
                required
                value={form.name}
                onChange={(v) => update({ name: v })}
                type="text"
                autoComplete="name"
              />
              <Field
                label="Email"
                required
                value={form.email}
                onChange={(v) => update({ email: v })}
                type="email"
                autoComplete="email"
              />
              <Field
                label="Telephone (optional)"
                value={form.phone}
                onChange={(v) => update({ phone: v })}
                type="tel"
                autoComplete="tel"
              />
              <SelectField
                label="Subject"
                required
                value={form.subject}
                onChange={(v) => update({ subject: v })}
                options={SUBJECTS}
              />
            </div>

            <TextareaField
              label="Your Note"
              required
              value={form.note}
              onChange={(v) => update({ note: v })}
              className="mt-10 md:mt-12"
            />

            <div className="mt-14 flex flex-col-reverse items-start gap-8 md:mt-16 md:flex-row md:items-center md:justify-between">
              <p className="max-w-sm text-[10px] uppercase leading-[1.9] tracking-[0.28em] text-chalk/55">
                We respond within two working days. Studio hours: Mon – Sat,
                10 – 7.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center border border-chalk px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-chalk transition-colors duration-500 ease-silk hover:bg-chalk hover:text-ink disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Request Appointment"}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}

// --- Shared field primitives ---------------------------------------------

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-chalk/60">
        {label}
        {required && <span className="text-chalk/80"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="mt-4 w-full border-b border-chalk/25 bg-transparent pb-2 text-[14px] tracking-[0.02em] text-chalk outline-none transition-colors focus:border-chalk"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-chalk/60">
        {label}
        {required && <span className="text-chalk/80"> *</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-4 w-full appearance-none border-b border-chalk/25 bg-transparent pb-2 text-[14px] tracking-[0.02em] text-chalk outline-none transition-colors focus:border-chalk"
      >
        <option value="" className="bg-ink text-chalk">
          Select
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-ink text-chalk">
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  required = false,
  className = ""
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] uppercase tracking-[0.3em] text-chalk/60">
        {label}
        {required && <span className="text-chalk/80"> *</span>}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={5}
        className="mt-4 w-full resize-y border-b border-chalk/25 bg-transparent pb-2 text-[14px] leading-[1.7] tracking-[0.02em] text-chalk outline-none transition-colors focus:border-chalk"
      />
    </label>
  );
}
