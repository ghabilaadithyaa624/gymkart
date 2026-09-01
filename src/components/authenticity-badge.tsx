"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, FlaskConical, ShieldCheck, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

const POINTS = [
  { title: "Direct Brand Sourcing", detail: "Procured directly from authorised brand supply chains." },
  { title: "Batch Certificate Available", detail: "Batch-level lab documentation is available for verification." },
  { title: "Tamper-Proof Seal", detail: "Every pack is inspected for an intact factory seal before dispatch." },
];

export default function AuthenticityBadge({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex items-center text-left font-semibold text-leaf-dark transition-colors hover:text-leaf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf ${compact ? "gap-1 text-[10px]" : "gap-2 rounded-xl border border-leaf/25 bg-leaf/5 px-3.5 py-2.5 text-xs"}`}
        aria-haspopup="dialog"
      >
        <ShieldCheck size={compact ? 13 : 18} className="shrink-0" aria-hidden="true" />
        <span>{compact ? "Authenticity guaranteed" : "Authenticity Guaranteed & Lab Tested"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] grid place-items-end bg-ink/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf/10 text-leaf-dark"><FlaskConical size={23} /></span>
                <button onClick={() => setOpen(false)} aria-label="Close authenticity details" className="grid h-9 w-9 place-items-center rounded-full bg-sand text-mute hover:text-ink"><X size={17} /></button>
              </div>
              <h2 id={titleId} className="mt-4 font-display text-xl font-bold">Verified from source to seal</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-mute">GymKart verifies supplement origin, quality documentation and packaging before it reaches you.</p>
              <ul className="mt-5 space-y-3">
                {POINTS.map((point) => (
                  <li key={point.title} className="flex gap-3 rounded-xl border border-line bg-sand/50 p-3.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-white"><Check size={14} strokeWidth={3} /></span>
                    <span><span className="block text-sm font-bold">{point.title}</span><span className="mt-0.5 block text-xs leading-relaxed text-mute">{point.detail}</span></span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-leaf-dark"><BadgeCheck size={16} /> GymKart Quality Assurance</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
