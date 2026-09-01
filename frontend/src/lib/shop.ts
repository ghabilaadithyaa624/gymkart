import { serverFetch } from "./api";
import type {
  Address,
  CartLine,
  Category,
  CatalogQuery,
  OrderItem,
  OrderWithItems,
  Product,
  Review,
} from "./types";

export type {
  Address,
  CartLine,
  Category,
  CatalogQuery,
  OrderItem,
  OrderWithItems,
  Product,
  Review,
};

export async function getCategories(): Promise<Category[]> {
  const data = await serverFetch<{ categories: Category[] }>("/api/categories");
  return data?.categories ?? [];
}

export async function queryProducts(
  opts: CatalogQuery
): Promise<{ items: Product[]; total: number; brands: string[] }> {
  const sp = new URLSearchParams();
  if (opts.categorySlug) sp.set("category", opts.categorySlug);
  if (opts.q) sp.set("q", opts.q);
  if (opts.brands?.length) sp.set("brands", opts.brands.join(","));
  if (opts.minPrice != null) sp.set("minPrice", String(opts.minPrice));
  if (opts.maxPrice != null) sp.set("maxPrice", String(opts.maxPrice));
  if (opts.minRating != null) sp.set("minRating", String(opts.minRating));
  if (opts.sort) sp.set("sort", opts.sort);
  if (opts.ids?.length) sp.set("ids", opts.ids.join(","));
  if (opts.limit != null) sp.set("limit", String(opts.limit));

  const data = await serverFetch<{ items: Product[]; total: number; brands: string[] }>(
    `/api/products?${sp.toString()}`
  );
  return data ?? { items: [], total: 0, brands: [] };
}

export async function getProductById(id: string): Promise<Product | null> {
  const data = await serverFetch<{ product: Product; related: Product[] }>(`/api/products/${id}`);
  return data?.product ?? null;
}

export async function getRelatedProducts(product: Product, _limit = 4): Promise<Product[]> {
  const data = await serverFetch<{ product: Product; related: Product[] }>(`/api/products/${product.id}`);
  return data?.related ?? [];
}

export async function getBestsellers(limit = 8): Promise<Product[]> {
  const data = await serverFetch<{ items: Product[] }>(`/api/products/bestsellers?limit=${limit}`);
  return data?.items ?? [];
}

export async function getFlashDeals(limit = 4): Promise<Product[]> {
  const data = await serverFetch<{ items: Product[] }>(`/api/products/flash?limit=${limit}`);
  return data?.items ?? [];
}

export async function getUnder999(limit = 8): Promise<Product[]> {
  const data = await serverFetch<{ items: Product[] }>(`/api/products/under999?limit=${limit}`);
  return data?.items ?? [];
}

export async function getGoalPicks(goal: string, limit = 8): Promise<Product[]> {
  const data = await serverFetch<{ items: Product[] }>(
    `/api/products/goal-picks?goal=${encodeURIComponent(goal)}&limit=${limit}`
  );
  return data?.items ?? [];
}

export async function getReviews(productId: string, limit = 6): Promise<Review[]> {
  const data = await serverFetch<{ reviews: Review[] }>(
    `/api/reviews?productId=${productId}&limit=${limit}`
  );
  return data?.reviews ?? [];
}

export async function canReview(_userId: string, productId: string): Promise<boolean> {
  const data = await serverFetch<{ canReview: boolean }>(
    `/api/reviews/can-review?productId=${productId}`
  );
  return data?.canReview ?? false;
}

export async function getOrders(_userId: string): Promise<OrderWithItems[]> {
  const data = await serverFetch<{ orders: OrderWithItems[]; lastAddress: Address | null }>(
    "/api/orders"
  );
  return data?.orders ?? [];
}
