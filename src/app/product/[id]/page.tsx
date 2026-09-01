import { BadgeCheck, Flame, IndianRupee, MapPin, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product-card";
import { BuyBox, Gallery, PdpActions, ReviewForm, StickyMobileBar } from "@/components/pdp";
import { BadgePill, Price, SectionHead, Stars } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { formatCount, formatDate, GOALS } from "@/lib/money";
import { canReview, getCategories, getProductById, getRelatedProducts, getReviews } from "@/lib/shop";

export const dynamic = "force-dynamic";

function ratingSplit(avg: number): [number, number, number, number, number] {
  const five = Math.min(92, Math.max(30, Math.round((avg - 3.1) * 60)));
  const four = Math.min(100 - five, Math.max(4, Math.round((5 - Math.abs(avg - 4)) * 10)));
  const three = Math.max(2, Math.round((100 - five - four) * 0.6));
  const two = Math.max(1, Math.round((100 - five - four - three) * 0.7));
  const one = Math.max(0, 100 - five - four - three - two);
  return [five, four, three, two, one];
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const [cats, reviews, related, user] = await Promise.all([
    getCategories(),
    getReviews(product.id),
    getRelatedProducts(product),
    getSessionUser(),
  ]);
  const cat = cats.find((c) => c.id === product.categoryId);
  const rootCat = cat?.parentId ? cats.find((c) => c.id === cat.parentId) : cat;
  const eligible = user ? await canReview(user.id, product.id) : false;
  const split = ratingSplit(product.ratingAvg);
  const estDelivery = new Date(Date.now() + 4 * 86400000);
  const goalMatch = user?.fitnessGoal && product.goals.includes(user.fitnessGoal);
  const goalLabel = goalMatch
    ? (Object.values(GOALS) as readonly { key: string; label: string }[]).find((g) => g.key === user!.fitnessGoal)?.label
    : undefined;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 pb-32 sm:px-6 lg:py-8 lg:pb-10">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-mute">
        <Link href="/" className="hover:text-flame">Home</Link>
        <span>/</span>
        {rootCat && <Link href={`/products/${rootCat.slug}`} className="hover:text-flame">{rootCat.name}</Link>}
        {cat?.parentId && (
          <>
            <span>/</span>
            <Link href={`/products/${cat.slug}`} className="hover:text-flame">{cat.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="max-w-48 truncate font-semibold text-ink sm:max-w-none">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        {/* Gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Gallery images={product.images} name={product.name} />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold tracking-[0.16em] text-mute uppercase">{product.brand}</span>
              <h1 className="mt-1.5 font-display text-xl leading-snug font-bold sm:text-2xl lg:text-[28px]">{product.name}</h1>
            </div>
            <PdpActions productId={product.id} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <Stars rating={product.ratingAvg} />
            <span className="text-xs font-medium text-mute">{formatCount(product.ratingCount)} ratings</span>
            {product.sold >= 1500 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-flame-dark">
                <Flame size={12} /> {formatCount(product.sold)} bought this month
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {product.badgeTags.includes("bestseller") && <BadgePill tag="bestseller" />}
            {product.badgeTags.includes("new") && <BadgePill tag="new" />}
            {product.badgeTags.includes("flash") && <BadgePill tag="flash" />}
            {(product.stockQty > 0 && product.stockQty < 10) && <BadgePill tag="limited" />}
            {goalMatch && (
              <span className="chip !bg-flame-tint !text-flame-dark">Matches your goal: {goalLabel}</span>
            )}
          </div>

          <div className="mt-4 border-t border-b border-line py-4">
            <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
            <p className="mt-1 text-xs text-mute">Inclusive of all taxes</p>
          </div>

          <div className="mt-5">
            <BuyBox product={product} />
          </div>

          {/* Delivery card */}
          <div className="card mt-6 space-y-3 p-4.5 sm:p-5">
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={17} className="shrink-0 text-flame" />
              <span>Deliver to <span className="font-semibold">all pincodes in India</span></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck size={17} className="shrink-0 text-leaf-dark" />
              <span>Delivery by <span className="font-semibold">{formatDate(estDelivery)}</span> · {(product.discountPrice ?? product.price) >= 999 ? <span className="font-semibold text-leaf-dark">Free</span> : "₹49"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <IndianRupee size={17} className="shrink-0 text-flame" />
              <span>COD available · UPI, cards & netbanking accepted</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw size={17} className="shrink-0 text-mute" />
              <span className="text-mute">7-day easy returns on unopened items</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck size={17} className="shrink-0 text-leaf-dark" />
              <span className="text-mute">100% genuine — sourced only from verified brands</span>
            </div>
          </div>

          {/* Description + specs */}
          <div className="mt-7">
            <h3 className="font-display text-base font-bold">About this product</h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">{product.description}</p>
            <div className="card mt-4 overflow-hidden">
              {product.specs.map(([k, v], i) => (
                <div key={k} className={`grid grid-cols-[140px_1fr] gap-3 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-sand/60" : ""}`}>
                  <span className="font-semibold text-mute">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14 grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHead title="Ratings & reviews" />
          <div className="card p-5">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="font-display text-5xl font-bold">{product.ratingAvg.toFixed(1)}</div>
                <div className="mt-1 flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star key={v} size={14} className={v <= Math.round(product.ratingAvg) ? "fill-amber-400 text-amber-400" : "text-line"} />
                  ))}
                </div>
                <div className="mt-1.5 text-[11px] font-medium text-mute">{formatCount(product.ratingCount)} verified ratings</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star, i) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 font-semibold text-mute">{star}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/60">
                      <div className="h-full rounded-full bg-leaf" style={{ width: `${split[i]}%` }} />
                    </div>
                    <span className="w-7 text-right text-mute tabular-nums">{split[i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ReviewForm productId={product.id} canReview={eligible} loggedIn={Boolean(user)} />
          </div>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 && (
            <div className="card p-6 text-sm text-mute">No written reviews yet — be the first after your purchase.</div>
          )}
          {reviews.map((r) => (
            <article key={r.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-flame-tint font-display text-sm font-bold text-flame">
                    {r.userName.charAt(0)}
                  </span>
                  <div>
                    <div className="text-sm font-bold">{r.userName}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-mute">
                      <span className="inline-flex items-center gap-0.5 rounded bg-leaf px-1.5 py-0.5 font-bold text-white">
                        {r.rating} <Star size={9} className="fill-white" />
                      </span>
                      <BadgeCheck size={12} className="text-leaf-dark" /> Verified buyer
                    </div>
                  </div>
                </div>
                <time className="text-[11px] text-mute">{formatDate(r.createdAt ?? new Date())}</time>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mute">{r.comment}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHead title="You may also like" sub="More from this category" href={rootCat ? `/products/${rootCat.slug}` : "/products"} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <StickyMobileBar product={product} />
    </main>
  );
}
