"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

// Minimal confirmation dialog used before any irreversible action
// (sign-out, destructive edits, etc.). Dark panel on a dark backdrop
// to match the site's palette; the confirm button is the primary chalk
// fill, cancel is a plain outlined button.
export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Close on Escape — the backdrop click handler covers the mouse path.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={onCancel}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md border border-chalk/15 bg-ink p-8 text-chalk shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] md:p-10"
          >
            <p
              id="confirm-dialog-title"
              className="text-[10px] uppercase tracking-[0.32em] text-chalk/55"
            >
              {title}
            </p>
            <p className="mt-5 text-[14px] leading-[1.7] text-chalk/85">
              {message}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center border border-chalk/40 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-chalk/85 transition-colors duration-500 ease-silk hover:border-chalk hover:text-chalk"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center bg-chalk px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink transition-opacity duration-500 ease-silk hover:opacity-90"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
