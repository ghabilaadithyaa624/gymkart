import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import {
  cartItems,
  categories,
  orderItems,
  orders,
  products,
  reviews,
  users,
  wishlistItems,
  type Address,
} from "@/db/schema";
import { REVIEW_SNIPPETS, SEED_CATEGORIES, SEED_PRODUCTS, SEED_REVIEW_PRODUCTS } from "./seed-data";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, sellingPrice } from "./money";

export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;

/* ------------------------------------------------------------------ */
/* Seeding                                                             */
/* ------------------------------------------------------------------ */

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  try {
    const existing = await db.select({ id: products.id }).from(products).limit(1);
    if (existing.length === 0) {
      await db.insert(categories).values(SEED_CATEGORIES).onConflictDoNothing();
      const inserted = await db
        .insert(products)
        .values(
          SEED_PRODUCTS.map((p) => ({
            name: p.name,
            description: p.description,
            categoryId: p.categoryId,
            price: p.price,
            discountPrice: p.discountPrice,
            stockQty: p.stockQty,
            brand: p.brand,
            images: p.images,
            badgeTags: p.badgeTags,
            specs: p.specs,
            goals: p.goals,
            ratingAvg: p.ratingAvg,
            ratingCount: p.ratingCount,
            sold: p.sold,
          })),
        )
        .returning({ id: products.id, name: products.name });
      // Map seeded reviews onto flagship products (by seed order).
      const nameToId = new Map(inserted.map((r) => [r.name, r.id]));
      const reviewRows: Array<typeof reviews.$inferInsert> = [];
      SEED_PRODUCTS.forEach((p, idx) => {
        if (!SEED_REVIEW_PRODUCTS.includes(p.key)) return;
        const pid = nameToId.get(p.name);
        if (!pid) return;
        const pack = REVIEW_SNIPPETS[idx % REVIEW_SNIPPETS.length];
        pack.names.forEach((n, i) => {
          reviewRows.push({
            productId: pid,
            userId: null,
            userName: n,
            rating: i === 2 ? 4 : 5,
            comment: pack.comments[i],
          });
        });
      });
      if (reviewRows.length) await db.insert(reviews).values(reviewRows);
      // Demo account + seeded order history (powers tracking & verified reviews)
      const demo = await db.select({ id: users.id }).from(users).where(eq(users.email, "demo@gymkart.in")).limit(1);
      if (demo.length === 0) {
        const [demoUser] = await db
          .insert(users)
          .values({
            name: "Rohan Kapoor",
            email: "demo@gymkart.in",
            passwordHash: bcrypt.hashSync("demo1234", 10),
            fitnessGoal: "muscle_gain",
          })
          .returning({ id: users.id });
        const byKey = new Map(SEED_PRODUCTS.map((p) => [p.key, nameToId.get(p.name)]));
        const pick = (k: string) => byKey.get(k);
        const demoAddress: Address = {
          name: "Rohan Kapoor",
          phone: "9876543210",
          line1: "42, 3rd Cross, HSR Layout Sector 2",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560102",
        };
        const mkItem = (key: string, qty: number) => {
          const p = SEED_PRODUCTS.find((s) => s.key === key)!;
          return { productId: pick(key)!, name: p.name, image: p.images[0], quantity: qty, priceAtPurchase: p.discountPrice ?? p.price };
        };
        const d1 = mkItem("p30", 1);
        const d2 = mkItem("p26", 1);
        const [o1] = await db
          .insert(orders)
          .values({
            userId: demoUser.id,
            totalAmount: d1.priceAtPurchase + d2.priceAtPurchase,
            shippingFee: 0,
            status: "delivered",
            paymentMethod: "cod",
            address: demoAddress,
            createdAt: new Date(Date.now() - 10 * 86400000),
          })
          .returning({ id: orders.id });
        await db.insert(orderItems).values([d1, d2].map((i) => ({ ...i, orderId: o1.id })));
        const d3 = mkItem("p15", 2);
        const [o2] = await db
          .insert(orders)
          .values({
            userId: demoUser.id,
            totalAmount: d3.priceAtPurchase * 2 + SHIPPING_FEE,
            shippingFee: SHIPPING_FEE,
            status: "paid",
            paymentMethod: "online",
            address: demoAddress,
            createdAt: new Date(Date.now() - 2 * 86400000),
          })
          .returning({ id: orders.id });
        await db.insert(orderItems).values([{ ...d3, orderId: o2.id }]);
      }
    }
    seeded = true;
  } catch {
    // schema not pushed yet — surfaces on first real call
  }
}

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  try {
    await ensureSeeded();
    return await db.select().from(categories).orderBy(categories.sortOrder);
  } catch (err) {
    console.error("getCategories error:", err);
    return [];
  }
}

export async function categoryIdsForSlug(slug: string): Promise<number[]> {
  const cats = await getCategories();
  const root = cats.find((c) => c.slug === slug);
  if (!root) return [];
  return [root.id, ...cats.filter((c) => c.parentId === root.id).map((c) => c.id)];
}

export type CatalogQuery = {
  categorySlug?: string;
  q?: string;
  goal?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  ids?: string[];
  limit?: number;
};

