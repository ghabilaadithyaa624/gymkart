"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, SlidersHorizontal, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  basePath: string;
  current: Record<string, string>;
  brands: string[];
  roots: Array<{ name: string; slug: string }>;
  subcats: Array<{ name: string; slug: string }>;
  categorySlug?: string;
  resultCount: number;
};

const SORTS = [
  { key: "bestseller", label: "Bestseller" },
  { key: "price_low", label: "Price: Low to High" },
  { key: "price_high", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
  { key: "newest", label: "Newest" },
];

export default function FilterPanel(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="sticky top-[4.15rem] z-40 -mx-4 mb-4 flex items-center gap-2 border-b border-line bg-sand/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="btn-ghost !py-2 !text-xs">
          <SlidersHorizontal size={14} /> Filters
        </button>
        <span className="text-xs font-semibold text-mute">{props.resultCount} products</span>
        <div className="ml-auto">
          <SortSelect current={props.current} basePath={props.basePath} compact />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-32 hidden w-60 shrink-0 self-start lg:block">
        <PanelBody {...props} />
      </aside>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 max-h-[82svh] overflow-y-auto rounded-t-2xl bg-white"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-3.5">
                <span className="font-display text-base font-bold">Filters</span>
                <button onClick={() => setOpen(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full bg-sand">
                  <X size={17} />
                </button>
              </div>
              <div className="px-5 pb-28">
                <PanelBody {...props} bare />
              </div>
              <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white p-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}>
                <button onClick={() => setOpen(false)} className="btn-primary w-full">
                  Show {props.resultCount} results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function buildUrl(basePath: string, current: Record<string, string>, patch: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries({ ...current, ...patch }).forEach(([k, v]) => {
    if (v != null && v !== "") sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export function SortSelect({ current, basePath, compact }: { current: Record<string, string>; basePath: string; compact?: boolean }) {
  const router = useRouter();
  return (
    <select
      value={current.sort ?? "bestseller"}
      onChange={(e) => router.push(buildUrl(basePath, current, { sort: e.target.value === "bestseller" ? undefined : e.target.value }))}
      className={`rounded-xl border border-line bg-white text-sm font-semibold outline-none focus:border-flame ${compact ? "px-2.5 py-2 text-xs" : "px-3.5 py-2.5"}`}
      aria-label="Sort products"
    >
      {SORTS.map((s) => (
        <option key={s.key} value={s.key}>{s.label}</option>
      ))}
    </select>
  );
}

function PanelBody(props: Props & { bare?: boolean }) {
  const { basePath, current, brands, roots, subcats, categorySlug } = props;
  const router = useRouter();
  const activeBrands = (current.brands ?? "").split(",").filter(Boolean);
  const [minP, setMinP] = useState(current.minPrice ?? "");
  const [maxP, setMaxP] = useState(current.maxPrice ?? "");

  const toggleBrand = (b: string) => {
    const next = activeBrands.includes(b) ? activeBrands.filter((x) => x !== b) : [...activeBrands, b];
    router.push(buildUrl(basePath, current, { brands: next.length ? next.join(",") : undefined }));
  };

  const hasFilters = Boolean(current.brands || current.minPrice || current.maxPrice || current.minRating || current.sort);

  return (
    <div className={props.bare ? "space-y-7 pt-4" : "card space-y-0 divide-y divide-line overflow-hidden"}>
      {/* Categories */}
      <Block title="Category" bare={props.bare}>
        <Link
          href={buildUrl("/products", current, {})}
          className={`block text-sm font-medium ${!categorySlug && basePath === "/products" ? "text-flame" : "text-mute hover:text-ink"}`}
        >
          All products
        </Link>
        {roots.map((c) => (
          <div key={c.slug}>
            <Link
              href={buildUrl(`/products/${c.slug}`, current, {})}
              className={`block text-sm font-medium ${categorySlug === c.slug ? "text-flame" : "text-mute hover:text-ink"}`}
            >
              {c.name}
            </Link>
            {categorySlug === c.slug &&
              subcats.map((s) => (
                <Link
                  key={s.slug}
                  href={buildUrl(`/products/${s.slug}`, current, {})}
                  className="mt-1.5 ml-3 block border-l-2 border-line pl-2 text-[13px] text-mute hover:border-flame hover:text-ink"
                >
                  {s.name}
                </Link>
              ))}
          </div>
        ))}
      </Block>

      {/* Price */}
      <Block title="Price (₹)" bare={props.bare}>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(buildUrl(basePath, current, { minPrice: minP || undefined, maxPrice: maxP || undefined }));
          }}
        >
          <input value={minP} onChange={(e) => setMinP(e.target.value.replace(/\D/g, ""))} placeholder="Min" inputMode="numeric" className="input !px-3 !py-2 !text-xs" />
          <span className="text-mute">–</span>
          <input value={maxP} onChange={(e) => setMaxP(e.target.value.replace(/\D/g, ""))} placeholder="Max" inputMode="numeric" className="input !px-3 !py-2 !text-xs" />
          <button className="rounded-lg bg-flame px-3 py-2 text-xs font-bold text-white">Go</button>
        </form>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[["", "999", "Under ₹999"], ["999", "2999", "₹999–₹2,999"], ["2999", "", "Above ₹2,999"]].map(([lo, hi, label]) => {
            const active = current.minPrice === lo && current.maxPrice === hi && (lo || hi);
            return (
              <button
                key={label}
                onClick={() => {
                  setMinP(lo); setMaxP(hi);
                  router.push(buildUrl(basePath, current, { minPrice: lo || undefined, maxPrice: hi || undefined }));
                }}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${active ? "border-flame bg-flame-tint text-flame" : "border-line text-mute hover:border-flame/60"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Block>

      {/* Brand */}
      <Block title="Brand" bare={props.bare}>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2.5 text-sm text-mute hover:text-ink">
              <input
                type="checkbox"
                checked={activeBrands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="h-4 w-4 rounded border-line accent-flame"
              />
              {b}
            </label>
          ))}
        </div>
      </Block>

      {/* Rating */}
      <Block title="Minimum rating" bare={props.bare}>
        {[["4", "4★ & above"], ["3", "3★ & above"]].map(([v, label]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2.5 text-sm text-mute hover:text-ink">
            <input
              type="radio"
              name="minrating"
              checked={current.minRating === v}
              onChange={() => router.push(buildUrl(basePath, current, { minRating: v }))}
              className="h-4 w-4 accent-flame"
            />
            <span className="inline-flex items-center gap-1">{label.replace("★", "")}<Star size={12} className="fill-amber-400 text-amber-400" />& above</span>
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mute hover:text-ink">
          <input
            type="radio"
            name="minrating"
            checked={!current.minRating}
            onChange={() => router.push(buildUrl(basePath, current, { minRating: undefined }))}
            className="h-4 w-4 accent-flame"
          />
          Any rating
        </label>
      </Block>

      {hasFilters && (
        <div className={props.bare ? "" : "p-4"}>
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-xs font-bold text-chili">
            <RotateCcw size={13} /> Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}

function Block({ title, children, bare }: { title: string; children: React.ReactNode; bare?: boolean }) {
  return (
    <div className={bare ? "" : "p-4"}>
      <h4 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-mute uppercase">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
