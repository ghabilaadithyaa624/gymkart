import { Heart, MapPin, Package, ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoalEditor, LogoutButton } from "@/components/account-widgets";
import { getSessionUser } from "@/lib/auth";
import { GOALS } from "@/lib/money";
import { getOrders } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account — GymKart" };

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const orders = await getOrders(user.id);
  const goalLabel = GOALS.find((g) => g.key === user.fitnessGoal)?.label ?? "Not set";
  const delivered = orders.filter((o) => o.status === "delivered").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">My Account</h1>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          {/* Profile */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-flame to-flame-dark p-5 text-white">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 font-display text-2xl font-bold backdrop-blur">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-bold">{user.name}</div>
                  <div className="truncate text-sm text-white/80">{user.email}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-line text-center">
              {[
                [String(orders.length), "Orders"],
                [String(delivered), "Delivered"],
                [goalLabel, "Goal"],
              ].map(([v, l]) => (
                <div key={l} className="px-2 py-4">
                  <div className="truncate font-display text-base font-bold">{v}</div>
                  <div className="text-[11px] text-mute">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <GoalEditor current={user.fitnessGoal} />
          <LogoutButton />
        </div>

        <div className="space-y-5">
          {/* Quick links */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { href: "/account/orders", icon: Package, title: "Orders", desc: "Track, reorder, review" },
              { href: "/wishlist", icon: Heart, title: "Wishlist", desc: "Items you've saved" },
              { href: "/cart", icon: ShoppingCart, title: "Cart", desc: "Ready to checkout" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="card group flex items-center gap-3.5 p-4.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.09)]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-flame-tint text-flame"><l.icon size={18} /></span>
                <div>
                  <div className="text-sm font-bold group-hover:text-flame">{l.title}</div>
                  <div className="text-[11px] text-mute">{l.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent orders */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">Recent activity</h3>
              <Link href="/account/orders" className="text-xs font-bold text-flame">All orders</Link>
            </div>
            <div className="mt-4 space-y-3">
              {orders.length === 0 && (
                <div className="rounded-xl bg-sand p-5 text-center text-sm text-mute">
                  <MapPin size={18} className="mx-auto mb-2 text-flame" />
                  No orders yet — your history will appear here after your first checkout.
                </div>
              )}
              {orders.slice(0, 3).map((o) => (
                <Link key={o.id} href="/account/orders" className="flex items-center gap-3.5 rounded-xl border border-line p-3.5 transition-colors hover:border-flame/40">
                  <img src={o.items[0]?.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}</div>
                    <div className="text-[11px] text-mute">#{o.id.slice(0, 8).toUpperCase()} · {new Date(o.createdAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  </div>
                  <StatusPill status={o.status} />
                </Link>
              ))}
            </div>
          </div>

          <div className="card flex items-center gap-3 bg-flame-tint/50 p-5">
            <Sparkles size={18} className="shrink-0 text-flame" />
            <p className="text-sm">
              <span className="font-bold">Subscription reorders</span> are coming soon — auto-deliver your
              whey every 30 days and never run dry.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-azure/10 text-azure",
    shipped: "bg-violet-100 text-violet-700",
    delivered: "bg-leaf/15 text-leaf-dark",
    cancelled: "bg-chili/10 text-chili",
  };
  const label: Record<string, string> = { pending: "Placed (COD)", paid: "Paid", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${map[status] ?? "bg-sand text-mute"}`}>{label[status] ?? status}</span>;
}
