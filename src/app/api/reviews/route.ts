import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { addReview } from "@/lib/shop";

export const dynamic = "force-dynamic";

const Body = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(4, "Tell us a little more").max(600),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  const result = await addReview({ userId: user.id, userName: user.name, ...parsed.data });
  if ("error" in result) return Response.json({ error: "not_allowed", message: result.error }, { status: 403 });
  return Response.json(result);
}
