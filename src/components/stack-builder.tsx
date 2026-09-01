"use client";

import { Check, Layers3, Loader2, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { formatINR, sellingPrice } from "@/lib/money";
import type { Product } from "@/lib/shop";
import { useGK } from "@/lib/store";

export default function StackBuilder({ products }: { products: Product[] }) {
  const available = useMemo(() => products.filter((product) => product.stockQty > 0).slice(0, 3), [products]);
  const [selected, setSelected] = useState<string[]>(() => available.map((product) => product.id));
  const [adding, setAdding] = useState(false);
  const addToCart = useGK((state) => state.addToCart);
  const toast = useGK((state) => state.toast);

  const selectedProducts = available.filter((product) => selected.includes(product.id));
  const subtotal = selectedProducts.reduce((sum, product) => sum + sellingPrice(product), 0);
  const total = Math.round(subtotal * 0.95);
  const savings = subtotal - total;

  if (available.length < 2) return null;

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-flame/20 bg-white" aria-labelledby="stack-title">
      <div className="flex items-center justify-between gap-3 bg-ink px-4 py-3.5 text-white sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-flame"><Layers3 size={18} /></span>
          <div><h2 id="stack-title" className="font-display text-sm font-bold sm:text-base">Frequently Bought Together</h2><p className="text-[11px] text-white/55">Build your stack & save 5%</p></div>
        </div>
        <span className="rounded-full bg-leaf/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-green-300 uppercase">5% off</span>
      </div>

      <div className="divide-y divide-line px-4 sm:px-5">
        {available.map((product) => {
          const checked = selected.includes(product.id);
          return (
            <label key={product.id} className="flex cursor-pointer items-center gap-3 py-3.5">
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => setSelected((items) => checked ? items.filter((id) => id !== product.id) : [...items, product.id])}
              />
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${checked ? "border-flame bg-flame text-white" : "border-line bg-white"}`} aria-hidden="true">{checked && <Check size={13} strokeWidth={3} />}</span>
              <img src={product.images[0]} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-sand object-cover" />
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold sm:text-sm">{product.name}</span><span className="mt-0.5 block text-[10px] font-bold tracking-wider text-mute uppercase">{product.brand}</span></span>
              <span className="shrink-0 font-display text-sm font-bold">{formatINR(sellingPrice(product))}</span>
            </label>
          );
        })}
      </div>

      <div className="border-t border-line bg-sand/55 p-4 sm:p-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><span className="block text-[11px] text-mute">Bundle total ({selected.length} items)</span><span className="font-display text-xl font-bold">{formatINR(total)}</span>{subtotal > 0 && <span className="ml-2 text-xs text-mute line-through">{formatINR(subtotal)}</span>}</div>
          {savings > 0 && <span className="text-xs font-bold text-leaf-dark">You save {formatINR(savings)}</span>}
        </div>
        <button
          disabled={adding || selected.length < 2}
          onClick={async () => {
            setAdding(true);
            for (const product of selectedProducts) await addToCart(product.id, 1);
            toast({ title: "Stack added", desc: `Bundle discount of ${formatINR(savings)} applied at checkout.`, href: "/cart", hrefLabel: "View cart", tone: "ok" });
            setAdding(false);
          }}
          className="btn-primary w-full disabled:opacity-50"
        >
          {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
          {adding ? "Adding your stack…" : "Add Bundle to Cart"}
        </button>
        {selected.length < 2 && <p className="mt-2 text-center text-[11px] text-chili">Select at least 2 products to unlock the bundle offer.</p>}
      </div>
    </section>
  );
}
