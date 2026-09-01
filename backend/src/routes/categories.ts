import { Router } from "express";
import { getCategories } from "../lib/shop.js";

const router = Router();

// GET /api/categories
router.get("/", async (_req, res) => {
  const categories = await getCategories();
  res.json({ categories });
});

export default router;
