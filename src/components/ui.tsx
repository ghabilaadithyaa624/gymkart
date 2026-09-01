"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronRight, Clock, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { discountPct, formatCount, formatINR } from "@/lib/money";
import { useGK } from "@/lib/store";

/* ---------------- Price block ---------------- */
export function Price({
  price,
  discountPrice,
  size = "md",
}: {
  price: number;
  discountPrice: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const pct = discountPct(price, discountPrice);
  const sizes = { sm: "text-base", md: "text-lg", lg: "text-[28px]" };
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-display font-bold text-ink ${sizes[size]}`}>{formatINR(discountPrice ?? price)}</span>
      {pct > 0 && (
        <>
          <span className={`text-mute line-through ${size === "lg" ? "text-base" : "text-xs"}`}>{formatINR(price)}</span>
          <span className={`font-semibold text-leaf-dark ${size === "lg" ? "text-base" : "text-xs"}`}>{pct}% off</span>
        </>
      )}
    </div>
  );
}

/* ---------------- Stars ---------------- */
export function Stars({ rating, count, size = 13 }: { rating: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-[1px] rounded-md bg-leaf px-1.5 py-[2px]">
        <span className="text-[11px] leading-none font-bold text-white tabular-nums">{rating.toFixed(1)}</span>
        <Star size={10} className="fill-white text-white" />
      </span>
      {count != null && <span className="text-xs font-medium text-mute">({formatCount(count)})</span>}
    </span>
  );
}

/* ---------------- Badge pills ---------------- */
export function BadgePill({ tag, stockQty, price, discountPrice }: { tag?: string; stockQty?: number; price?: number; discountPrice?: number | null }) {
  if (tag === "bestseller") return <span className="chip bg-flame">Bestseller</span>;
  if (tag === "new") return <span className="chip bg-azure">New</span>;
  if (tag === "flash") return <span className="chip bg-chili">Flash deal</span>;
  if (tag === "off" && price != null) {
    const pct = discountPct(price, discountPrice ?? null);
    if (pct > 0) return <span className="chip bg-leaf">{pct}% off</span>;
    return null;
  }
  if (tag === "limited" || (stockQty != null && stockQty > 0 && stockQty < 10)) {
    return <span className="chip bg-chili">Limited stock</span>;
  }
  return null;
}

/* ---------------- Countdown ---------------- */
function nextMidnight(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

export function CountdownTimer({ className }: { className?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const target = nextMidnight();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (remaining === null) return <span className={className}>—:—:—</span>;
  const s = Math.floor(remaining / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium tabular-nums ${className ?? ""}`}>
      <Clock size={13} /> {hh}:{mm}:{ss}
    </span>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionHead({ title, sub, href, hrefLabel = "View all" }: { title: string; sub?: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="hidden h-8 w-1.5 rounded-full bg-flame sm:block" />
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          {sub && <p className="mt-0.5 text-xs text-mute sm:text-sm">{sub}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-flame">
          {hrefLabel}
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon,
  title,
  desc,
  href,
  cta,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center px-8 py-14 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-flame-tint text-flame">{icon}</div>
      <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-mute">{desc}</p>
      <Link href={href} className="btn-primary mt-6">
        {cta} <ArrowRight size={15} />
      </Link>
    </div>
  );
}

/* ---------------- Toasts ---------------- */
export function ToastHost() {
  const toasts = useGK((s) => s.toasts);
  const dismiss = useGK((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-20 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-white p-3.5 text-left shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:w-auto"
          >
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${t.tone === "warn" ? "bg-chili/10 text-chili" : t.tone === "info" ? "bg-azure/10 text-azure" : "bg-leaf/10 text-leaf-dark"}`}>
              {t.tone === "warn" ? <Clock size={16} /> : t.tone === "info" ? <ShoppingBag size={16} /> : <CheckCircle2 size={16} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{t.title}</span>
              {t.desc && <span className="block truncate text-xs text-mute">{t.desc}</span>}
            </span>
            {t.href && (
              <Link href={t.href} onClick={() => dismiss(t.id)} className="shrink-0 rounded-lg bg-flame px-3 py-1.5 text-xs font-bold text-white">
                {t.hrefLabel ?? "View"}
              </Link>
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Qty stepper ---------------- */
export function QtyStepper({
  qty,
  onChange,
  small,
}: {
  qty: number;
  onChange: (q: number) => void;
  small?: boolean;
}) {
  return (
    <div className={`inline-flex items-center rounded-lg border border-line bg-white ${small ? "h-8" : "h-10"}`}>
      <button onClick={() => onChange(qty - 1)} className="grid h-full w-8 place-items-center text-lg font-bold text-mute transition-colors hover:text-flame" aria-label="Decrease">
        −
      </button>
      <span className={`w-8 text-center font-bold tabular-nums ${small ? "text-sm" : "text-[15px]"}`}>{qty}</span>
      <button onClick={() => onChange(qty + 1)} className="grid h-full w-8 place-items-center text-lg font-bold text-mute transition-colors hover:text-flame" aria-label="Increase">
        +
      </button>
    </div>
  );
}
