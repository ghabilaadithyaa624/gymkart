"use client";

import { Check, Loader2, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatINR, sellingPrice } from "@/lib/money";
import type { Product } from "@/lib/shop";
import { useGK } from "@/lib/store";

type BundleCardProps = {
  products: Product[];
};

type AddState = "idle" | "adding" | "added" | "error";

export default function BundleCard({ products }: BundleCardProps) {
  const bundle = products.filter((product) => product.stockQty > 0).slice(0, 3);
  const [addState, setAddState] = useState<AddState>("idle");
  const addToCart = useGK((state) => state.addToCart);
  const toast = useGK((state) => state.toast);

  if (bundle.length !== 3) return null;

  const regularTotal = bundle.reduce((sum, product) => sum + sellingPrice(product), 0);
  const bundleTotal = Math.round(regularTotal * 0.95);
  const saving = regularTotal - bundleTotal;

  async function addBundle() {
    // Update immediately so the CTA responds before network requests finish.
    setAddState("adding");
    try {
      for (const product of bundle) await addToCart(product.id, 1, { silent: true });
      setAddState("added");
      toast({
        title: "Fitness bundle added",
        desc: `Your 5% bundle saving is ${formatINR(saving)}.`,
        href: "/cart",
        hrefLabel: "View cart",
        tone: "ok",
      });
    } catch {
      setAddState("error");
      toast({ title: "Bundle could not be added", desc: "Please try again.", tone: "warn" });
    }
  }

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-flame/20 bg-white" aria-labelledby="bundle-card-title">
      <div className="flex items-center justify-between gap-3 bg-ink px-4 py-4 text-white sm:px-5">
        <div>
          <h2 id="bundle-card-title" className="font-display text-sm font-bold sm:text-base">Frequently Bought Together</h2>
          <p className="mt-0.5 text-[11px] text-white/55">Complete your stack and save</p>
        </div>
        <span className="shrink-0 rounded-full bg-leaf/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-green-300 uppercase">Bundle −5%</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-1 sm:gap-3">
          {bundle.map((product, index) => (
            <div key={product.id} className="contents">
              {index > 0 && (
                <span className="mt-9 grid h-6 w-6 place-items-center rounded-full bg-sand text-mute" aria-hidden="true"><Plus size={14} /></span>
              )}
              <Link href={`/product/${product.id}`} className="group min-w-0 text-center">
                <div className="mx-auto aspect-square w-full max-w-24 overflow-hidden rounded-xl border border-line bg-sand">
                  {/* Catalog images are remote and intentionally use the store's existing unoptimized image strategy. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images[0]} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <span className="mt-2 line-clamp-2 block text-[10px] leading-snug font-semibold group-hover:text-flame sm:text-xs">{product.name}</span>
                <span className="mt-1 block font-display text-xs font-bold sm:text-sm">{formatINR(sellingPrice(product))}</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs text-mute">All 3 items</span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold">{formatINR(bundleTotal)}</span>
              <span className="text-sm text-mute line-through">{formatINR(regularTotal)}</span>
              <span className="text-xs font-bold text-leaf-dark">Save {formatINR(saving)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={addBundle}
            disabled={addState === "adding" || addState === "added"}
            className={`btn-primary min-w-52 disabled:opacity-100 ${addState === "added" ? "!bg-leaf-dark" : ""}`}
          >
            {addState === "adding" ? <Loader2 size={16} className="animate-spin" /> : addState === "added" ? <Check size={16} /> : <ShoppingCart size={16} />}
            {addState === "adding" ? "Adding 3 Items…" : addState === "added" ? "3 Items Added" : addState === "error" ? "Try Adding Again" : "Add 3 Items to Cart"}
          </button>
        </div>
      </div>
    </section>
  );
}
