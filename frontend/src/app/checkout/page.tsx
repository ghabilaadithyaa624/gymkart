import { redirect } from "next/navigation";
import CheckoutForm from "@/components/checkout-form";
import { getSessionUser } from "@/lib/auth";
import { getCart, getLastAddress } from "@/lib/shop";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, formatINR, sellingPrice } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout — GymKart" };

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/checkout");
  const items = await getCart(user.id);
  if (items.length === 0) redirect("/cart");
  const lastAddress = await getLastAddress(user.id);

  const subtotal = items.reduce((a, l) => a + sellingPrice(l.product) * l.quantity, 0);
  const savings = items.reduce((a, l) => a + (l.product.price - sellingPrice(l.product)) * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Checkout</h1>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <CheckoutForm prefill={lastAddress} />

        {/* Order summary */}
        <aside className="card sticky top-32 p-5">
          <h3 className="font-display text-base font-bold">Order summary</h3>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((l) => (
              <div key={l.productId} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={l.product.images[0]} alt={l.product.name} className="h-12 w-12 rounded-lg border border-line object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[9px] font-bold text-white">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{l.product.name}</div>
                  <div className="text-[11px] text-mute">{l.product.brand}</div>
                </div>
                <div className="text-xs font-bold tabular-nums">{formatINR(sellingPrice(l.product) * l.quantity)}</div>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd className="font-semibold tabular-nums">{formatINR(subtotal)}</dd></div>
            {savings > 0 && <div className="flex justify-between text-leaf-dark"><dt>Total savings</dt><dd className="font-semibold tabular-nums">− {formatINR(savings)}</dd></div>}
            <div className="flex justify-between">
              <dt className="text-mute">Delivery</dt>
              <dd className="font-semibold">{shipping === 0 ? <span className="text-leaf-dark">FREE</span> : formatINR(SHIPPING_FEE)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-display text-lg font-bold">
              <dt>Payable</dt><dd className="tabular-nums">{formatINR(subtotal + shipping)}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-lg bg-sand px-3 py-2 text-center text-[11px] text-mute">
            Payments are processed in demo mode — no real charge occurs.
          </p>
        </aside>
      </div>
    </main>
  );
}
