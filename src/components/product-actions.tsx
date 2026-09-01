"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useGK } from "@/lib/store";

export function AddToCartButton({
  productId,
  stockQty = 1,
  qty = 1,
  variant = "primary",
  label = "Add to Cart",
  className = "",
}: {
  productId: string;
  stockQty?: number;
  qty?: number;
  variant?: "primary" | "ghost" | "mini";
  label?: string;
  className?: string;
}) {
  const addToCart = useGK((s) => s.addToCart);
  const toast = useGK((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const out = stockQty <= 0;

  return (
    <button
      disabled={busy || out}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (out) {
          toast({ title: "Restock alert on", desc: "We'll notify you when this is back.", tone: "info" });
          return;
        }
        setBusy(true);
        await addToCart(productId, qty);
        setBusy(false);
      }}
      className={
        out
          ? `inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mute/10 px-4 py-2.5 font-display text-sm font-semibold text-mute ${className}`
          : variant === "mini"
            ? `inline-flex items-center justify-center gap-1.5 rounded-lg bg-flame px-3 py-2 font-display text-xs font-bold text-white transition-all hover:bg-flame-dark active:scale-95 disabled:opacity-60 ${className}`
            : variant === "ghost"
              ? `btn-ghost w-full disabled:opacity-60 ${className}`
              : `btn-primary w-full disabled:opacity-60 ${className}`
      }
    >
      <ShoppingCart size={variant === "mini" ? 14 : 16} />
      {out ? "Notify Me" : busy ? "Adding…" : label}
    </button>
  );
}

export function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const user = useGK((s) => s.user);
  const wishlistIds = useGK((s) => s.wishlistIds);
  const setWishlistIds = useGK((s) => s.setWishlistIds);
  const toast = useGK((s) => s.toast);
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const saved = wishlistIds.includes(productId);

  return (
    <button
      disabled={busy}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          toast({ title: "Sign in to save items", desc: "Your wishlist syncs across devices.", tone: "info" });
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setBusy(true);
        // optimistic
        setWishlistIds(saved ? wishlistIds.filter((i) => i !== productId) : [...wishlistIds, productId]);
        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          const body = await res.json();
          setWishlistIds(body.items.map((i: { product: { id: string } }) => i.product.id));
          toast({ title: body.saved ? "Saved to wishlist" : "Removed from wishlist", tone: body.saved ? "ok" : "info", href: body.saved ? "/wishlist" : undefined, hrefLabel: "View" });
        } catch {
          setWishlistIds(wishlistIds);
        } finally {
          setBusy(false);
        }
      }}
      className={`grid h-9 w-9 place-items-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition-all active:scale-90 ${
        saved ? "border-flame/30 text-flame" : "border-line text-mute hover:text-flame"
      } ${className}`}
    >
      <Heart size={17} className={saved ? "fill-flame text-flame" : ""} />
    </button>
  );
}
