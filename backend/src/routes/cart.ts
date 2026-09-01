import { Router } from "express";
import { z } from "zod";
import { getSessionUser } from "../lib/auth.js";
import { addToCart, getCart, mergeGuestCart, setCartQty } from "../lib/shop.js";

const router = Router();

// GET /api/cart
router.get("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  res.json({ items: await getCart(user.id) });
});

const AddBody = z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(9).default(1) });

// POST /api/cart  (also handles ?sync=1 for guest cart merge)
router.post("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }

  if (req.query.sync === "1") {
    const SyncBody = z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(10) }));
    const parsed = SyncBody.safeParse(req.body);
    if (!parsed.success) { res.status(422).json({ error: "invalid" }); return; }
    res.json({ items: await mergeGuestCart(user.id, parsed.data) });
    return;
  }

  const parsed = AddBody.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "invalid" }); return; }
  res.json({ items: await addToCart(user.id, parsed.data.productId, parsed.data.qty) });
});

const PatchBody = z.object({ productId: z.string().uuid(), qty: z.number().int().min(0).max(10) });

// PATCH /api/cart
router.patch("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  const parsed = PatchBody.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "invalid" }); return; }
  res.json({ items: await setCartQty(user.id, parsed.data.productId, parsed.data.qty) });
});

// DELETE /api/cart
router.delete("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  const parsed = z.object({ productId: z.string().uuid() }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "invalid" }); return; }
  res.json({ items: await setCartQty(user.id, parsed.data.productId, 0) });
});

export default router;
