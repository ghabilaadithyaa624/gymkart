import CatalogView from "@/components/catalog";
import { getCategories } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === category);
  return { title: `${cat?.name ?? "Products"} — GymKart` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  return <CatalogView searchParams={await searchParams} categorySlug={category} />;
}