const PRICE_COL = sql`coalesce(${products.discountPrice}, ${products.price})`;

export async function queryProducts(opts: CatalogQuery): Promise<{ items: Product[]; total: number; brands: string[] }> {
  try {
    await ensureSeeded();
    const cond = [];

    if (opts.ids?.length) {
      cond.push(inArray(products.id, opts.ids));
    }
    if (opts.categorySlug) {
      const ids = await categoryIdsForSlug(opts.categorySlug);
      if (ids.length === 0) return { items: [], total: 0, brands: await getBrands() };
      cond.push(inArray(products.categoryId, ids));
    }
    if (opts.q) {
      const like = `%${opts.q}%`;
      cond.push(or(ilike(products.name, like), ilike(products.brand, like), ilike(products.description, like)));
    }
    if (opts.goal === "home_gym") {
      const equipmentIds = await categoryIdsForSlug("equipment");
      cond.push(inArray(products.categoryId, equipmentIds));
      cond.push(lte(PRICE_COL, 5000));
    } else if (opts.goal === "budget_essentials") {
      cond.push(lte(PRICE_COL, 999));
    } else if (opts.goal) {
      const goalAliases: Record<string, string> = {
        bulking: "muscle_gain",
        lean_muscle: "muscle_gain",
        fat_loss: "weight_loss",
        home_workout: "general_fitness",
        endurance: "general_fitness",
      };
      const mappedGoal = goalAliases[opts.goal] ?? opts.goal;
      cond.push(sql`${products.goals} @> ${JSON.stringify([mappedGoal])}::jsonb`);
    }
    if (opts.brands?.length) cond.push(inArray(products.brand, opts.brands));
    if (opts.minPrice != null) cond.push(gte(PRICE_COL, opts.minPrice));
    if (opts.maxPrice != null) cond.push(lte(PRICE_COL, opts.maxPrice));
    if (opts.minRating != null) cond.push(gte(products.ratingAvg, opts.minRating));

    const where = cond.length ? and(...cond) : undefined;

    const order =
      opts.sort === "price_low"
        ? [asc(PRICE_COL)]
        : opts.sort === "price_high"
          ? [desc(PRICE_COL)]
          : opts.sort === "newest"
            ? [desc(products.createdAt)]
            : opts.sort === "rating"
              ? [desc(products.ratingAvg)]
              : [desc(products.sold)]; // bestseller default

    const [items, countRows, brandRows] = await Promise.all([
      db.select().from(products).where(where).orderBy(...order).limit(opts.limit ?? 200),
      db.select({ n: sql<number>`count(*)::int` }).from(products).where(where),
      getBrands(),
    ]);
    return { items, total: countRows[0]?.n ?? 0, brands: brandRows };
  } catch (err) {
    console.error("queryProducts error:", err);
    return { items: [], total: 0, brands: [] };
  }
}

export async function getBrands(): Promise<string[]> {
  try {
    const rows = await db.selectDistinct({ brand: products.brand }).from(products).orderBy(products.brand);
    return rows.map((r) => r.brand);
  } catch {
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    await ensureSeeded();
    const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error("getProductById error:", err);
    return null;
  }
}

export async function getRelatedProducts(product: Product, limit = 4) {
  try {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, product.categoryId), sql`${products.id} != ${product.id}`))
      .orderBy(desc(products.ratingAvg))
      .limit(limit);
    return rows;
  } catch {
    return [];
  }
}

export async function getBestsellers(limit = 8) {
  try {
    await ensureSeeded();
    return await db.select().from(products).orderBy(desc(products.sold)).limit(limit);
  } catch (err) {
    console.error("getBestsellers error:", err);
    return [];
  }
}

export async function getFlashDeals(limit = 4) {
  try {
    await ensureSeeded();
    return await db
      .select()
      .from(products)
      .where(sql`${products.badgeTags} @> '["flash"]'::jsonb`)
      .orderBy(desc(products.sold))
      .limit(limit);
  } catch (err) {
    console.error("getFlashDeals error:", err);
    return [];
  }
}

export async function getUnder999(limit = 8) {
  try {
    await ensureSeeded();
    return await db.select().from(products).where(lte(PRICE_COL, 999)).orderBy(desc(products.sold)).limit(limit);
  } catch (err) {
    console.error("getUnder999 error:", err);
    return [];
  }
}

export async function getGoalPicks(goal: string, limit = 8) {
  try {
    await ensureSeeded();
    return await db
      .select()
      .from(products)
      .where(sql`${products.goals} @> ${JSON.stringify([goal])}::jsonb`)
      .orderBy(desc(products.ratingAvg))
      .limit(limit);
  } catch (err) {
    console.error("getGoalPicks error:", err);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export type CartLine = { id: string; productId: string; quantity: number; product: Product };

export async function getCart(userId: string): Promise<CartLine[]> {
  const rows = await db
    .select({ id: cartItems.id, productId: cartItems.productId, quantity: cartItems.quantity, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
  return rows;
}

export async function addToCart(userId: string, productId: string, qty: number) {
  await db
    .insert(cartItems)
    .values({ userId, productId, quantity: qty })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId],
      set: { quantity: sql`least(${cartItems.quantity} + ${qty}, 10)` },
    });
  return getCart(userId);
}

export async function setCartQty(userId: string, productId: string, qty: number) {
  if (qty <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity: Math.min(qty, 10) })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  }
  return getCart(userId);
}

