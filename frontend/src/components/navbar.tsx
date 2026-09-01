"use client";

import { Dumbbell, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { selectCartCount, useGK } from "@/lib/store";

type NavCategory = { id: number; name: string; slug: string; parentId: number | null };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useGK((s) => s.user);
  const cartCount = useGK(selectCartCount);
  const wishCount = useGK((s) => s.wishlistIds.length);
  const bootstrap = useGK((s) => s.bootstrap);
  const [cats, setCats] = useState<NavCategory[]>([]);
  const [q, setQ] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((b) => setCats((b.categories ?? []).filter((c: NavCategory) => !c.parentId)))
      .catch(() => undefined);
  }, []);
  useEffect(() => { setMenu(false); setMobileSearch(false); }, [pathname]);
  useEffect(() => { if (mobileSearch) inputRef.current?.focus(); }, [mobileSearch]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/products");
    setMobileSearch(false);
  };

  return (
    <header className="sticky top-0 z-[60] border-b border-line bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-flame text-white">
            <Dumbbell size={17} />
          </span>
          <span className="font-display text-[19px] font-bold tracking-tight">
            Gym<span className="text-flame">Kart</span>
          </span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={submit} className="hidden min-w-0 flex-1 md:block">
          <div className="relative mx-auto max-w-xl">
            <Search size={17} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search whey protein, dumbbells, resistance bands…"
              className="input !rounded-full !py-2.5 !pl-11"
              aria-label="Search products"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Mobile search toggle */}
          <button onClick={() => setMobileSearch((v) => !v)} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-xl text-ink transition-colors hover:bg-sand md:hidden">
            {mobileSearch ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link href="/wishlist" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center rounded-xl text-ink transition-colors hover:bg-sand">
            <Heart size={20} className={wishCount > 0 ? "fill-flame text-flame" : ""} />
            {wishCount > 0 && <BadgeDot n={wishCount} />}
          </Link>

          <Link href="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-xl text-ink transition-colors hover:bg-sand">
            <ShoppingCart size={20} />
            {cartCount > 0 && <BadgeDot n={cartCount} />}
          </Link>

          {user ? (
            <Link href="/account" className="hidden items-center gap-2 rounded-xl border border-line py-2 pr-3.5 pl-2.5 transition-colors hover:border-flame sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-flame text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-24 truncate text-sm font-semibold">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="btn-primary hidden !rounded-full !px-5 !py-2 sm:inline-flex">
              <User size={15} /> Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search row */}
      {mobileSearch && (
        <form onSubmit={submit} className="border-t border-line px-4 py-2.5 md:hidden">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mute" />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input !rounded-full !py-2.5 !pl-10" aria-label="Search products" />
          </div>
        </form>
      )}

      {/* Category strip — desktop */}
      <nav className="hidden border-t border-line lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/products/${c.slug}`}
              className={`border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                pathname === `/products/${c.slug}` ? "border-flame text-flame" : "border-transparent text-mute hover:text-ink"
              }`}
            >
              {c.name}
            </Link>
          ))}
          <Link href="/products" className={`border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${pathname === "/products" ? "border-flame text-flame" : "border-transparent text-mute hover:text-ink"}`}>
            All Products
          </Link>
        </div>
      </nav>

      {/* Mobile categories hamburger (kept minimal: categories live in bottom tab) */}
      <button onClick={() => setMenu((v) => !v)} className="hidden" aria-hidden>
        <Menu />
      </button>
    </header>
  );
}

function BadgeDot({ n }: { n: number }) {
  return (
    <span key={n} className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-flame px-1 text-[10px] font-bold text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}
