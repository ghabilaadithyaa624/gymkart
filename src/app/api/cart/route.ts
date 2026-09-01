import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { addToCart, getCart, mergeGuestCart, setCartQty } from "@/lib/shop";

export const dynamic = "force-dynamic";

async function requireUser() {
  return getSessionUser();
}

export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  return Response.json({ items: await getCart(user.id) });
}

const AddBody = z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(9).default(1) });

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  const url = new URL(req.url);
  if (url.searchParams.get("sync") === "1") {
    const SyncBody = z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(10) }));
    const parsed = SyncBody.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid" }, { status: 422 });
    return Response.json({ items: await mergeGuestCart(user.id, parsed.data) });
  }
  const parsed = AddBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 422 });
  return Response.json({ items: await addToCart(user.id, parsed.data.productId, parsed.data.qty) });
}

const PatchBody = z.object({ productId: z.string().uuid(), qty: z.number().int().min(0).max(10) });

export async function PATCH(req: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 422 });
  return Response.json({ items: await setCartQty(user.id, parsed.data.productId, parsed.data.qty) });
}

const DeleteBody = z.object({ productId: z.string().uuid() });

export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  const parsed = DeleteBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 422 });
  return Response.json({ items: await setCartQty(user.id, parsed.data.productId, 0) });
}
