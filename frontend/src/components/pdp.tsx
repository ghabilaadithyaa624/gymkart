"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Minus, Plus, Send, ShoppingCart, Star, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR, sellingPrice } from "@/lib/money";
import type { Product } from "@/lib/shop";
import { useGK } from "@/lib/store";
import { AddToCartButton, WishlistButton } from "./product-actions";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const list = images.length ? images : [""];
  return (
    <div>
      <div className="card relative aspect-[4/3] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={list[idx]}
            src={list[idx]}
            alt={`${name} — image ${idx + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2.5">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative aspect-[4/3] w-20 overflow-hidden rounded-lg border-2 transition-all ${i === idx ? "border-flame" : "border-transparent opacity-60 hover:opacity-100"}`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const user = useGK((s) => s.user);
  const addToCart = useGK((s) => s.addToCart);
  const [buying, setBuying] = useState(false);
  const out = product.stockQty <= 0;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold tracking-wide text-mute uppercase">Qty</span>
        <div className="inline-flex items-center rounded-xl border border-line bg-white">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-mute hover:text-flame" aria-label="Decrease quantity"><Minus size={15} /></button>
          <span className="w-10 text-center font-display font-bold tabular-nums">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(out ? 1 : Math.min(q + 1, product.stockQty, 10)))} className="grid h-10 w-10 place-items-center text-mute hover:text-flame" aria-label="Increase quantity"><Plus size={15} /></button>
        </div>
        {!out && product.stockQty < 10 && <span className="text-xs font-bold text-chili">Only {product.stockQty} left!</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <AddToCartButton productId={product.id} stockQty={product.stockQty} qty={qty} variant="ghost" />
        <button
          disabled={out || buying}
          onClick={async () => {
            setBuying(true);
            await addToCart(product.id, qty);
            setBuying(false);
            router.push(user ? "/checkout" : "/login?next=/checkout");
          }}
          className="btn-primary disabled:opacity-50"
        >
          <Zap size={16} /> {buying ? "Working…" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export function ReviewForm({ productId, canReview, loggedIn }: { productId: string; canReview: boolean; loggedIn: boolean }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  if (!loggedIn) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-3 bg-sand p-5">
        <p className="text-sm font-semibold">Bought this? Sign in to drop a review.</p>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary !py-2.5 !text-xs">Sign in</Link>
      </div>
    );
  }
  if (!canReview) {
    return (
      <div className="card bg-sand p-5 text-sm text-mute">
        Reviews open after purchase — this keeps every rating on GymKart verified.
      </div>
    );
  }
  if (state === "done") {
    return (
      <div className="card flex items-center gap-3 border-leaf/40 bg-leaf/5 p-5">
        <BadgeCheck className="text-leaf-dark" size={20} />
        <p className="text-sm font-semibold">Review posted — thanks for helping the community lift smarter.</p>
      </div>
    );
  }

  return (
    <form
      className="card space-y-4 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        try {
          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, rating, comment }),
          });
          const body = await res.json();
          if (!res.ok) {
            setState("error");
            setMessage(body.message ?? "Something went wrong.");
            return;
          }
          setState("done");
          router.refresh();
        } catch {
          setState("error");
          setMessage("Network error. Try again.");
        }
      }}
    >
      <h4 className="font-display text-base font-bold">Rate this product</h4>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(v)}
            aria-label={`${v} star${v > 1 ? "s" : ""}`}
            className="transition-transform hover:scale-110"
          >
            <Star size={26} className={(hover || rating) >= v ? "fill-amber-400 text-amber-400" : "text-line"} />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-mute">{["", "Poor", "Okay", "Good", "Great", "Excellent"][hover || rating]}</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="How's the quality? Would you buy it again?"
        className="input resize-none"
        required
        minLength={4}
      />
      {state === "error" && <p className="text-sm font-semibold text-chili">{message}</p>}
      <button disabled={state === "busy"} className="btn-primary !py-2.5 disabled:opacity-60">
        <Send size={15} /> {state === "busy" ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}

export function StickyMobileBar({ product }: { product: Product }) {
  return (
    <div className="fixed inset-x-0 bottom-14 z-[55] border-t border-line bg-white/97 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}>
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <div className="font-display text-lg leading-none font-bold">{formatINR(sellingPrice(product))}</div>
          {product.discountPrice && <div className="mt-0.5 text-[11px] text-mute line-through">{formatINR(product.price)}</div>}
        </div>
        <div className="flex-1">
          <AddToCartButton productId={product.id} stockQty={product.stockQty} />
        </div>
      </div>
    </div>
  );
}

export function PdpActions({ productId }: { productId: string }) {
  return <WishlistButton productId={productId} className="!h-11 !w-11 !border-line" />;
}

export function CompareNote() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-leaf-dark">
      <ShoppingCart size={13} /> Free delivery unlocked
    </span>
  );
}
