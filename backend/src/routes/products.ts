import { Router } from "express";
import {
  getBestsellers,
  getFlashDeals,
  getGoalPicks,
  getProductById,
  getRelatedProducts,
  getUnder999,
  queryProducts,
} from "../lib/shop.js";

const router = Router();

// GET /api/products/bestsellers
router.get("/bestsellers", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const items = await getBestsellers(limit);
  res.json({ items });
});

// GET /api/products/flash
router.get("/flash", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 4;
  const items = await getFlashDeals(limit);
  res.json({ items });
});

// GET /api/products/under999
router.get("/under999", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const items = await getUnder999(limit);
  res.json({ items });
});

// GET /api/products/goal-picks
router.get("/goal-picks", async (req, res) => {
  const goal = req.query.goal as string;
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  if (!goal) {
    res.json({ items: [] });
    return;
  }
  const items = await getGoalPicks(goal, limit);
  res.json({ items });
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const related = await getRelatedProducts(product, 4);
  res.json({ product, related });
});

// GET /api/products
router.get("/", async (req, res) => {
  const ids = (req.query.ids as string)?.split(",").filter(Boolean);
  const brands = (req.query.brands as string)?.split(",").filter(Boolean);
  const num = (v: unknown) => {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const result = await queryProducts({
    categorySlug: (req.query.category as string) ?? undefined,
    q: (req.query.q as string) ?? undefined,
    brands: brands?.length ? brands : undefined,
    minPrice: num(req.query.minPrice),
    maxPrice: num(req.query.maxPrice),
    minRating: num(req.query.minRating),
    sort: (req.query.sort as string) ?? undefined,
    ids: ids?.length ? ids : undefined,
    limit: num(req.query.limit),
  });
  res.json(result);
});

export default router;