export async function mergeGuestCart(userId: string, items: Array<{ productId: string; qty: number }>) {
  for (const item of items) {
    const exists = await db.select({ id: products.id }).from(products).where(eq(products.id, item.productId)).limit(1);
    if (!exists.length) continue;
    await db
      .insert(cartItems)
      .values({ userId, productId: item.productId, quantity: Math.min(item.qty, 10) })
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.productId],
        set: { quantity: sql`least(${cartItems.quantity} + ${Math.min(item.qty, 10)}, 10)` },
      });
  }
  return getCart(userId);
}

/* ------------------------------------------------------------------ */
/* Wishlist                                                            */
/* ------------------------------------------------------------------ */

export async function getWishlistIds(userId: string): Promise<string[]> {
  const rows = await db.select({ productId: wishlistItems.productId }).from(wishlistItems).where(eq(wishlistItems.userId, userId));
  return rows.map((r) => r.productId);
}

export async function getWishlist(userId: string) {
  return db
    .select({ id: wishlistItems.id, product: products })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));
}

export async function toggleWishlist(userId: string, productId: string): Promise<{ saved: boolean }> {
  const existing = await db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
    .limit(1);
  if (existing.length) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing[0].id));
    return { saved: false };
  }
  await db.insert(wishlistItems).values({ userId, productId });
  return { saved: true };
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type OrderWithItems = typeof orders.$inferSelect & { items: Array<typeof orderItems.$inferSelect> };

export async function placeOrder(input: {
  userId: string;
  address: Address;
  paymentMethod: "cod" | "online";
}): Promise<{ order: typeof orders.$inferSelect } | { error: string }> {
  const cart = await getCart(input.userId);
  if (cart.length === 0) return { error: "Your cart is empty." };
  for (const line of cart) {
    if (line.product.stockQty < line.quantity) {
      return { error: `"${line.product.name}" is out of stock. Remove it to continue.` };
    }
  }

  const subtotal = cart.reduce((a, l) => a + sellingPrice(l.product) * l.quantity, 0);
  const fee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + fee;

  const order = await db.transaction(async (tx) => {
    for (const line of cart) {
      const updated = await tx
        .update(products)
        .set({ stockQty: sql`${products.stockQty} - ${line.quantity}` })
        .where(and(eq(products.id, line.productId), gte(products.stockQty, line.quantity)))
        .returning({ id: products.id });
      if (!updated.length) throw new Error("stock_race");
    }
    const inserted = await tx
      .insert(orders)
      .values({
        userId: input.userId,
        totalAmount: total,
        shippingFee: fee,
        status: input.paymentMethod === "online" ? "paid" : "pending",
        paymentMethod: input.paymentMethod,
        address: input.address,
      })
      .returning();
    await tx.insert(orderItems).values(
      cart.map((l) => ({
        orderId: inserted[0].id,
        productId: l.productId,
        name: l.product.name,
        image: l.product.images[0] ?? "",
        quantity: l.quantity,
        priceAtPurchase: sellingPrice(l.product),
      })),
    );
    await tx.delete(cartItems).where(eq(cartItems.userId, input.userId));
    return inserted[0];
  });
  return { order };
}

export async function getOrders(userId: string): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  const withItems: OrderWithItems[] = [];
  for (const o of rows) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
    withItems.push({ ...o, items });
  }
  return withItems;
}

export async function getLastAddress(userId: string): Promise<Address | null> {
  const rows = await db
    .select({ address: orders.address })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(1);
  return rows[0]?.address ?? null;
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function getReviews(productId: string, limit = 6) {
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt)).limit(limit);
}

export async function canReview(userId: string, productId: string): Promise<boolean> {
  const rows = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.userId, userId), eq(orderItems.productId, productId), sql`${orders.status} != 'cancelled'`))
    .limit(1);
  return rows.length > 0;
}

export async function addReview(input: { userId: string; userName: string; productId: string; rating: number; comment: string }) {
  const purchased = await canReview(input.userId, input.productId);
  if (!purchased) return { error: "You can only review products you've purchased." };
  await db
    .insert(reviews)
    .values({
      productId: input.productId,
      userId: input.userId,
      userName: input.userName,
      rating: input.rating,
      comment: input.comment,
    })
    .onConflictDoUpdate({
      target: [reviews.productId, reviews.userId],
      set: { rating: input.rating, comment: input.comment, createdAt: new Date() },
    });
  // Incremental denormalized rating update
  await db
    .update(products)
    .set({
      ratingAvg: sql`((${products.ratingAvg} * ${products.ratingCount} + ${input.rating}) / (${products.ratingCount} + 1))`,
      ratingCount: sql`${products.ratingCount} + 1`,
    })
    .where(eq(products.id, input.productId));
  return { ok: true, reviews: await getReviews(input.productId) };
}
