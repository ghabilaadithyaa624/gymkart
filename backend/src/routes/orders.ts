import { Router } from "express";
import { z } from "zod";
import { getSessionUser } from "../lib/auth.js";
import { getLastAddress, getOrders, placeOrder } from "../lib/shop.js";

const router = Router();

// GET /api/orders
router.get("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  const orders = await getOrders(user.id);
  const lastAddress = await getLastAddress(user.id);
  res.json({ orders, lastAddress });
});

const AddressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
});

const PlaceOrderBody = z.object({
  address: AddressSchema,
  paymentMethod: z.enum(["cod", "online"]),
});

// POST /api/orders
router.post("/", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  const parsed = PlaceOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "invalid", issues: parsed.error.flatten().fieldErrors });
    return;
  }
  const result = await placeOrder({ userId: user.id, ...parsed.data });
  if ("error" in result) { res.status(400).json({ error: result.error }); return; }
  res.json({ order: result.order });
});

export default router;
