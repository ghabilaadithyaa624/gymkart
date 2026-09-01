import { ArrowRight, BadgeCheck, Dumbbell, Flame, IndianRupee, Sparkles, Timer, Truck } from "lucide-react";
import Link from "next/link";
import FlashSaleTimer from "@/components/flash-sale-timer";
import ProductCard from "@/components/product-card";
import { SectionHead } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { GOALS } from "@/lib/money";
import { HERO_IMG } from "@/lib/seed-data";
import { getBestsellers, getCategories, getFlashDeals, getGoalPicks, getUnder999, queryProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let user: Awaited<ReturnType<typeof getSessionUser>> = null;
  try {
    user = await getSessionUser();
  } catch (err) {
    console.error("Session user fetch error:", err);
  }

  const [cats, bestsellers, flash, under999, starterKit] = await Promise.all([
    getCategories().catch((err) => {
      console.error("getCategories error:", err);
      return [];
    }),
    getBestsellers(10).catch((err) => {
      console.error("getBestsellers error:", err);
      return [];
    }),
    getFlashDeals(4).catch((err) => {
      console.error("getFlashDeals error:", err);
      return [];
    }),
    getUnder999(8).catch((err) => {
      console.error("getUnder999 error:", err);
      return [];
    }),
    queryProducts({ categorySlug: "equipment", sort: "rating", limit: 8 }).catch((err) => {
      console.error("starterKit error:", err);
      return { items: [], total: 0, brands: [] };
    }),
  ]);

  const roots = cats.filter((c) => !c.parentId);
  const goalPicks = user?.fitnessGoal
    ? await getGoalPicks(user.fitnessGoal, 8).catch(() => [])
    : [];
  const goalLabel = GOALS.find((g) => g.key === user?.fitnessGoal)?.label;


  return (
    <main>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-ink text-white">
        <img src={HERO_IMG} alt="Athlete training with kettlebells" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-white/90 uppercase backdrop-blur">
              <Flame size={13} className="text-flame" /> Big Fitness Fest — up to 60% off
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,4rem)] leading-[1.02] font-bold tracking-tight">
              Train hard.
              <br />
              <span className="text-flame">Shop smart.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              India's fitness-only marketplace — genuine supplements, pro-grade equipment and workout
              essentials, curated so you never scroll past junk again.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products?sort=bestseller" className="btn-primary !px-7 !py-3.5">
                Shop Bestsellers <ArrowRight size={16} />
              </Link>
              <Link href="/products/supplements" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 font-display text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                Explore Supplements
              </Link>
            </div>
            <div className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[["37+", "Curated products"], ["100%", "Genuine brands"], ["PAN-India", "COD & delivery"]].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-xl font-bold text-flame">{v}</div>
                  <div className="mt-0.5 text-[11px] text-white/60">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- PROMISE STRIP ---------------- */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-4 px-4 py-5 sm:grid-cols-4 sm:px-6">
          {[
            { icon: Truck, t: "Free delivery over ₹999", d: "Else flat ₹49" },
            { icon: IndianRupee, t: "Cash on Delivery", d: "Pay at your doorstep" },
            { icon: BadgeCheck, t: "100% genuine", d: "Verified brands only" },
            { icon: Timer, t: "3–5 day delivery", d: "Metro cities 2 days" },
          ].map((p) => (
            <div key={p.t} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-flame-tint text-flame"><p.icon size={19} /></span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold">{p.t}</div>
                <div className="truncate text-[11px] text-mute">{p.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6">
        {/* ---------------- CATEGORIES ---------------- */}
        <section>
          <SectionHead title="Shop by category" sub="Fitness-only. Zero clutter." href="/products" hrefLabel="All products" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
            {roots.map((c) => (
              <Link
                key={c.id}
                href={`/products/${c.slug}`}
                className="group relative aspect-[4/3.4] overflow-hidden rounded-xl border border-line"
              >
                <img src={c.image!} alt={`${c.name} — GymKart`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                  <div className="font-display text-[15px] font-bold text-white sm:text-lg">{c.name}</div>
                  <div className="mt-0.5 hidden text-[11px] text-white/70 sm:block">{c.tagline}</div>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-flame">
                    Shop now <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------- FLASH DEALS ---------------- */}
        {flash.length > 0 && (
          <section className="rounded-2xl bg-ink p-5 text-white sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-flame text-white"><Flame size={19} /></span>
                <div>
                  <h2 className="font-display text-xl font-bold sm:text-2xl">Flash Deals</h2>
                  <p className="text-xs text-white/60">Timed discounts — when it's gone, it's gone.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-chili/40 bg-chili/15 px-3 py-2 text-sm font-bold text-white sm:px-4">
                <span className="hidden text-red-300 sm:inline">Ends in</span>
                <FlashSaleTimer />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {flash.map((p) => (
                <ProductCard key={p.id} product={p} priority />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- BESTSELLERS ---------------- */}
        <section>
          <SectionHead title="Bestsellers" sub="What India is training with right now" href="/products?sort=bestseller" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {bestsellers.slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ---------------- GOAL PICKS ---------------- */}
        {user && goalPicks.length > 0 && (
          <section>
            <div className="mb-5 flex items-center gap-3">
              <span className="hidden h-8 w-1.5 rounded-full bg-flame sm:block" />
              <div>
                <h2 className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight sm:text-2xl">
                  <Sparkles size={20} className="text-flame" /> For your goal — {goalLabel}
                </h2>
                <p className="mt-0.5 text-xs text-mute sm:text-sm">Picked from your profile goal. Update it anytime in Account.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {goalPicks.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- STARTER KIT COLLECTION ---------------- */}
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-flame-tint text-flame"><Dumbbell size={19} /></span>
              <div>
                <h2 className="font-display text-xl font-bold sm:text-2xl">Home Gym Starter Kit</h2>
                <p className="text-xs text-mute sm:text-sm">Top-rated equipment to build your weekend setup — curated, not searched.</p>
              </div>
            </div>
            <Link href="/products/equipment" className="group inline-flex items-center gap-1 text-sm font-semibold text-flame">
              All equipment <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {starterKit.items.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ---------------- UNDER 999 ---------------- */}
        <section>
          <SectionHead title="Everything under ₹999" sub="Big gains, small bills" href="/products?maxPrice=999" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {under999.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
