import { Check, CheckCircle2, Circle, CreditCard, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReorderButton } from "@/components/account-widgets";
import { EmptyState } from "@/components/ui";
import { StatusPill } from "@/app/account/page";
import { getSessionUser } from "@/lib/auth";
import { formatDate, formatINR } from "@/lib/money";
import { getOrders } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Orders — GymKart" };

const STEPS = ["Placed", "Paid", "Shipped", "Delivered"];

function stepIndex(status: string, method: string): number {
  if (status === "delivered") return 3;
  if (status === "shipped") return 2;
  if (status === "paid") return 1;
  return 0; // pending (COD)
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");
  const sp = await searchParams;
  const placedId = typeof sp.placed === "string" ? sp.placed : null;
  const orders = await getOrders(user.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">My Orders</h1>

      {placedId && (
        <div className="card mt-5 flex items-center gap-3.5 border-leaf/40 bg-leaf/5 p-5 animate-fade-up">
          <CheckCircle2 size={26} className="shrink-0 text-leaf-dark" />
          <div>
            <div className="font-display text-base font-bold">Order placed successfully!</div>
            <p className="text-sm text-mute">
              Order #{placedId.slice(0, 8).toUpperCase()} · Estimated delivery by{" "}
              <span className="font-semibold text-ink">{formatDate(new Date(Date.now() + 5 * 86400000))}</span>
            </p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Package size={30} />}
            title="No orders yet"
            desc="Your fitness journey starts with the first order — browse the bestsellers."
            href="/products?sort=bestseller"
            cta="Start shopping"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {orders.map((o) => {
            const idx = stepIndex(o.status, o.paymentMethod);
            const cancelled = o.status === "cancelled";
            return (
              <article key={o.id} className="card overflow-hidden">
                {/* header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sand/50 px-4.5 p-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
                    <div>
                      <div className="text-[10.5px] font-bold tracking-wider text-mute uppercase">Order</div>
                      <div className="font-display font-bold">#{o.id.slice(0, 8).toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-bold tracking-wider text-mute uppercase">Placed on</div>
                      <div className="font-semibold">{formatDate(o.createdAt!)}</div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-bold tracking-wider text-mute uppercase">Total</div>
                      <div className="font-semibold tabular-nums">{formatINR(o.totalAmount)}</div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute">
                      <CreditCard size={13} /> {o.paymentMethod === "cod" ? "Cash on Delivery" : "Online (UPI/Card)"}
                    </div>
                  </div>
                  <StatusPill status={o.status} />
                </div>

                {/* timeline */}
                <div className="px-4.5 p-4 pt-5 sm:px-5">
                  {cancelled ? (
                    <div className="rounded-lg bg-chili/10 px-4 py-2.5 text-sm font-semibold text-chili">This order was cancelled.</div>
                  ) : (
                    <div className="flex items-center">
                      {STEPS.map((s, i) => {
                        const done = i <= idx;
                        return (
                          <div key={s} className="flex flex-1 items-center last:flex-none">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${done ? "border-leaf bg-leaf text-white" : "border-line text-mute"}`}>
                                {done ? <Check size={12} strokeWidth={3} /> : <Circle size={8} />}
                              </span>
                              <span className={`text-[10px] font-bold whitespace-nowrap ${done ? "text-ink" : "text-mute"}`}>
                                {s === "Paid" && o.paymentMethod === "cod" ? "COD due" : s}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`mx-1.5 mb-5 h-0.5 flex-1 rounded-full ${i < idx ? "bg-leaf" : "bg-line"}`} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* items */}
                <div className="space-y-3 px-4.5 p-4 sm:px-5">
                  {o.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3.5">
                      <Link href={`/product/${item.productId}`} className="shrink-0">
                        <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg border border-line object-cover" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/product/${item.productId}`} className="line-clamp-1 text-sm font-semibold hover:text-flame">{item.name}</Link>
                        <div className="mt-0.5 text-xs text-mute">Qty {item.quantity} · {formatINR(item.priceAtPurchase)} each</div>
                      </div>
                      <div className="text-sm font-bold tabular-nums">{formatINR(item.priceAtPurchase * item.quantity)}</div>
                    </div>
                  ))}
                </div>

                {/* footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4.5 p-4 sm:px-5">
                  <div className="flex items-center gap-2 text-xs text-mute">
                    <MapPin size={13} className="text-flame" />
                    {o.address.line1}, {o.address.city}, {o.address.state} — {o.address.pincode}
                  </div>
                  <ReorderButton items={o.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
