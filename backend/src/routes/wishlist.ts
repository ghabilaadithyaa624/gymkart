import { Router } from "express";
import { getSessionUser } from "../lib/auth.js";
import { getWishlist, getWishlistIds, toggleWishlist } from "../lib/shop.js";
import { z } from "zod";

const router = Router();

// GET /api/wishlist — returns full product objects + ids
router.get("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  const [items, ids] = await Promise.all([getWishlist(user.id), getWishlistIds(user.id)]);
  res.json({ items, ids });
});

// POST /api/wishlist — toggle save/unsave
router.post("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  const parsed = z.object({ productId: z.string().uuid() }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "invalid" }); return; }
  const result = await toggleWishlist(user.id, parsed.data.productId);
  const ids = await getWishlistIds(user.id);
  res.json({ ...result, ids });
});

export default router;
