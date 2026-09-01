import { Router } from "express";
import { z } from "zod";
import { getSessionUser } from "../lib/auth.js";
import { addReview, canReview, getReviews } from "../lib/shop.js";

const router = Router();

// GET /api/reviews?productId=...
router.get("/", async (req, res) => {
  const productId = req.query.productId as string;
  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }
  const limit = req.query.limit ? Number(req.query.limit) : 6;
  const reviews = await getReviews(productId, limit);
  res.json({ reviews });
});

// GET /api/reviews/can-review?productId=...
router.get("/can-review", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.json({ canReview: false });
    return;
  }
  const productId = req.query.productId as string;
  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }
  const allowed = await canReview(user.id, productId);
  res.json({ canReview: allowed });
});

const ReviewBody = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(4, "Tell us a little more").max(600),
});

// POST /api/reviews
router.post("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "auth" });
    return;
  }
  const parsed = ReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "invalid", issues: parsed.error.flatten().fieldErrors });
    return;
  }
  const result = await addReview({
    userId: user.id,
    userName: user.name,
    ...parsed.data,
  });
  if ("error" in result) {
    res.status(403).json({ error: "not_allowed", message: result.error });
    return;
  }
  res.json(result);
});

export default router;
