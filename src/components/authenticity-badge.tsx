"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, FlaskConical, PackageCheck, QrCode, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const VERIFICATION_POINTS = [
  {
    icon: PackageCheck,
    title: "100% Sourced from Authorized Importers / Direct Brands",
    detail: "Never sourced from unverified resellers or unknown marketplace suppliers.",
  },
  {
    icon: QrCode,
    title: "Authentic Importer Hologram & Scratch Code Verification Guide",
    detail: "Check the importer hologram, reveal the unique scratch code, and verify it on the brand’s official website or app.",
  },
  {
    icon: FlaskConical,
    title: "Third-party Lab Tested for Protein Content & Heavy Metals",
    detail: "Independently screened for declared protein content and harmful heavy metals before being approved for sale.",
  },
  {
    icon: RotateCcw,
    title: "7-Day Replacement Policy on Unsealed Items",
    detail: "Eligible unsealed items can be reported within 7 days for a replacement under GymKart’s authenticity policy.",
  },
] as const;

export default function AuthenticityBadge({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
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
        className={compact
          ? "inline-flex w-fit items-center gap-1.5 rounded-md border border-emerald-700/15 bg-emerald-50 px-2 py-1 text-left text-[10px] font-bold text-emerald-800 transition-colors hover:border-emerald-700/30 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          : "group inline-flex w-fit items-center gap-2.5 rounded-xl border border-emerald-800/15 bg-gradient-to-r from-emerald-50 to-slate-50 px-3 py-2 text-left shadow-[0_5px_16px_rgba(6,78,59,.06)] transition-all hover:border-emerald-700/30 hover:shadow-[0_7px_20px_rgba(6,78,59,.11)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={`${compact ? "contents" : "grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-800 text-white"}`}>
          <ShieldCheck size={compact ? 13 : 16} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <span>
          <span className={`block font-bold ${compact ? "" : "text-xs text-slate-800"}`}>Authenticity Guaranteed</span>
          {!compact && <span className="mt-0.5 block text-[9px] font-semibold tracking-[0.12em] text-emerald-700 uppercase">Verified genuine supplement</span>}
        </span>
        {!compact && <BadgeCheck size={15} className="ml-1 text-emerald-700 transition-transform group-hover:scale-110" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 backdrop-blur-[3px] sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, y: 56, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              className="max-h-[88svh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-6">
                <div className="flex gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-800 text-white shadow-[0_7px_18px_rgba(6,78,59,.22)]"><ShieldCheck size={22} /></span>
                  <div>
                    <h2 id={titleId} className="font-display text-lg font-bold text-slate-900">Authenticity Guaranteed</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Our four-point supplement verification promise</p>
                  </div>
                </div>
                <button ref={closeButtonRef} onClick={() => setOpen(false)} aria-label="Close authenticity details" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-600"><X size={17} /></button>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <div className="rounded-xl border border-emerald-800/15 bg-emerald-50/70 px-4 py-3 text-xs leading-relaxed text-emerald-950">
                  Every supplement is checked from source to seal before it is listed on GymKart.
                </div>

                <ol className="mt-5 space-y-3">
                  {VERIFICATION_POINTS.map(({ icon: Icon, title, detail }, index) => (
                    <li key={title} className="flex gap-3.5 rounded-xl border border-slate-200 p-4">
                      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
                        <Icon size={17} aria-hidden="true" />
                        <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-[8px] font-extrabold ring-2 ring-white">{index + 1}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><Check size={13} className="text-emerald-700" strokeWidth={3} /> {title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-500">{detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                <button onClick={() => setOpen(false)} className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Got it</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
