import { getCategories } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ categories: await getCategories() });
}
