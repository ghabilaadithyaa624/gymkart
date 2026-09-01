import CatalogView from "@/components/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "All Products — GymKart" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CatalogView searchParams={await searchParams} />;
}
