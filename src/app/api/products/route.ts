import { queryProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const ids = sp.get("ids")?.split(",").filter(Boolean);
  const brands = sp.get("brands")?.split(",").filter(Boolean);
  const num = (k: string) => {
    const v = sp.get(k);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const result = await queryProducts({
    categorySlug: sp.get("category") ?? undefined,
    q: sp.get("q") ?? undefined,
    brands: brands?.length ? brands : undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minRating: num("minRating"),
    sort: sp.get("sort") ?? undefined,
    ids: ids?.length ? ids : undefined,
    limit: num("limit"),
  });
  return Response.json(result);
}
