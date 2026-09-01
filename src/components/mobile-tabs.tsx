"use client";

import { LayoutGrid, ShoppingCart, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { selectCartCount, useGK } from "@/lib/store";

const TABS = [
  { href: "/", label: "Home", icon: Zap },
  { href: "/products", label: "Categories", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account", label: "Account", icon: UserRound },
];

export default function MobileTabs() {
  const pathname = usePathname();
  const cartCount = useGK(selectCartCount);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-white/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href} className="relative flex flex-col items-center gap-1 py-2.5">
              <span className="relative">
                <Icon size={21} className={active ? "text-flame" : "text-mute"} strokeWidth={active ? 2.4 : 2} />
                {t.label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 animate-pop place-items-center rounded-full bg-flame px-1 text-[9px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-semibold ${active ? "text-flame" : "text-mute"}`}>{t.label}</span>
              {active && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-flame" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
