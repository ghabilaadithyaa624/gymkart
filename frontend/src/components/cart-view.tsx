"use client";

import { ArrowRight, Lock, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, formatINR, sellingPrice } from "@/lib/money";
import type { Product } from "@/lib/shop";
import { useGK } from "@/lib/store";
import { EmptyState, QtyStepper, Stars } from "./ui";

type Line = { productId: string; quantity: number; product: Product };

export default function CartView({ isAuthed, initialItems }: { isAuthed: boolean; initialItems: Line[] | null }) {
  const router = useRouter();
  const toast = useGK((s) => s.toast);
  const refreshCounts = useGK((s) => s.refreshCounts);
  const guestCart = useGK((s) => s.guestCart);
  const setGuestQty = useGK((s) => s.setGuestQty);
  const [items, setItems] = useState<Line[] | null>(initialItems);
  const [mounted, setMounted] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Guest mode: resolve ids → products
  useEffect(() => {
    if (isAuthed || !mounted) return;
    const ids = guestCart.map((g) => `${g.productId}:${g.qty}`).sort().join("|");
    void (async () => {
      if (!guestCart.length) { setItems([]); return; }
      try {
        const res = await fetch(`/api/products?ids=${guestCart.map((g) => g.productId).join(",")}`, { cache: "no-store" });
        const body = await res.json();
        const byId = new Map((body.items as Product[]).map((p) => [p.id, p]));
        setItems(
          guestCart
            .map((g) => ({ productId: g.productId, quantity: g.qty, product: byId.get(g.productId)! }))
            .filter((l) => Boolean(l.product)),
        );
      } catch { setItems([]); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, mounted, guestCart.map((g) => `${g.productId}:${g.qty}`).sort().join("|")]);

  const totals = useMemo(() => {
    const list = items ?? [];
    const subtotal = list.reduce((a, l) => a + sellingPrice(l.product) * l.quantity, 0);
    const savings = list.reduce((a, l) => a + (l.product.price - sellingPrice(l.product)) * l.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
    return { subtotal, savings, shipping, total: subtotal + shipping, count: list.reduce((a, l) => a + l.quantity, 0) };
  }, [items]);

  async function changeQty(productId: string, qty: number) {
    if (!isAuthed) {
      setGuestQty(productId, Math.min(qty, 10));
      return;
    }
    setBusyId(productId);
    // optimistic local update
    setItems((cur) => cur?.map((l) => (l.productId === productId ? { ...l, quantity: Math.max(0, Math.min(qty, 10)) } : l)).filter((l) => l.quantity > 0) ?? null);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty }),
      });
      const body = await res.json();
      if (res.ok) {
        setItems(body.items);
      } else {
        toast({ title: "Couldn't update quantity", tone: "warn" });
      }
      refreshCounts();
    } catch {
      toast({ title: "Network error", tone: "warn" });
    } finally {
      setBusyId(null);
    }
  }

  const list = mounted ? items : initialItems;

  if (mounted && list && list.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<ShoppingCart size={30} />}
          title="Your cart is empty"
          desc="Fill it with India's favourite fitness gear — start with what everyone else is buying."
          href="/products?sort=bestseller"
          cta="Browse Bestsellers"
        />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card skeleton h-32 w-full" />)}
      </div>
    );
  }

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3.5">
        {!isAuthed && (
          <div className="card flex flex-wrap items-center gap-3 border-flame/25 bg-flame-tint/60 px-4.5 py-3.5 p-4">
            <Lock size={16} className="shrink-0 text-flame" />
            <p className="text-sm font-medium">Your cart is saved locally. <Link href="/login?next=/cart" className="font-bold text-flame underline underline-offset-2">Sign in</Link> to sync it to your account.</p>
          </div>
        )}
        {list.map((line) => {
          const p = line.product;
          const out = p.stockQty <= 0;
          return (
            <div key={line.productId} className={`card flex gap-4 p-4 ${busyId === line.productId ? "opacity-70" : ""}`}>
              <Link href={`/product/${p.id}`} className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-sand sm:w-28">
                <img src={p.images[0]} alt={p.name} className={`h-full w-full object-cover ${out ? "grayscale" : ""}`} />
                {out && <span className="absolute inset-x-0 bottom-0 bg-chili/90 py-0.5 text-center text-[9px] font-bold text-white uppercase">Out of stock</span>}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold tracking-widest text-mute uppercase">{p.brand}</span>
                    <Link href={`/product/${p.id}`} className="mt-0.5 line-clamp-2 block text-sm leading-snug font-semibold hover:text-flame">{p.name}</Link>
                    <div className="mt-1"><Stars rating={p.ratingAvg} /></div>
                  </div>
                  <button
                    onClick={() => {
                      changeQty(line.productId, 0);
                      toast({ title: "Removed from cart", tone: "info" });
                    }}
                    aria-label="Remove item"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mute transition-colors hover:bg-chili/10 hover:text-chili"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <QtyStepper qty={line.quantity} small onChange={(q) => changeQty(line.productId, q)} />
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">{formatINR(sellingPrice(p) * line.quantity)}</div>
                    {p.discountPrice && (
                      <div className="text-[11px] text-mute">
                        <span className="line-through">{formatINR(p.price * line.quantity)}</span>
                        <span className="ml-1.5 font-semibold text-leaf-dark">save {formatINR((p.price - p.discountPrice) * line.quantity)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <aside className="card sticky top-32 p-5">
        <h3 className="font-display text-base font-bold">Price details</h3>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between"><dt className="text-mute">Price ({totals.count} item{totals.count > 1 ? "s" : ""})</dt><dd className="font-semibold tabular-nums">{formatINR(totals.subtotal + totals.savings)}</dd></div>
          <div className="flex justify-between text-leaf-dark"><dt>You save</dt><dd className="font-semibold tabular-nums">− {formatINR(totals.savings)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-mute">Delivery</dt>
            <dd className="font-semibold">{totals.shipping === 0 ? <span className="text-leaf-dark">FREE</span> : formatINR(totals.shipping)}</dd>
          </div>
          {totals.shipping > 0 && (
            <p className="rounded-lg bg-flame-tint px-3 py-2 text-xs font-semibold text-flame-dark">
              Add {formatINR(FREE_SHIPPING_THRESHOLD - totals.subtotal)} more for free delivery
            </p>
          )}
          <div className="flex justify-between border-t border-line pt-3 font-display text-lg font-bold">
            <dt>Total</dt><dd className="tabular-nums">{formatINR(totals.total)}</dd>
          </div>
        </dl>
        <button onClick={() => router.push(isAuthed ? "/checkout" : "/login?next=/checkout")} className="btn-primary mt-5 w-full">
          Checkout <ArrowRight size={16} />
        </button>
        <p className="mt-3 text-center text-[11px] text-mute">COD available · UPI · Cards · Netbanking</p>
      </aside>
    </div>
  );
}
