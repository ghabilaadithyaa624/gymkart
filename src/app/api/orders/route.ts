import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getOrders, placeOrder } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  return Response.json({ orders: await getOrders(user.id) });
}

const AddressBody = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().min(6),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

const Body = z.object({
  address: AddressBody,
  paymentMethod: z.enum(["cod", "online"]),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  try {
    const result = await placeOrder({ userId: user.id, ...parsed.data });
    if ("error" in result) return Response.json({ error: "order_failed", message: result.error }, { status: 409 });
    return Response.json(result);
  } catch {
    return Response.json({ error: "stock_race", message: "An item just went out of stock. Please review your cart." }, { status: 409 });
  }
}
