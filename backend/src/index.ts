import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import { ensureSeeded } from "./lib/shop.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import ordersRoutes from "./routes/orders.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import reviewsRoutes from "./routes/reviews.js";

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS config supporting cross-origin cookies
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl/server-side fetch)
      if (!origin) return callback(null, true);
      if (origin === FRONTEND_URL || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/reviews", reviewsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root ping
app.get("/", (_req, res) => {
  res.send("GymKart Backend API is running. Explore endpoints under /api/*");
});

async function start() {
  try {
    await ensureSeeded();
    console.log("✓ Database check/seeding complete");
  } catch (err) {
    console.warn("⚠️ Warning: Initial database seed encountered an error:", err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 GymKart Backend listening on http://localhost:${PORT}`);
  });
}

start();
