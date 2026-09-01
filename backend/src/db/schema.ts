import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  fitnessGoal: text("fitness_goal"), // weight_loss | muscle_gain | general_fitness
  role: text("role").notNull().default("customer"), // customer | admin
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  tagline: text("tagline"),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    categoryId: integer("category_id").notNull(),
    price: integer("price").notNull(), // MRP in INR
    discountPrice: integer("discount_price"), // selling price in INR
    stockQty: integer("stock_qty").notNull().default(0),
    brand: text("brand").notNull(),
    images: jsonb("images").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    badgeTags: jsonb("badge_tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    specs: jsonb("specs").$type<[string, string][]>().notNull().default(sql`'[]'::jsonb`),
    goals: jsonb("goals").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    ratingAvg: real("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    sold: integer("sold").notNull().default(0), // velocity → social proof
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_name_idx").on(t.name),
    index("products_brand_idx").on(t.brand),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    productId: uuid("product_id").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("cart_user_product_idx").on(t.userId, t.productId), index("cart_user_idx").on(t.userId)],
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    productId: uuid("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("wishlist_user_product_idx").on(t.userId, t.productId)],
);

export type Address = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    totalAmount: integer("total_amount").notNull(),
    shippingFee: integer("shipping_fee").notNull().default(0),
    status: text("status").notNull().default("pending"), // pending | paid | shipped | delivered | cancelled
    paymentMethod: text("payment_method").notNull(), // cod | online
    address: jsonb("address").$type<Address>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("orders_user_idx").on(t.userId)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id").notNull(),
    productId: uuid("product_id").notNull(),
    name: text("name").notNull(), // snapshot
    image: text("image").notNull(), // snapshot
    quantity: integer("quantity").notNull(),
    priceAtPurchase: integer("price_at_purchase").notNull(), // snapshot
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: uuid("product_id").notNull(),
    userId: uuid("user_id"),
    userName: text("user_name").notNull(),
    rating: integer("rating").notNull(), // 1..5
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("reviews_product_idx").on(t.productId),
    uniqueIndex("reviews_product_user_idx").on(t.productId, t.userId),
  ],
);
