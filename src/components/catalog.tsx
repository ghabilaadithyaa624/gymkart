import { SearchX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import FilterPanel, { SortSelect } from "./filter-panel";
import GoalFilterBar from "./goal-filter-bar";
import ProductCard from "./product-card";
import { getCategories, queryProducts, type Product } from "@/lib/shop";

export default async function CatalogView({
  searchParams,
  categorySlug,
  q,
  title,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  categorySlug?: string;
  q?: string;
  title?: string;
}) {
  const str = (k: string) => {
    const v = searchParams[k];
    return typeof v === "string" ? v : undefined;
  };
  const num = (k: string) => {
    const v = str(k);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };

  const cats = await getCategories();
  const roots = cats.filter((c) => !c.parentId).map((c) => ({ name: c.name, slug: c.slug }));
  const activeCat = categorySlug ? cats.find((c) => c.slug === categorySlug) : undefined;
  const activeRoot = activeCat ? (activeCat.parentId ? cats.find((c) => c.id === activeCat.parentId)! : activeCat) : undefined;
  const subcats = activeRoot ? cats.filter((c) => c.parentId === activeRoot.id).map((c) => ({ name: c.name, slug: c.slug })) : [];

  const brands = (str("brands") ?? "").split(",").filter(Boolean);
  const { items, total, brands: allBrands } = await queryProducts({
    categorySlug,
    q,
    goal: str("goal"),
    brands: brands.length ? brands : undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minRating: num("minRating"),
    sort: str("sort") ?? "bestseller",
  });

  const current: Record<string, string> = {};
  for (const k of ["sort", "goal", "brands", "minPrice", "maxPrice", "minRating", "q"]) {
    const v = str(k);
    if (v) current[k] = v;
  }

  const basePath = q != null ? "/search" : categorySlug ? `/products/${categorySlug}` : "/products";
  const heading = q != null ? `Results for “${q}”` : title ?? activeRoot?.name ?? "All Products";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-mute">
        <Link href="/" className="hover:text-flame">Home</Link>
        <span>/</span>
        {activeRoot && (
          <>
            <Link href={`/products/${activeRoot.slug}`} className={activeCat?.parentId ? "hover:text-flame" : "font-semibold text-ink"}>
              {activeRoot.name}
            </Link>
            {activeCat?.parentId && (
              <>
                <span>/</span>
                <span className="font-semibold text-ink">{activeCat.name}</span>
              </>
            )}
          </>
        )}
        {q != null && <span className="font-semibold text-ink">Search</span>}
        {!activeRoot && q == null && <span className="font-semibold text-ink">All Products</span>}
      </nav>

      {!categorySlug && q == null && (
        <Suspense fallback={<div className="mb-6 h-[76px] animate-pulse rounded-2xl bg-ink" />}>
          <GoalFilterBar />
        </Suspense>
      )}

      <div className="flex gap-8">
        <FilterPanel
          basePath={basePath}
          current={current}
          brands={allBrands}
          roots={roots}
          subcats={subcats}
          categorySlug={activeRoot?.slug}
          resultCount={total}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-5 hidden items-end justify-between gap-4 lg:flex">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{heading}</h1>
              <p className="mt-1 text-sm text-mute">{total} products</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-mute">
              Sort by
              <SortSelect current={current} basePath={basePath} />
            </div>
          </div>

          {items.length === 0 ? (
            <div className="card mx-auto flex max-w-lg flex-col items-center px-8 py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-flame-tint text-flame">
                <SearchX size={30} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">
                {q ? `No results for “${q}”` : "No products match those filters"}
              </h3>
              <p className="mt-1.5 text-sm text-mute">Try widening your price range or removing a brand filter.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                <Link href={basePath} className="btn-primary">Clear filters</Link>
                {q != null && <Link href="/products/supplements" className="btn-ghost">Browse supplements</Link>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {items.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
