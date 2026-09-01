import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getWishlist, toggleWishlist } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  return Response.json({ items: await getWishlist(user.id) });
}

const Body = z.object({ productId: z.string().uuid() });

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 422 });
  const result = await toggleWishlist(user.id, parsed.data.productId);
  return Response.json({ ...result, items: await getWishlist(user.id) });
}
