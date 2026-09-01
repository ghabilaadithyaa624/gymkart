"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Flame, Truck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatCount } from "@/lib/money";
import type { Product } from "@/lib/shop";
import { AddToCartButton, WishlistButton } from "./product-actions";
import { BadgePill, Price, Stars } from "./ui";

export default function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const [quick, setQuick] = useState(false);
  const out = product.stockQty <= 0;
  const hot = product.sold >= 1500;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={`/product/${product.id}`}
          className="card group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
        >
          {/* Image zone */}
          <div className="relative aspect-[4/3] overflow-hidden bg-sand">
            <img
              src={product.images[0]}
              alt={`${product.name} — buy online in India on GymKart`}
              loading={priority ? "eager" : "lazy"}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${out ? "opacity-60 grayscale-[0.4]" : ""}`}
            />
            {/* badge stack */}
            <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
              {product.badgeTags.includes("bestseller") && <BadgePill tag="bestseller" />}
              {product.badgeTags.includes("new") && <BadgePill tag="new" />}
              {product.badgeTags.includes("flash") && <BadgePill tag="flash" />}
              {(product.badgeTags.includes("limited") || (product.stockQty > 0 && product.stockQty < 10)) && <BadgePill tag="limited" />}
              <BadgePill tag="off" price={product.price} discountPrice={product.discountPrice} />
            </div>
            {/* hover actions */}
            <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
              <WishlistButton productId={product.id} />
              <button
                aria-label="Quick view"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuick(true);
                }}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/95 text-mute shadow-sm backdrop-blur transition-colors hover:text-flame"
              >
                <Eye size={17} />
              </button>
            </div>
            {out && (
              <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1.5 text-center text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                Out of stock — restocking soon
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1.5 p-3.5">
            <span className="text-[10.5px] font-bold tracking-widest text-mute uppercase">{product.brand}</span>
            <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-ink">{product.name}</h3>
            <Stars rating={product.ratingAvg} count={product.ratingCount} />
            {hot && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-flame-dark">
                <Flame size={11} /> {formatCount(product.sold)} bought this month
              </span>
            )}
            <div className="mt-auto pt-1.5">
              <Price price={product.price} discountPrice={product.discountPrice} />
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-mute">
                  <Truck size={12} className={sellingFree(product) ? "text-leaf-dark" : ""} />
                  {sellingFree(product) ? "Free delivery" : "Delivery at ₹49"}
                </span>
                {!out && (
                  <span className="hidden sm:block">
                    <AddToCartButton productId={product.id} variant="mini" label="Add" />
                  </span>
                )}
              </div>
              <span className="mt-2.5 block sm:hidden">
                <AddToCartButton productId={product.id} stockQty={product.stockQty} className="!py-2 text-xs" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Quick view modal */}
      <AnimatePresence>
        {quick && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-ink/45 p-4 backdrop-blur-sm"
            onClick={() => setQuick(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-lg overflow-hidden"
            >
              <div className="relative aspect-[16/9] bg-sand">
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                <button onClick={() => setQuick(false)} aria-label="Close" className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <span className="text-[10.5px] font-bold tracking-widest text-mute uppercase">{product.brand}</span>
                <h3 className="mt-1 font-display text-lg leading-snug font-bold">{product.name}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <Stars rating={product.ratingAvg} count={product.ratingCount} />
                </div>
                <p className="mt-2.5 line-clamp-2 text-sm text-mute">{product.description}</p>
                <div className="mt-3.5">
                  <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2.5">
                  <AddToCartButton productId={product.id} stockQty={product.stockQty} />
                  <Link href={`/product/${product.id}`} className="btn-ghost" onClick={() => setQuick(false)}>
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function sellingFree(p: Product) {
  return (p.discountPrice ?? p.price) >= 999;
}
