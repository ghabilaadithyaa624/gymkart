import { BadgeCheck, Dumbbell, IndianRupee, Truck } from "lucide-react";
import Link from "next/link";

const SHOP_LINKS = [
  { label: "Equipment", href: "/products/equipment" },
  { label: "Supplements", href: "/products/supplements" },
  { label: "Apparel", href: "/products/apparel" },
  { label: "Accessories", href: "/products/accessories" },
  { label: "Wearables", href: "/products/wearables" },
  { label: "All Products", href: "/products" },
];

const HELP_LINKS = [
  { label: "Track your order", href: "/account/orders" },
  { label: "Your cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/signup" },
];

const PROMISES = [
  { icon: Truck, title: "PAN-India delivery", desc: "Free over ₹999" },
  { icon: IndianRupee, title: "COD available", desc: "Pay at your door" },
  { icon: BadgeCheck, title: "100% genuine", desc: "Verified brands only" },
];

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="flex items-center gap-1.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-flame text-white"><Dumbbell size={17} /></span>
              <span className="font-display text-lg font-bold">Gym<span className="text-flame">Kart</span></span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-mute">
              India's smart marketplace for fitness gear, supplements and gym essentials. Every listing earns
              attention — and your trust — in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold">Shop</h4>
            <ul className="mt-3 space-y-2">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-sm text-mute transition-colors hover:text-flame">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold">Account</h4>
            <ul className="mt-3 space-y-2">
              {HELP_LINKS.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-sm text-mute transition-colors hover:text-flame">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="space-y-3.5">
            {PROMISES.map((p) => (
              <div key={p.title} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-flame-tint text-flame"><p.icon size={17} /></span>
                <div>
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-mute">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-mute">
          <span>© {new Date().getFullYear()} GymKart. Train hard, shop smart.</span>
          <span>Secure payments · UPI · Cards · Netbanking · COD</span>
        </div>
      </div>
    </footer>
  );
}
